// services/invoiceService.js
// Refactored for separate Variant collection

const mongoose = require("mongoose");
const Invoice = require("../models/invoice");
const { Product } = require("../models/product");
const Variant = require("../models/variant"); // <-- Import the Variant model
const { triggerOrderConfirmationEmail } = require("../utils/helper");

// --- CREATE INVOICE ---
const createInvoiceService = async (
    userId,
    productsList,
    paymentMethod,
    shippingAddress
    // Removed recipientEmail parameter
    // Removed paymentIntentId parameter (should be added later by Stripe controller if needed)
) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let savedInvoice;

    try {
        let items = [];
        let totalAmount = 0;
        const stockUpdates = [];

        // --- Input Validation --- (keep as before, remove recipientEmail validation)
        if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid User ID format.");
        if (!productsList || !Array.isArray(productsList) || productsList.length === 0) throw new Error("Product list cannot be empty.");
        if (!paymentMethod || !Invoice.schema.path('paymentMethod').enumValues.includes(paymentMethod)) throw new Error("Invalid or missing paymentMethod.");
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city /*...etc*/) throw new Error("Incomplete shippingAddress provided.");

        // --- Process Items --- (keep as before: fetch product/variant, check stock, calc price, prepare stock update)
        for (let itemData of productsList) {
            if (!itemData || !itemData.productId /* ... etc ... */) continue;
            // ... (fetch product, fetch variant if itemData.variantId exists) ...
            const product = await Product.findById(itemData.productId).select('name base_price').lean();
            if (!product) throw new Error(`Product ${itemData.productId} not found.`);
            let priceAtPurchase = product.base_price ?? 0;
            let variantIdToSave = null;
            let currentStock = Infinity;
            if (itemData.variantId) {
                const variant = await Variant.findById(itemData.variantId).session(session);
                if (!variant || variant.product.toString() !== itemData.productId) throw new Error(`Variant ${itemData.variantId} invalid.`);
                priceAtPurchase = (typeof variant.price === 'number' && variant.price >= 0) ? variant.price : priceAtPurchase;
                variantIdToSave = variant._id;
                currentStock = variant.stock;
                if (itemData.quantity > currentStock) throw new Error(`Insufficient stock for ${product.name} (Variant).`);
                stockUpdates.push({ updateOne: { filter: { _id: variantIdToSave }, update: { $inc: { stock: -itemData.quantity } } } });
            } else { /* handle base product if needed */ }
            items.push({ product: product._id, variant: variantIdToSave, quantity: itemData.quantity, priceAtPurchase });
            totalAmount += priceAtPurchase * itemData.quantity;
        } // End for loop

        // --- Create Invoice ---
        const invoiceData = {
            user: userId, items, totalAmount, paymentMethod, shippingAddress,
            paymentStatus: "pending", orderStatus: "processing",
        };
        const invoice = new Invoice(invoiceData);
        savedInvoice = await invoice.save({ session });

        // --- Update Stock Levels ---
        if (stockUpdates.length > 0) {
            const stockUpdateResult = await Variant.bulkWrite(stockUpdates, { session });
            if (stockUpdateResult.modifiedCount < stockUpdates.length && stockUpdateResult.matchedCount < stockUpdates.length) {
                throw new Error("Stock update failed for some items. Order cancelled.");
            }
            console.log("SERVICE: Stock levels updated successfully.");
        }

        // --- Commit Transaction ---
        await session.commitTransaction();
        console.log(`SERVICE: Invoice ${savedInvoice._id} transaction committed.`);

        // --- Trigger Email Sending (using invoice user's email) ---
        triggerOrderConfirmationEmail(savedInvoice) // Pass only the saved invoice
            .catch(emailError => console.error(`Failed to trigger confirmation email for Invoice ${savedInvoice._id}:`, emailError));

        return savedInvoice; // Return the saved invoice object

    } catch (error) {
        await session.abortTransaction();
        console.error("SERVICE: Transaction aborted due to error:", error);
        throw new Error(`Failed to create invoice: ${error.message}`);
    } finally {
        session.endSession();
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