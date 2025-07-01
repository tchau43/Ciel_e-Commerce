const mongoose = require('mongoose');
const Review = require('../models/review');
const Invoice = require('../models/invoice');
const { Product } = require('../models/product');

const canUserReviewProduct = async (userId, productId, variantId, invoiceId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId) ||
            !mongoose.Types.ObjectId.isValid(productId) ||
            !mongoose.Types.ObjectId.isValid(invoiceId)) {
            console.warn(`Invalid ID format passed to canUserReviewProduct`);
            return false;
        }

        const invoice = await Invoice.findOne({
            _id: invoiceId,
            user: userId,
            orderStatus: 'delivered'
        }).lean();

        if (!invoice) return false;

        const itemMatchCriteria = {
            product: new mongoose.Types.ObjectId(productId)
        };

        if (variantId && mongoose.Types.ObjectId.isValid(variantId)) {
            itemMatchCriteria.variant = new mongoose.Types.ObjectId(variantId);
        }

        const hasProduct = invoice.items.some(item => {
            return item.product.toString() === productId &&
                (variantId ? item.variant.toString() === variantId : true);
        });

        return hasProduct;

    } catch (error) {
        console.error("Error checking review eligibility:", error);
        return false;
    }
};

const updateProductReviewStats = async (productId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error(`Invalid productId passed to updateProductReviewStats: ${productId}`);
            return;
        }

        const reviews = await Review.find({ product: productId }).lean();

        const numberOfReviews = reviews.length;
        let averageRating = 0;

        if (numberOfReviews > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            averageRating = totalRating / numberOfReviews;
            averageRating = Math.round(averageRating * 10) / 10;
        }

        await Product.findByIdAndUpdate(productId, {
            $set: {
                averageRating: averageRating,
                numberOfReviews: numberOfReviews
            }
        });

        console.log(`Updated review stats for Product ${productId}: Count=${numberOfReviews}, AvgRating=${averageRating}`);

    } catch (error) {
        console.error(`Error updating review stats for Product ${productId}:`, error);
    }
};

const createReviewService = async (userId, reviewData) => {
    const { productId, variantId, invoiceId, rating, comment } = reviewData;

    if (!productId || !rating || !invoiceId) {
        throw new Error("Product ID, invoice ID, and rating are required.");
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid Product ID format.");
    }
    if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) {
        throw new Error("Invalid Variant ID format.");
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new Error("Rating must be a number between 1 and 5.");
    }

    const isEligible = await canUserReviewProduct(userId, productId, variantId, invoiceId);
    if (!isEligible) {
        throw new Error("Review not allowed: You must have purchased and received this item.");
    }

    const existingReview = await Review.findOne({
        user: userId,
        product: productId,
        variant: variantId ? new mongoose.Types.ObjectId(variantId) : null,
        invoice: invoiceId
    });

    if (existingReview) {
        throw new Error("You have already submitted a review for this specific purchase.");
    }

    const newReview = new Review({
        user: userId,
        product: productId,
        variant: variantId ? new mongoose.Types.ObjectId(variantId) : null,
        invoice: invoiceId,
        rating,
        comment: comment || ""
    });

    const savedReview = await newReview.save();

    updateProductReviewStats(productId).catch(err => {
        console.error(`Background updateProductReviewStats failed for Product ${productId} after Review ${savedReview._id} creation:`, err);
    });

    return savedReview.toObject();
};

const getReviewsByProductService = async (productId, options = {}) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid Product ID format.");
    }

    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, parseInt(options.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const sort = options.sort || { createdAt: -1 };

    try {
        const reviews = await Review.find({ product: productId })
            .populate('user', 'name image')
            .populate('variant', 'types')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        return reviews;
    } catch (error) {
        console.error(`Error fetching reviews for product ${productId}:`, error);
        throw new Error("Failed to fetch reviews.");
    }
};

module.exports = {
    createReviewService,
    getReviewsByProductService,
    canUserReviewProduct,
    updateProductReviewStats
};