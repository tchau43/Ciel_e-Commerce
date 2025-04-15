// services/invoiceService.js
const Invoice = require("../models/invoice");
const { Product } = require("../models/product"); // Assuming Product model is exported this way

/**
 * Creates and saves a new invoice to the database.
 * Sets initial paymentStatus to 'pending'.
 * Calculates totalAmount based on products and variants.
 *
 * @param {string} userId - The ID of the user placing the order.
 * @param {Array<{productId: string, quantity: number, variantId?: string | null}>} productsList - List of products to include.
 * @param {string} paymentMethod - The intended payment method (e.g., "COD", "Stripe").
 * @param {object} shippingAddress - The structured shipping address object.
 * @param {string} [paymentIntentId] - Optional: The Stripe Payment Intent ID if applicable.
 * @returns {Promise<object>} - The saved Mongoose invoice document.
 * @throws {Error} - Throws error if product not found or saving fails.
 */
const createInvoiceService = async (
    userId,
    productsList,
    paymentMethod,
    shippingAddress,
    paymentIntentId = null // Optional parameter for Stripe flow
) => {
    console.log("SERVICE: createInvoiceService called with:", { userId, productsList, paymentMethod, shippingAddress, paymentIntentId });
    try {
        let items = [];
        let totalAmount = 0;

        if (!productsList || productsList.length === 0) {
            throw new Error("Product list cannot be empty.");
        }

        for (let productItem of productsList) {
            if (!productItem || !productItem.productId || !productItem.quantity) {
                console.warn("SERVICE: Skipping invalid product item:", productItem);
                continue; // Skip malformed items
            }

            const product = await Product.findById(productItem.productId).lean(); // Use .lean() for plain JS object if not modifying product
            if (!product) {
                console.error(`SERVICE: Product not found: ${productItem.productId}`);
                throw new Error(`Product with ID ${productItem.productId} not found`);
            }

            let priceAtPurchase = product.base_price ?? 0;
            let variantInfo = null;

            // Find correct price based on variant
            if (productItem.variantId && product.variants && product.variants.length > 0) {
                // Ensure variantId comparison is correct (ObjectId vs String)
                variantInfo = product.variants.find(
                    (v) => v._id && v._id.toString() === productItem.variantId
                );
                if (variantInfo && typeof variantInfo.price === 'number') {
                    priceAtPurchase = variantInfo.price;
                } else {
                    console.warn(`SERVICE: Variant ${productItem.variantId} not found or invalid price for product ${product._id}. Using base price.`);
                    // Keep base_price as default
                }
            }

            if (typeof priceAtPurchase !== 'number' || priceAtPurchase < 0) {
                console.error(`SERVICE: Invalid price calculated for product ${product._id}. Price: ${priceAtPurchase}`);
                priceAtPurchase = 0; // Fallback to 0 if price is invalid
            }


            items.push({
                product: product._id, // Store the ObjectId reference
                quantity: productItem.quantity,
                priceAtPurchase: priceAtPurchase,
                // Store variant ObjectId if needed:
                // variant: variantInfo ? variantInfo._id : undefined,
            });

            totalAmount += priceAtPurchase * productItem.quantity;
        }

        // Ensure totalAmount is a non-negative number
        if (typeof totalAmount !== 'number' || totalAmount < 0) {
            console.error(`SERVICE: Invalid total amount calculated: ${totalAmount}. Setting to 0.`);
            totalAmount = 0;
        }


        // Prepare data matching the Mongoose Schema
        const invoiceData = {
            user: userId,
            items: items,
            totalAmount: totalAmount,
            paymentStatus: "pending", // *** Always starts as pending ***
            paymentMethod: paymentMethod, // Store the method used (COD/Stripe)
            shippingAddress: shippingAddress, // The structured address object
            paymentIntentId: paymentIntentId, // Store Stripe PI ID if provided
        };

        console.log("SERVICE: Prepared invoice data for saving:", invoiceData);

        // Create a new Invoice document using the Mongoose model
        const invoice = new Invoice(invoiceData);

        // Save the document to the database
        const savedInvoice = await invoice.save();

        console.log(`SERVICE: Invoice ${savedInvoice._id} saved successfully.`);

        // Return the saved document (includes _id, timestamps, etc.)
        return savedInvoice;

    } catch (error) {
        console.error("SERVICE: Error during invoice creation:", error);
        // Propagate the error to be handled by the controller
        throw new Error(`Failed to save invoice: ${error.message}`);
    }
};

// --- getInvoiceService from previous answer ---
const getInvoiceService = async (userId) => {
    // ... (implementation as provided before) ...
    try {
        const invoices = await Invoice.find({ user: userId })
            .populate({
                path: "user",
                select: "name email",
            })
            .populate({
                path: "items.product",
                select: "name images base_price variants category brand", // Select needed fields
                populate: {
                    path: "category brand",
                    select: "name", // Select only name from category/brand
                },
            })
            .sort({ createdAt: -1 });

        return invoices;
    } catch (error) {
        console.error("Error getting invoices:", error);
        throw new Error("Error getting invoices: " + error.message);
    }
};
// ---

module.exports = { createInvoiceService, getInvoiceService };