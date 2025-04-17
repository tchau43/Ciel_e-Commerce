// services/invoiceService.js
// Refactored for separate Variant collection

const mongoose = require("mongoose");
const Invoice = require("../models/invoice");
const { Product } = require("../models/product");
const Variant = require("../models/variant"); // <-- Import the Variant model

// --- CREATE INVOICE ---
// Creates invoice, calculates totals using Variant prices, decrements stock
const createInvoiceService = async (
    userId,
    productsList, // Expect array of { productId, variantId, quantity }
    paymentMethod,
    shippingAddress,
    paymentIntentId = null // This is now typically added *after* PI creation by the controller
) => {
    // Use a session for atomicity (Invoice creation + Stock update)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let items = [];
        let totalAmount = 0;

        // --- Input Validation ---
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid User ID format.");
        }
        if (!productsList || !Array.isArray(productsList) || productsList.length === 0) {
            throw new Error("Product list cannot be empty.");
        }
        if (!paymentMethod || !Invoice.schema.path('paymentMethod').enumValues.includes(paymentMethod)) {
            throw new Error("Invalid or missing paymentMethod.");
        }
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country || !shippingAddress.zipCode) {
            throw new Error("Incomplete shippingAddress provided.");
        }

        // --- Stock Update Preparation ---
        const stockUpdates = []; // Operations for bulkWrite

        // --- Process Items ---
        // Optional: Pre-fetch all variants/products for efficiency if list is large
        // ... (See previous example for pre-fetching logic using Maps) ...

        for (let itemData of productsList) {
            // Validate structure and IDs
            if (!itemData || !itemData.productId || !mongoose.Types.ObjectId.isValid(itemData.productId) || !itemData.quantity || itemData.quantity < 1) {
                console.warn("SERVICE: Skipping invalid item in productsList:", itemData);
                continue; // Skip this item
            }
            if (itemData.variantId && !mongoose.Types.ObjectId.isValid(itemData.variantId)) {
                console.warn(`SERVICE: Skipping item with invalid variantId format: ${itemData.variantId}`);
                continue; // Skip this item
            }

            const product = await Product.findById(itemData.productId).select('name base_price').lean(); // Fetch only needed fields
            if (!product) {
                throw new Error(`Product with ID ${itemData.productId} not found.`);
            }

            let priceAtPurchase = product.base_price ?? 0;
            let variantIdToSave = null;
            let currentStock = Infinity;

            // --- Get Variant Price and Check Stock ---
            if (itemData.variantId) {
                // Find the specific variant document
                const variant = await Variant.findById(itemData.variantId).session(session); // Use session for read consistency
                if (!variant) {
                    throw new Error(`Variant with ID ${itemData.variantId} not found.`);
                }
                if (variant.product.toString() !== itemData.productId) { // Ensure variant matches product
                    throw new Error(`Variant ${itemData.variantId} does not belong to product ${itemData.productId}.`);
                }

                // Use variant's price
                if (typeof variant.price === 'number' && variant.price >= 0) {
                    priceAtPurchase = variant.price;
                } else {
                    console.warn(`Variant ${itemData.variantId} has invalid price. Using base price.`);
                }
                variantIdToSave = variant._id;
                currentStock = variant.stock; // Get current stock for check

                // Check stock BEFORE potentially adding to invoice items
                if (itemData.quantity > currentStock) {
                    throw new Error(`Insufficient stock for ${product.name} (Variant ${variant.types}). Available: ${currentStock}, Requested: ${itemData.quantity}`);
                }

                // Prepare stock update operation
                stockUpdates.push({
                    updateOne: {
                        filter: { _id: variantIdToSave },
                        // Ensure stock doesn't go below zero with the update itself (optional safety)
                        // filter: { _id: variantIdToSave, stock: { $gte: itemData.quantity } },
                        update: { $inc: { stock: -itemData.quantity } }
                    }
                });

            } else {
                // Handle case where base product might be purchasable
                // Needs stock field on Product schema and check here if applicable
                console.warn(`No variantId provided for product ${itemData.productId}. Using base price.`);
                // If only variants are sellable, uncomment the line below:
                // throw new Error(`Product ${product.name} requires a variant selection.`);
            }
            //--- End Variant Price/Stock ---

            // Add validated item to the invoice list
            items.push({
                product: product._id,
                variant: variantIdToSave,
                quantity: itemData.quantity,
                priceAtPurchase: priceAtPurchase,
            });

            // Add to total amount
            totalAmount += priceAtPurchase * itemData.quantity;
        } // End for loop

        // Final check on total amount
        if (typeof totalAmount !== 'number' || totalAmount < 0) totalAmount = 0;

        // --- Create and Save Invoice Document ---
        const invoiceData = {
            user: userId,
            items: items,
            totalAmount: totalAmount,
            paymentStatus: "pending", // Start as pending
            paymentMethod: paymentMethod,
            orderStatus: "processing", // Default status
            shippingAddress: shippingAddress,
            paymentIntentId: paymentIntentId, // Can be null initially, updated later
        };
        const invoice = new Invoice(invoiceData);
        const savedInvoice = await invoice.save({ session }); // Save within transaction

        console.log(`SERVICE: Invoice ${savedInvoice._id} saved successfully (within transaction).`);

        // --- Execute Stock Updates ---
        if (stockUpdates.length > 0) {
            console.log(`SERVICE: Executing ${stockUpdates.length} stock update operations...`);
            const stockUpdateResult = await Variant.bulkWrite(stockUpdates, { session });
            console.log("SERVICE: Stock update result:", JSON.stringify(stockUpdateResult));

            // Check if the number of modified documents matches the expected updates
            // This basic check might not be perfect if stock was already 0 or multiple items used same variant
            if (stockUpdateResult.modifiedCount < stockUpdates.length && stockUpdateResult.matchedCount < stockUpdates.length) {
                // If matched count is less, it implies the variant wasn't found OR stock was already insufficient (if filter included $gte)
                console.error("SERVICE: Stock update failed for some items (likely insufficient stock or variant removed). Aborting transaction.");
                throw new Error("Failed to update stock for all items. Order cancelled.");
            }
            console.log("SERVICE: Stock levels updated successfully.");
        }

        // --- Commit Transaction ---
        await session.commitTransaction();
        console.log("SERVICE: Transaction committed successfully.");

        return savedInvoice; // Return the successfully created invoice

    } catch (error) {
        // If any error occurs, abort the transaction
        await session.abortTransaction();
        console.error("SERVICE: Transaction aborted. Error during invoice creation/stock update:", error);
        throw new Error(`Failed to create invoice: ${error.message}`); // Propagate error
    } finally {
        // Always end the session
        session.endSession();
        console.log("SERVICE: Session ended.");
    }
};

// --- GET INVOICES FOR USER ---
const getInvoiceService = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid User ID format");
        }
        const invoices = await Invoice.find({ user: userId })
            .populate({ path: "user", select: "name email" })
            .populate({
                path: "items.product",
                select: "name images base_price category brand",
                populate: { path: "category brand", select: "name" },
            })
            .populate({ path: "items.variant", select: "types price" }) // Populate variant
            .sort({ createdAt: -1 })
            .lean();
        return invoices;
    } catch (error) {
        console.error("Error getting invoices:", error);
        throw new Error("Error getting invoices: " + error.message);
    }
};

// --- UPDATE INVOICE STATUS (Admin) ---
const updateInvoiceStatusService = async (invoiceId, statusUpdates) => {
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
        throw new Error("Invalid invoice ID format");
    }
    const validatedUpdates = {};
    // Validate incoming statuses against schema enums
    if (statusUpdates.orderStatus && Invoice.schema.path('orderStatus').enumValues.includes(statusUpdates.orderStatus)) {
        validatedUpdates.orderStatus = statusUpdates.orderStatus;
    }
    if (statusUpdates.paymentStatus && Invoice.schema.path('paymentStatus').enumValues.includes(statusUpdates.paymentStatus)) {
        validatedUpdates.paymentStatus = statusUpdates.paymentStatus;
    }
    if (Object.keys(validatedUpdates).length === 0) {
        throw new Error("No valid status fields provided for update.");
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { $set: validatedUpdates },
        { new: true, runValidators: true }
    )
        .populate('user', 'name email')
        .populate({ path: "items.product", select: "name" })
        .populate({ path: "items.variant", select: "types" })
        .lean();

    if (!updatedInvoice) {
        throw new Error(`Invoice with ID '${invoiceId}' not found.`);
    }

    // TODO: Add side effects for status changes (e.g., email notifications)
    // if (validatedUpdates.orderStatus === 'shipped') { /* ... */ }
    // if (validatedUpdates.paymentStatus === 'paid' && updatedInvoice.paymentMethod !== 'CARD') { /* ... e.g. clear cart if COD/Bank */ }

    return updatedInvoice;
};

module.exports = { createInvoiceService, getInvoiceService, updateInvoiceStatusService };