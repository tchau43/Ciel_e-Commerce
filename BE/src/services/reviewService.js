// services/reviewService.js
// Handles review eligibility check, creation, and retrieval.
// Works with separate Product and Variant collections.

const mongoose = require('mongoose');
const Review = require('../models/review'); // Adjust path if needed
const Invoice = require('../models/invoice'); // Adjust path if needed
const { Product } = require('../models/product'); // Adjust path if needed
// const Variant = require('../models/variant'); // Only needed if validating variant existence further

/**
 * Checks if a user has purchased and received a specific product/variant.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product.
 * @param {string|null|undefined} variantId - The ID of the variant (optional).
 * @returns {Promise<boolean>} True if the user is eligible to review, false otherwise.
 */
const canUserReviewProduct = async (userId, productId, variantId) => {
    try {
        // Validate IDs passed to the function
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            console.warn(`Invalid userId or productId format passed to canUserReviewProduct`);
            return false;
        }

        // Construct the query criteria for the item within the Invoice.items array
        const itemMatchCriteria = {
            product: new mongoose.Types.ObjectId(productId)
            // We will add the variant field conditionally below
        };

        // Add the variant condition correctly based on variantId input
        if (variantId && mongoose.Types.ObjectId.isValid(variantId)) {
            // User is reviewing a specific variant
            itemMatchCriteria.variant = new mongoose.Types.ObjectId(variantId);
        } else if (variantId === null || variantId === undefined) {
            // User is reviewing the base product or an item where variant wasn't tracked/applicable
            // Match invoice items where variant is explicitly null or possibly doesn't exist
            itemMatchCriteria.variant = null; // Or use { $exists: false } if applicable
        } else if (variantId) {
            // variantId was provided but in an invalid format
            console.warn(`Invalid variantId format provided for eligibility check: ${variantId}`);
            return false;
        }
        // console.log("Eligibility Check Criteria:", itemMatchCriteria); // For debugging

        // Find at least one invoice matching the user, status, and item criteria
        const eligibleInvoice = await Invoice.findOne({
            user: new mongoose.Types.ObjectId(userId),
            orderStatus: 'delivered', // Order must be delivered
            items: {
                $elemMatch: itemMatchCriteria // Check if any item in the array matches
            }
        }).select('_id').lean(); // Only need to know if it exists

        // Return true if a matching invoice was found, false otherwise
        return !!eligibleInvoice;

    } catch (error) {
        console.error("Error checking review eligibility:", error);
        // Default to false eligibility in case of unexpected errors
        return false;
    }
};

/**
 * Updates the averageRating and numberOfReviews on a specific Product document.
 * This is typically called after a review is created, updated, or deleted.
 * @param {string} productId - The ID of the product to update stats for.
 */
const updateProductReviewStats = async (productId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error(`Invalid productId passed to updateProductReviewStats: ${productId}`);
            return;
        }

        // Find all reviews related to this product
        const reviews = await Review.find({ product: productId }).lean();

        const numberOfReviews = reviews.length;
        let averageRating = 0;

        // Calculate average only if there are reviews
        if (numberOfReviews > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0); // Safely sum ratings
            averageRating = totalRating / numberOfReviews;
            // Round to one decimal place for cleaner display
            averageRating = Math.round(averageRating * 10) / 10;
        }

        // Update the corresponding Product document
        await Product.findByIdAndUpdate(productId, {
            $set: { // Use $set to update only these fields
                averageRating: averageRating,
                numberOfReviews: numberOfReviews
            }
        });

        console.log(`Updated review stats for Product ${productId}: Count=${numberOfReviews}, AvgRating=${averageRating}`);

    } catch (error) {
        console.error(`Error updating review stats for Product ${productId}:`, error);
        // Consider more robust error handling (e.g., retry mechanism) if needed
    }
};


/**
 * Creates a new review document in the database after checking eligibility
 * and potentially checking for existing reviews by the same user for the same item.
 * @param {string} userId - The ID of the user creating the review.
 * @param {object} reviewData - Object containing { productId, variantId (optional), rating, comment (optional) }.
 * @returns {Promise<object>} The newly created review document (as a plain object).
 */
const createReviewService = async (userId, reviewData) => {
    const { productId, variantId, rating, comment } = reviewData;

    // 1. --- Input Validation ---
    if (!productId || !rating) {
        throw new Error("Product ID and rating are required.");
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid Product ID format.");
    }
    // variantId is optional, but validate if provided
    if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) {
        throw new Error("Invalid Variant ID format.");
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new Error("Rating must be a number between 1 and 5.");
    }
    // Optional: Add validation for comment length if needed
    // if (comment && comment.length > 1000) { throw new Error("Comment is too long."); }


    // 2. --- Check Eligibility ---
    // Ensure user purchased and received the item (product/variant combo)
    const isEligible = await canUserReviewProduct(userId, productId, variantId);
    if (!isEligible) {
        // Provide a user-friendly error message
        throw new Error("Review not allowed: You must have purchased and received this item.");
    }

    // 3. --- Check for Existing Review (Prevent Duplicates) ---
    // Find if this user already reviewed this exact product/variant combination
    const variantIdToFind = variantId ? new mongoose.Types.ObjectId(variantId) : null;
    const existingReview = await Review.findOne({
        user: userId,
        product: productId,
        variant: variantIdToFind // Match variant exactly (null if base product review)
    });

    if (existingReview) {
        // Prevent duplicate reviews for the same item by the same user
        throw new Error("You have already submitted a review for this specific product/variant.");
    }

    // 4. --- Create and Save the New Review ---
    const newReview = new Review({
        user: userId,
        product: productId,
        variant: variantIdToFind, // Store the ObjectId or null
        rating: rating,
        comment: comment || "" // Store empty string if comment is null/undefined
    });

    const savedReview = await newReview.save();

    // 5. --- Update Product Statistics (Asynchronously) ---
    // Trigger the update but don't wait for it to finish before responding to the user
    updateProductReviewStats(productId).catch(err => {
        // Log errors from the background update process
        console.error(`Background updateProductReviewStats failed for Product ${productId} after Review ${savedReview._id} creation:`, err);
    });

    // 6. --- Return Saved Review ---
    // Return the created review document (as plain object)
    // Optionally populate user details here if needed immediately
    return savedReview.toObject();
};

// --- GET REVIEWS FOR A PRODUCT ---
/**
 * Gets reviews for a specific product, with pagination and sorting.
 * Populates basic user information. Optionally populates variant info.
 * @param {string} productId - The ID of the product.
 * @param {object} options - Optional query options { page, limit, sort (e.g., { rating: -1 }) }.
 * @returns {Promise<Array<object>>} Array of review documents (as plain objects).
 */
const getReviewsByProductService = async (productId, options = {}) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid Product ID format.");
    }

    // Pagination defaults
    const page = Math.max(1, parseInt(options.page, 10) || 1); // Ensure page >= 1
    const limit = Math.max(1, parseInt(options.limit, 10) || 10); // Ensure limit >= 1
    const skip = (page - 1) * limit;

    // Sorting defaults (e.g., newest first)
    // TODO: Add parsing for sort query parameter string if needed
    const sort = options.sort || { createdAt: -1 };

    try {
        const reviews = await Review.find({ product: productId })
            .populate('user', 'name image') // Populate user's name and image
            .populate('variant', 'types')   // <-- Optionally populate variant 'types' description
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean for performance

        // Optionally fetch total count for pagination metadata
        // const totalReviews = await Review.countDocuments({ product: productId });
        // return { reviews, totalReviews, currentPage: page, totalPages: Math.ceil(totalReviews / limit) };

        return reviews;
    } catch (error) {
        console.error(`Error fetching reviews for product ${productId}:`, error);
        throw new Error("Failed to fetch reviews.");
    }
};

module.exports = {
    createReviewService,
    getReviewsByProductService,
    canUserReviewProduct, // Export if needed elsewhere (e.g., UI check before showing button)
    updateProductReviewStats // Export if needed for manual recalculation triggers
};