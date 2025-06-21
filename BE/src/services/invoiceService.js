// services/invoiceService.js
// Handles Invoice creation, retrieval, status updates.
// Includes Coupon validation/application, Delivery fee calculation, Stock updates, Email trigger.

const mongoose = require("mongoose");
const Invoice = require("../models/invoice");
const { Product } = require("../models/product");
const Variant = require("../models/variant");
const Coupon = require("../models/coupon"); // Import Coupon model
const { triggerOrderConfirmationEmail } = require('../utils/helper'); // Import email helper (ensure path is correct)
const { getDeliveryFeeService } = require('./deliveryService'); // Import delivery service (ensure path is correct)
const User = require("../models/user");

// Maximum number of retries for transaction
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 100;

// Helper function to delay execution with exponential backoff
const delay = (retryCount) => new Promise(resolve =>
    setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, retryCount))
);

// Helper to validate and lock coupon
const validateAndLockCoupon = async (code, subtotal, session) => {
    if (!code) return null;

    const coupon = await Coupon.findOne({
        code: code.trim().toUpperCase(),
        isActive: true,
        expiresAt: { $gt: new Date() },
        $expr: { $lt: ["$usedCount", "$maxUses"] }
    }).session(session);

    if (!coupon) throw new Error(`Coupon code "${code}" not found or invalid.`);
    if (!coupon.canApply(subtotal)) {
        throw new Error(`Order subtotal (${subtotal}) does not meet minimum purchase (${coupon.minPurchaseAmount}) for coupon "${code}".`);
    }

    return coupon;
};

// Helper to update variant stock
const updateVariantStock = async (variantId, productId, quantity, session) => {
    const variant = await Variant.findOneAndUpdate(
        {
            _id: variantId,
            product: productId,
            stock: { $gte: quantity }
        },
        { $inc: { stock: -quantity } },
        { session, new: true }
    );

    if (!variant) {
        throw new Error(`Insufficient stock for variant ${variantId}`);
    }

    return variant;
};

// Helper to process items and calculate subtotal
const processItemsAndCalculateSubtotal = async (productsList, session) => {
    const items = [];
    let subtotal = 0;

    for (const itemData of productsList) {
        if (!itemData?.productId || !mongoose.Types.ObjectId.isValid(itemData.productId) || !itemData.quantity || itemData.quantity < 1) {
            console.warn("SERVICE: Skipping invalid item in productsList:", itemData);
            continue;
        }

        const product = await Product.findById(itemData.productId).select('name base_price').lean();
        if (!product) throw new Error(`Product ${itemData.productId} not found.`);

        let priceAtPurchase = product.base_price ?? 0;
        let variantIdToSave = null;

        if (itemData.variantId && mongoose.Types.ObjectId.isValid(itemData.variantId)) {
            const variant = await updateVariantStock(itemData.variantId, itemData.productId, itemData.quantity, session);
            priceAtPurchase = (typeof variant.price === 'number' && variant.price >= 0) ? variant.price : priceAtPurchase;
            variantIdToSave = variant._id;
        }

        items.push({
            product: product._id,
            variant: variantIdToSave,
            quantity: itemData.quantity,
            priceAtPurchase: priceAtPurchase,
        });

        subtotal += priceAtPurchase * itemData.quantity;
    }

    return { items, subtotal: Math.round(subtotal) };
};

// --- CREATE INVOICE ---
/**
 * Creates an invoice, validates items/stock, applies coupon, calculates delivery,
 * updates stock/coupon usage, and triggers confirmation email.
 * Uses a transaction for atomicity with retry logic.
 */
const createInvoiceService = async (
    userId,
    productsList, // Expect: [{ productId, variantId, quantity }]
    paymentMethod,
    shippingAddress,
    couponCodeInput = null, // Optional coupon code from request
    paymentStatus = 'pending' // Add default payment status
) => {
    let retryCount = 0;
    let lastError = null;

    while (retryCount < MAX_RETRIES) {
        const session = await mongoose.startSession();

        try {
            session.startTransaction({
                readConcern: { level: 'snapshot' },
                writeConcern: { w: 'majority' }
            });

            // --- 1. Basic Input Validation ---
            if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid User ID format.");
            if (!productsList?.length) throw new Error("Product list cannot be empty.");
            if (!paymentMethod || !Invoice.schema.path('paymentMethod').enumValues.includes(paymentMethod)) {
                throw new Error("Invalid or missing paymentMethod.");
            }
            if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.country || !shippingAddress?.zipCode) {
                throw new Error("Incomplete shippingAddress provided.");
            }
            if (!Invoice.schema.path('paymentStatus').enumValues.includes(paymentStatus)) {
                throw new Error("Invalid payment status provided.");
            }

            // --- 2. Process Items & Calculate Subtotal ---
            const { items, subtotal } = await processItemsAndCalculateSubtotal(productsList, session);
            if (items.length === 0) throw new Error("No valid items to process.");

            // --- 3. Validate and Lock Coupon ---
            let discountAmount = 0;
            const appliedCoupon = await validateAndLockCoupon(couponCodeInput, subtotal, session);

            if (appliedCoupon) {
                discountAmount = appliedCoupon.calculateDiscount(subtotal);
                await Coupon.findOneAndUpdate(
                    {
                        _id: appliedCoupon._id,
                        usedCount: { $lt: appliedCoupon.maxUses }
                    },
                    { $inc: { usedCount: 1 } },
                    { session, new: true }
                );
            }

            // --- 4. Calculate Delivery Fee ---
            let deliveryFee = 0;
            try {
                deliveryFee = await getDeliveryFeeService(shippingAddress);
                deliveryFee = Math.max(0, Math.round(deliveryFee));
            } catch (error) {
                console.warn("Failed to calculate delivery fee:", error);
            }

            // --- 5. Create and Save Invoice ---
            const finalTotalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

            // Determine order status based on payment status
            let orderStatus = 'processing';
            if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
                orderStatus = 'cancelled';
            }

            const invoice = new Invoice({
                user: userId,
                items,
                subtotal,
                couponCode: appliedCoupon?.code || null,
                discountAmount,
                deliveryFee,
                totalAmount: finalTotalAmount,
                paymentMethod,
                shippingAddress,
                paymentStatus,
                orderStatus,
                paidAt: paymentStatus === 'paid' ? new Date() : null
            });

            const savedInvoice = await invoice.save({ session });

            // --- 6. Commit Transaction ---
            await session.commitTransaction();
            console.log(`SERVICE: Invoice ${savedInvoice._id} created successfully with status ${paymentStatus}.`);

            // --- 7. Send Email for non-CARD payments or if payment is already completed ---
            if (paymentMethod !== 'CARD' || paymentStatus === 'paid') {
                triggerOrderConfirmationEmail(savedInvoice)
                    .catch(error => console.error(`Failed to send confirmation email for Invoice ${savedInvoice._id}:`, error));
            }

            return savedInvoice.toObject();

        } catch (error) {
            await session.abortTransaction();
            lastError = error;

            const isWriteConflict = error.message.includes('WriteConflict') ||
                error.message.includes('transaction') ||
                error.codeName === 'WriteConflict';

            if (isWriteConflict && retryCount < MAX_RETRIES - 1) {
                console.log(`Retrying transaction due to write conflict. Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
                retryCount++;
                await delay(retryCount);
                continue;
            }

            throw error;
        } finally {
            session.endSession();
        }
    }

    throw new Error(`Failed to create invoice after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
};

const getInvoiceByIdService = async (userId, invoiceId) => {
    return Invoice.findOne({ _id: invoiceId, user: userId })
        .populate(/* your populate logic */);
};

// --- GET INVOICES FOR USER ---
const getInvoiceService = async (userId, queryParams = {}) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid User ID format");

        const {
            orderStatus,
            paymentStatus,
            fromDate,
            toDate,
            minAmount,
            maxAmount,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page,
            limit
        } = queryParams;

        let query = { user: userId };

        // Filter by order status
        if (orderStatus && Invoice.schema.path('orderStatus').enumValues.includes(orderStatus)) {
            query.orderStatus = orderStatus;
        }

        // Filter by payment status
        if (paymentStatus && Invoice.schema.path('paymentStatus').enumValues.includes(paymentStatus)) {
            query.paymentStatus = paymentStatus;
        }

        // Filter by date range
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) {
                query.createdAt.$gte = new Date(fromDate);
            }
            if (toDate) {
                // Add one day to include the entire end date
                const endDate = new Date(toDate);
                endDate.setDate(endDate.getDate() + 1);
                query.createdAt.$lt = endDate;
            }
        }

        // Filter by amount
        if (minAmount !== undefined || maxAmount !== undefined) {
            query.totalAmount = {};
            if (minAmount !== undefined) {
                query.totalAmount.$gte = Number(minAmount);
            }
            if (maxAmount !== undefined) {
                query.totalAmount.$lte = Number(maxAmount);
            }
        }

        // Sort options
        const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        // Handle pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const applyPagination = !isNaN(limitNum) && limitNum > 0 && !isNaN(pageNum) && pageNum > 0;

        // Query builder
        let invoiceQuery = Invoice.find(query)
            .populate({ path: "user", select: "name email" })
            .populate({
                path: "items.product",
                select: "name images base_price category brand",
                populate: { path: "category brand", select: "name" },
            })
            .populate({ path: "items.variant", select: "types price" })
            .sort(sortOptions);

        // Count total for pagination info
        const totalInvoices = await Invoice.countDocuments(query);

        // Apply pagination if requested
        if (applyPagination) {
            const skip = (pageNum - 1) * limitNum;
            invoiceQuery = invoiceQuery.skip(skip).limit(limitNum);
        }

        const invoices = await invoiceQuery.lean();

        // Return with pagination info if pagination was applied
        if (applyPagination) {
            return {
                invoices,
                currentPage: pageNum,
                totalPages: Math.ceil(totalInvoices / limitNum),
                totalInvoices,
                limit: limitNum
            };
        }

        // Just return the invoices if no pagination

        // console.log("-------------------------------SERVICE: Invoices fetched:", invoices);
        return invoices;
    } catch (error) {
        console.error("Error getting user invoices:", error);
        throw new Error("Error getting invoices: " + error.message);
    }
};

// --- UPDATE INVOICE STATUS (Admin) ---
const updateInvoiceStatusService = async (invoiceId, statusUpdates) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!mongoose.Types.ObjectId.isValid(invoiceId)) throw new Error("Invalid invoice ID format");
        const validatedUpdates = {};
        if (statusUpdates.orderStatus && Invoice.schema.path('orderStatus').enumValues.includes(statusUpdates.orderStatus)) {
            validatedUpdates.orderStatus = statusUpdates.orderStatus;
        }
        if (statusUpdates.paymentStatus && Invoice.schema.path('paymentStatus').enumValues.includes(statusUpdates.paymentStatus)) {
            validatedUpdates.paymentStatus = statusUpdates.paymentStatus;
        }
        if (Object.keys(validatedUpdates).length === 0) throw new Error("No valid status fields provided.");

        // Find the invoice and update its status
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            invoiceId,
            { $set: validatedUpdates },
            { new: true, runValidators: true, session }
        )
            .populate('user', 'name email')
            .populate({ path: "items.product", select: "name" })
            .populate({ path: "items.variant", select: "types" });

        if (!updatedInvoice) throw new Error(`Invoice '${invoiceId}' not found.`);

        // If order status is changed to "delivered", update product purchase quantities
        if (validatedUpdates.orderStatus === "delivered") {
            // Group items by product ID and sum quantities
            const productQuantities = {};
            updatedInvoice.items.forEach(item => {
                const productId = item.product._id.toString();
                productQuantities[productId] = (productQuantities[productId] || 0) + item.quantity;
            });

            // Update each product's purchasedQuantity
            const updatePromises = Object.entries(productQuantities).map(([productId, quantity]) => {
                return Product.findByIdAndUpdate(
                    productId,
                    { $inc: { purchasedQuantity: quantity } },
                    { session }
                );
            });

            await Promise.all(updatePromises);
        }

        await session.commitTransaction();
        return updatedInvoice;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// --- GET ALL INVOICES & SEARCH (Admin) ---
const getAllInvoicesAdminService = async (queryParams) => {
    try {
        const {
            searchTerm,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            paymentStatus,
            orderStatus,
            fromDate,
            toDate,
            userId,
            minAmount,
            maxAmount
        } = queryParams;
        let pageFromQuery = queryParams.page;
        let limitFromQuery = queryParams.limit;

        // --- DEBUG LOGS START ---
        console.log("[Service] Received queryParams:", queryParams);
        console.log("[Service] limitFromQuery:", limitFromQuery, "(type:", typeof limitFromQuery, ")");
        console.log("[Service] pageFromQuery:", pageFromQuery, "(type:", typeof pageFromQuery, ")");
        // --- DEBUG LOGS END ---

        let query = {};

        // Filter by searchTerm (existing functionality)
        if (searchTerm) {
            const searchRegex = new RegExp(searchTerm, 'i');
            const usersFound = await User.find({
                $or: [{ name: searchRegex }, { email: searchRegex }]
            }).select('_id').lean();
            const userIds = usersFound.map(user => user._id);

            const orConditions = [];
            if (userIds.length > 0) {
                orConditions.push({ user: { $in: userIds } });
            }
            orConditions.push({ couponCode: searchRegex });
            if (mongoose.Types.ObjectId.isValid(searchTerm)) {
                orConditions.push({ _id: searchTerm });
            }

            if (orConditions.length > 0) {
                query.$or = orConditions;
            } else {
                query = { _id: new mongoose.Types.ObjectId() }; // No results with searchTerm
            }
        }

        // Filter by specific user
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.user = mongoose.Types.ObjectId(userId);
        }

        // Filter by payment status
        if (paymentStatus && Invoice.schema.path('paymentStatus').enumValues.includes(paymentStatus)) {
            query.paymentStatus = paymentStatus;
        }

        // Filter by order status
        if (orderStatus && Invoice.schema.path('orderStatus').enumValues.includes(orderStatus)) {
            query.orderStatus = orderStatus;
        }

        // Filter by date range
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) {
                query.createdAt.$gte = new Date(fromDate);
            }
            if (toDate) {
                // Add one day to include the entire end date
                const endDate = new Date(toDate);
                endDate.setDate(endDate.getDate() + 1);
                query.createdAt.$lt = endDate;
            }
        }

        // Filter by amount
        if (minAmount !== undefined || maxAmount !== undefined) {
            query.totalAmount = {};
            if (minAmount !== undefined) {
                query.totalAmount.$gte = Number(minAmount);
            }
            if (maxAmount !== undefined) {
                query.totalAmount.$lte = Number(maxAmount);
            }
        }

        // Pagination handling (existing functionality)
        let page = parseInt(pageFromQuery, 10);
        let limit = parseInt(limitFromQuery, 10);
        const applyPagination = !isNaN(limit) && limit > 0;

        console.log("[Service] Parsed limit:", limit, "(type:", typeof limit, ")");
        console.log("[Service] Parsed page:", page, "(type:", typeof page, ")");
        console.log("[Service] applyPagination:", applyPagination);
        console.log("[Service] Query filters:", JSON.stringify(query));

        if (!applyPagination) {
            page = 1;
        } else {
            if (isNaN(page) || page <= 0) {
                page = 1;
            }
        }

        const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const totalInvoices = await Invoice.countDocuments(query);

        let invoicesQuery = Invoice.find(query)
            .populate({ path: "user", select: "name email" })
            .populate({ path: "items.product", select: "name images base_price" })
            .populate({ path: "items.variant", select: "types price stock" })
            .sort(sortOptions);

        if (applyPagination) {
            const skip = (page - 1) * limit;
            invoicesQuery = invoicesQuery.skip(skip).limit(limit);
            console.log(`[Service] Applying pagination: skip=${skip}, limit=${limit}`);
        } else {
            console.log("[Service] Not applying pagination, fetching all matching documents.");
        }

        const invoices = await invoicesQuery.lean();
        console.log("[Service] Number of invoices fetched:", invoices.length);

        return {
            invoices,
            currentPage: page,
            totalPages: applyPagination ? Math.ceil(totalInvoices / limit) : (totalInvoices > 0 ? 1 : 0),
            totalInvoices,
            limit: applyPagination ? limit : totalInvoices,
        };

    } catch (error) {
        console.error("Error getting all invoices (Admin):", error);
        throw new Error("Error getting invoices: " + error.message);
    }
};

// --- GET DELIVERED PRODUCTS FOR USER ---
const getDeliveredProductsForUserService = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid User ID format");

        // Query for invoices with delivered status for this user
        const query = {
            user: userId,
            orderStatus: "delivered"
        };

        // Find the invoices
        const deliveredInvoices = await Invoice.find(query)
            .populate({
                path: "items.product",
                select: "name images base_price category brand",
                populate: { path: "category brand", select: "name" },
            })
            .populate({ path: "items.variant", select: "types price" })
            .sort({ createdAt: -1 })
            .lean();

        // Extract products from invoices
        const deliveredProducts = [];
        deliveredInvoices.forEach(invoice => {
            invoice.items.forEach(item => {
                if (item.product) {
                    deliveredProducts.push({
                        invoice: {
                            _id: invoice._id,
                            createdAt: invoice.createdAt,
                            orderStatus: invoice.orderStatus
                        },
                        product: item.product,
                        variant: item.variant,
                        quantity: item.quantity,
                        priceAtPurchase: item.priceAtPurchase
                    });
                }
            });
        });

        // Get all reviews by this user to check which products have been reviewed
        const Review = require('../models/review');
        const userReviews = await Review.find({ user: userId }).lean();

        console.log("User reviews found:", userReviews.length);
        // console.log("Sample review:", userReviews.length > 0 ? userReviews[0] : "No reviews");

        // Create a map of reviewed items for quick lookup
        const reviewedItemsMap = new Map();
        userReviews.forEach(review => {
            const key = `${review.product}-${review.variant || 'none'}-${review.invoice}`;
            console.log(`Adding review to map with key: ${key}`, review);
            reviewedItemsMap.set(key, review);
        });

        // Add review status to each product
        const productsWithReviewStatus = deliveredProducts.map(item => {
            const productId = item.product._id.toString();
            const variantId = item.variant ? item.variant._id.toString() : 'none';
            const invoiceId = item.invoice._id.toString();

            const key = `${productId}-${variantId}-${invoiceId}`;
            const existingReview = reviewedItemsMap.get(key);

            return {
                ...item,
                reviewStatus: {
                    isReviewed: !!existingReview,
                    reviewId: existingReview?._id || null,
                    rating: existingReview?.rating || null,
                    comment: existingReview?.comment || null
                }
            };
        });

        return productsWithReviewStatus;
    } catch (error) {
        console.error("Error getting delivered products for user:", error);
        throw new Error("Error getting delivered products: " + error.message);
    }
};

module.exports = { createInvoiceService, getInvoiceService, updateInvoiceStatusService, getInvoiceByIdService, getAllInvoicesAdminService, getDeliveredProductsForUserService };