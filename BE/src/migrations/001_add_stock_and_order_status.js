//node ./src/migrations/001_add_stock_and_order_status.js
const mongoose = require('mongoose');
const { Product } = require('../models/product');
const Invoice = require('../models/invoice');
// Import BOTH models needed for this migration
require('dotenv').config(); // If you use .env for your connection string

async function runMigration() {
    try {
        await mongoose.connect(process.env.MONGODB_URI); // Connect ONCE
        console.log("Connected to DB for migration...");

        // --- Task 1: Update Products with Stock ---
        console.log("Starting product stock update...");
        const productResult = await Product.updateMany(
            {},
            // {
            //     'variants': { $exists: true, $ne: [] },
            //     'variants.stock': { $exists: false }
            // },
            // Correct Syntax: Single $set key with multiple fields
            {
                $set: {
                    // 'variants.$[].stock': 100, // If you were setting stock too
                    'averageRating': 0,
                    'numberOfReviews': 0
                }
            }
        );
        console.log(`-> Updated stock for variants in ${productResult.modifiedCount} products.`);


        // --- Task 2: Update Invoices with orderStatus ---
        console.log("Starting invoice orderStatus update...");
        const invoiceResult = await Invoice.updateMany(
            { orderStatus: { $exists: false } },
            { $set: { orderStatus: 'processing' } }
        );
        console.log(`-> Added default orderStatus to ${invoiceResult.modifiedCount} invoices.`);

        console.log("Migration tasks completed successfully.");

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log("Disconnected from DB.");
        }
    }
}

// Run the combined migration
runMigration(); 