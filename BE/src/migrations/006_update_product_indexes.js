//node src/migrations/006_update_product_indexes.js

require('dotenv').config(); // Tải biến môi trường
const mongoose = require('mongoose');
const { updateProductIndex } = require('../services/updateDb/updateProduct');

// Hàm chính để chạy migration
async function runMigration() {
    console.log("--- Starting Migration: Update Product Indexes ---");
    let connection; // Giữ tham chiếu kết nối

    try {
        // 1. Kết nối đến MongoDB
        if (!process.env.MONGODB_URI) {
            throw new Error("Biến môi trường MONGODB_URI chưa được thiết lập.");
        }
        console.log(`Connecting to MongoDB...`);
        connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully.");

        // 2. Gọi hàm cập nhật Product Index
        console.log("Calling updateProductIndex function...");
        await updateProductIndex(); // Thực thi logic cập nhật từ file service
        console.log("updateProductIndex function completed.");

        console.log("--- Migration: Update Product Indexes finished successfully. ---");

    } catch (error) {
        console.error("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("Migration script failed during execution:", error);
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        // Thoát với mã lỗi nếu có lỗi nghiêm trọng
        process.exitCode = 1;
    } finally {
        // 3. Ngắt kết nối MongoDB
        if (mongoose.connection?.readyState === 1) { // Kiểm tra xem kết nối có tồn tại và đang mở không
            await mongoose.disconnect();
            console.log("\nMongoDB disconnected.");
        } else {
            console.log("\nMongoDB connection already closed or not established.");
        }
    }
}

// --- Chạy Migration ---
runMigration();