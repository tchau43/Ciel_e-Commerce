// src/models/chatMessage.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    // Tham chiếu đến phiên trò chuyện chứa tin nhắn này
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession', // Liên kết với model ChatSession
        required: true,
        index: true // Index để truy vấn nhanh các tin nhắn của một phiên
    },
    // Người gửi tin nhắn: 'user' hoặc 'bot'
    sender: {
        type: String,
        required: true,
        enum: ['user', 'bot'], // Chỉ cho phép hai giá trị này
    },
    // Nội dung tin nhắn
    message: {
        type: String,
        required: true,
        trim: true
    },
    // (Tùy chọn) Dữ liệu ngữ cảnh được sử dụng để tạo phản hồi của bot
    // Lưu dưới dạng JSON string hoặc Mixed type (cân nhắc về hiệu năng/truy vấn)
    contextData: {
        type: mongoose.Schema.Types.Mixed, // Hoặc String nếu lưu JSON.stringify
        required: false
    },
    // (Tùy chọn) Intent và Entities được NLU xác định cho tin nhắn của người dùng
    nluData: {
        intent: { type: String, trim: true },
        entities: { type: mongoose.Schema.Types.Mixed } // Lưu object entities
    },
    // (Tùy chọn) Lưu trữ thông tin đánh giá của người dùng về câu trả lời của bot
    feedback: {
        rating: { type: Number, min: 1, max: 5 }, // Ví dụ: 1-5 sao
        comment: { type: String, trim: true }
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;