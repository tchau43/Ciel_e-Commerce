const Invoice = require("../models/invoice");
const Product = require("../models/product");

const createInvoiceService = async (userId, productsList, payment, address) => {
    try {
        let items = [];
        let totalAmount = 0

        for (let productItem of productsList) {
            const product = await Product.findById(productItem.productId); // Assuming productId is passed
            if (!product) {
                throw new Error("Product not found");
            }

            // Calculate price at purchase (you could also store the actual price in the products list to prevent it from changing)
            const priceAtPurchase = product.price;

            items.push({
                product: product._id,
                quantity: productItem.quantity,
                priceAtPurchase: priceAtPurchase
            });

            totalAmount += priceAtPurchase * productItem.quantity
        }

        const invoice = new Invoice({
            user: userId,
            items: items,
            totalAmount: totalAmount,
            paymentStatus: payment, // or any status you need
            shippingAddress: address // Assuming shipping address is linked to user, or provide in the request body
        });

        // Save the invoice to the database
        const savedInvoice = await invoice.save();

        return savedInvoice;

    } catch (error) {
        throw new Error("Error creating invoice: " + error.message);
    }
}

// services/invoiceService.js
const getInvoiceService = async (userId) => {
    try {
        const invoices = await Invoice.find({ user: userId })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'category', // Populate product's category
                    model: 'Category'
                }
            });
        return invoices;
    } catch (error) {
        throw new Error("Error getting invoice: " + error.message);
    }
}

module.exports = { createInvoiceService, getInvoiceService }