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

// --- CREATE INVOICE ---
/**
 * Creates an invoice, validates items/stock, applies coupon, calculates delivery,
 * updates stock/coupon usage, and triggers confirmation email.
 * Uses a transaction for atomicity.
 */
const createInvoiceService = async (
    userId,
    productsList, // Expect: [{ productId, variantId, quantity }]
    paymentMethod,
    shippingAddress,
    couponCodeInput = null // Optional coupon code from request
) => {
    const session = await mongoose.startSession();
    session.startTransaction(); // Start transaction
    let savedInvoice; // Declare outside try for email trigger

    try {
        let items = [];
        let subtotal = 0;
        const stockUpdates = []; // For Variant stock decrement
        let appliedCoupon = null; // To store the validated coupon document
        let discountAmount = 0;
        let deliveryFee = 0;

        // --- 1. Validate Inputs ---
        if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid User ID format.");
        if (!productsList || !Array.isArray(productsList) || productsList.length === 0) throw new Error("Product list cannot be empty.");
        if (!paymentMethod || !Invoice.schema.path('paymentMethod').enumValues.includes(paymentMethod)) throw new Error("Invalid or missing paymentMethod.");
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country || !shippingAddress.zipCode /* || ! */) {
            // Name is needed for Stripe shipping but maybe optional otherwise
            throw new Error("Incomplete shippingAddress provided.");
        }


        // --- 2. Process Items & Calculate Subtotal ---
        for (const itemData of productsList) {
            // Validate item structure and IDs
            if (!itemData?.productId || !mongoose.Types.ObjectId.isValid(itemData.productId) || !itemData.quantity || itemData.quantity < 1) {
                console.warn("SERVICE: Skipping invalid item in productsList:", itemData); continue;
            }
            if (itemData.variantId && !mongoose.Types.ObjectId.isValid(itemData.variantId)) {
                console.warn(`SERVICE: Skipping item with invalid variantId: ${itemData.variantId}`); continue;
            }

            const product = await Product.findById(itemData.productId).select('name base_price').lean(); // Fetch base product info
            if (!product) throw new Error(`Product ${itemData.productId} not found.`);

            let priceAtPurchase = product.base_price ?? 0;
            let variantIdToSave = null;
            let currentStock = Infinity; // Assume infinite if base product has no stock tracking

            // Fetch Variant details if variantId is provided
            if (itemData.variantId) {
                const variant = await Variant.findById(itemData.variantId).session(session); // Read within transaction
                if (!variant) throw new Error(`Variant ${itemData.variantId} not found.`);
                if (variant.product.toString() !== itemData.productId) throw new Error(`Variant ${itemData.variantId} does not belong to product ${itemData.productId}.`);

                priceAtPurchase = (typeof variant.price === 'number' && variant.price >= 0) ? variant.price : priceAtPurchase;
                variantIdToSave = variant._id;
                currentStock = variant.stock;

                // Check stock availability
                if (itemData.quantity > currentStock) {
                    throw new Error(`Insufficient stock for ${product.name} (Variant: ${variant.types || variantIdToSave}). Available: ${currentStock}, Requested: ${itemData.quantity}`);
                }

                // Prepare stock update operation for this variant
                stockUpdates.push({
                    updateOne: {
                        filter: { _id: variantIdToSave },
                        update: { $inc: { stock: -itemData.quantity } }
                    }
                });
            } else {
                // Handle logic for purchasing base product if applicable (e.g., check stock on Product model)
                console.warn(`No variantId provided for product ${itemData.productId}. Using base price. Stock check/update skipped unless implemented on Product model.`);
                // If only variants are sellable, throw new Error(`Product ${product.name} requires a variant selection.`);
            }

            // Add validated item details for invoice
            items.push({
                product: product._id,
                variant: variantIdToSave,
                quantity: itemData.quantity,
                priceAtPurchase: priceAtPurchase,
            });

            // Accumulate subtotal
            subtotal += priceAtPurchase * itemData.quantity;
        } // End of item processing loop

        subtotal = Math.round(subtotal); // Round subtotal for consistency

        // --- 3. Validate and Apply Coupon ---
        if (couponCodeInput && typeof couponCodeInput === 'string') {
            const code = couponCodeInput.trim().toUpperCase();
            if (code) { // Proceed only if code is not empty after trim
                appliedCoupon = await Coupon.findOne({ code: code }).session(session);

                if (!appliedCoupon) throw new Error(`Coupon code "${code}" not found.`);
                if (!appliedCoupon.isValid()) throw new Error(`Coupon code "${code}" is invalid, expired, or fully used.`);
                if (!appliedCoupon.canApply(subtotal)) throw new Error(`Order subtotal (${subtotal}) does not meet minimum purchase (${appliedCoupon.minPurchaseAmount}) for coupon "${code}".`);

                discountAmount = appliedCoupon.calculateDiscount(subtotal); // Get calculated & rounded discount
                console.log(`Applied coupon ${code}, discount: ${discountAmount}`);
            }
        }

        // --- 4. Calculate Delivery Fee ---
        try {
            deliveryFee = await getDeliveryFeeService(shippingAddress); // Call external/internal service
            if (typeof deliveryFee !== 'number' || deliveryFee < 0) deliveryFee = 0;
            deliveryFee = Math.round(deliveryFee); // Round fee
            console.log(`Calculated delivery fee: ${deliveryFee}`);
        } catch (deliveryError) {
            console.error("Failed to calculate delivery fee:", deliveryError);
            deliveryFee = 0; // Default to 0 on error, or throw if delivery calc is mandatory
            // throw new Error(`Could not calculate delivery fee: ${deliveryError.message}`);
        }

        // --- 5. Calculate Final Total Amount ---
        const finalTotalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

        // --- 6. Create Invoice Document ---
        const invoiceData = {
            user: userId, items, subtotal, couponCode: appliedCoupon ? appliedCoupon.code : null,
            discountAmount, deliveryFee, totalAmount: finalTotalAmount, paymentMethod,
            shippingAddress, paymentStatus: "pending", orderStatus: "processing",
            // paymentIntentId can be added later by stripe controller if using Stripe
        };
        const invoice = new Invoice(invoiceData);
        savedInvoice = await invoice.save({ session }); // Save within transaction

        // --- 7. Update Stock Levels ---
        if (stockUpdates.length > 0) {
            const stockUpdateResult = await Variant.bulkWrite(stockUpdates, { session });
            // Add more robust check if needed (e.g., ensuring matchedCount > 0 for all?)
            if (stockUpdateResult.modifiedCount === 0 && stockUpdateResult.matchedCount < stockUpdates.length) {
                console.warn("Stock update result indicates potential issues:", stockUpdateResult);
                // Decide if this requires aborting the transaction
                // throw new Error("Stock update failed for some items. Order cancelled.");
            }
            console.log(`SERVICE: Stock levels updated (${stockUpdateResult.modifiedCount} modified).`);
        }

        // --- 8. Update Coupon Usage Count ---
        if (appliedCoupon) {
            // Use findOneAndUpdate with $inc to atomically update and check limit
            const couponUpdateResult = await Coupon.findOneAndUpdate(
                { _id: appliedCoupon._id, usedCount: { $lt: appliedCoupon.maxUses } },
                { $inc: { usedCount: 1 } },
                { new: false, session: session } // Don't need updated doc, run in session
            );
            if (!couponUpdateResult) { // Coupon usage limit likely reached between check and update
                throw new Error(`Coupon "${appliedCoupon.code}" usage limit was reached. Please remove it and try again.`);
            }
            console.log(`SERVICE: Incremented usage for coupon ${appliedCoupon.code}.`);
        }

        // --- 9. Commit Transaction ---
        await session.commitTransaction(); // COMMIT HAPPENS HERE
        console.log(`SERVICE: Invoice ${savedInvoice._id} transaction committed.`);

        // --- 10. Trigger Email (AFTER successful commit) ---
        // This runs asynchronously in the background
        triggerOrderConfirmationEmail(savedInvoice) // <--- STARTS ASYNC TASK
            .catch(emailError => console.error(`Failed to trigger confirmation email post-commit for Invoice ${savedInvoice._id}:`, emailError));

        return savedInvoice.toObject(); // <--- FUNCTION RETURNS TO CONTROLLER ALMOST IMMEDIATELY

    } catch (error) { // <--- This catches errors BEFORE commit
        await session.abortTransaction(); // PROBLEM: This line gets called somehow AFTER commit
        console.error("SERVICE: Transaction aborted due to error in createInvoiceService:", error);
        throw new Error(error.message || "Failed to create invoice.");
    } finally {
        session.endSession();
    }
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
        return invoices;
    } catch (error) {
        console.error("Error getting user invoices:", error);
        throw new Error("Error getting invoices: " + error.message);
    }
};

// --- UPDATE INVOICE STATUS (Admin) ---
const updateInvoiceStatusService = async (invoiceId, statusUpdates) => {
    // ... (Implementation from previous response - unchanged) ...
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) throw new Error("Invalid invoice ID format");
    const validatedUpdates = {};
    if (statusUpdates.orderStatus && Invoice.schema.path('orderStatus').enumValues.includes(statusUpdates.orderStatus)) {
        validatedUpdates.orderStatus = statusUpdates.orderStatus;
    }
    if (statusUpdates.paymentStatus && Invoice.schema.path('paymentStatus').enumValues.includes(statusUpdates.paymentStatus)) {
        validatedUpdates.paymentStatus = statusUpdates.paymentStatus;
    }
    if (Object.keys(validatedUpdates).length === 0) throw new Error("No valid status fields provided.");

    const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, { $set: validatedUpdates }, { new: true, runValidators: true })
        .populate('user', 'name email')
        .populate({ path: "items.product", select: "name" })
        .populate({ path: "items.variant", select: "types" })
        .lean();
    if (!updatedInvoice) throw new Error(`Invoice '${invoiceId}' not found.`);
    // TODO: Trigger relevant notification emails based on status change (e.g., shipping confirmation)
    return updatedInvoice;
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

module.exports = { createInvoiceService, getInvoiceService, updateInvoiceStatusService, getInvoiceByIdService, getAllInvoicesAdminService };