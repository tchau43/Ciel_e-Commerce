//node src/migrations/006_update_product_indexes.js

require('dotenv').config();
const mongoose = require('mongoose');
const { updateProductIndex } = require('../services/updateDb/updateProduct');

async function runMigration() {
    console.log("--- Starting Migration: Update Product Indexes ---");
    let connection;

    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("Biến môi trường MONGODB_URI chưa được thiết lập.");
        }
        console.log(`Connecting to MongoDB...`);
        connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully.");

        console.log("Calling updateProductIndex function...");
        await updateProductIndex();
        console.log("updateProductIndex function completed.");

        console.log("--- Migration: Update Product Indexes finished successfully. ---");

    } catch (error) {
        console.error("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("Migration script failed during execution:", error);
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        process.exitCode = 1;
    } finally {
        if (mongoose.connection?.readyState === 1) {
            await mongoose.disconnect();
            console.log("\nMongoDB disconnected.");
        } else {
            console.log("\nMongoDB connection already closed or not established.");
        }
    }
}

runMigration();