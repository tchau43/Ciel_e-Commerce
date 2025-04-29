//node ./src/migrations/005_migrateStock.js
const mongoose = require('mongoose');
const Variant = require('../models/variant');
require('dotenv').config();

// --- Cấu hình kết nối Database ---
// Thay thế bằng chuỗi kết nối MongoDB thực tế của bạn
// Ví dụ: 'mongodb://localhost:27017/ten_database_cua_ban'
// Hoặc sử dụng biến môi trường: process.env.MONGODB_URI

async function migrateVariantStock() {
    console.log('Bắt đầu quá trình migration stock...');

    try {
        // 1. Kết nối đến MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            // Các tùy chọn Mongoose hiện đại không còn yêu cầu useNewUrlParser và useUnifiedTopology
            // Nhưng bạn có thể cần chúng nếu dùng phiên bản Mongoose cũ hơn
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log('Đã kết nối thành công đến MongoDB.');

        // 2. Thực hiện cập nhật hàng loạt (bulk update)
        // Sử dụng updateMany để cập nhật tất cả các document khớp với điều kiện (ở đây là tất cả, nên dùng {})
        // Sử dụng toán tử $set để đặt giá trị mới cho trường 'stock'
        const updateResult = await Variant.updateMany(
            {}, // Điều kiện lọc: để trống {} nghĩa là chọn tất cả các document
            { $set: { stock: 100 } } // Hành động cập nhật: đặt trường stock thành 100
        );

        console.log('--- Kết quả Migration ---');
        console.log(`Số lượng documents khớp với điều kiện: ${updateResult.matchedCount}`);
        console.log(`Số lượng documents đã được sửa đổi: ${updateResult.modifiedCount}`);
        // Lưu ý: modifiedCount có thể nhỏ hơn matchedCount nếu một số document đã có stock là 100.

        console.log('Quá trình migration stock đã hoàn tất thành công!');

    } catch (error) {
        // 3. Xử lý lỗi nếu có
        console.error('Đã xảy ra lỗi trong quá trình migration:', error);
    } finally {
        // 4. Đóng kết nối database sau khi hoàn tất hoặc gặp lỗi
        try {
            await mongoose.disconnect();
            console.log('Đã ngắt kết nối khỏi MongoDB.');
        } catch (disconnectError) {
            console.error('Lỗi khi ngắt kết nối MongoDB:', disconnectError);
        }
    }
}

// Chạy hàm migration
migrateVariantStock();