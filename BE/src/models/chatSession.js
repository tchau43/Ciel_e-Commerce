// src/models/chatSession.js
const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    // Tham chiếu đến người dùng (nếu đã đăng nhập)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Liên kết với model User bạn đã có
        index: true, // Index để tìm các phiên của một user
        required: false // Cho phép phiên ẩn danh (guest)
    },
    // (Tùy chọn) Một định danh cho phiên ẩn danh (nếu không có userId)
    // Có thể tạo bằng UUID hoặc một cơ chế khác ở frontend/backend
    guestSessionId: {
        type: String,
        index: true,
        unique: true,
        sparse: true, // Chỉ yêu cầu unique nếu tồn tại (cho phép nhiều session có userId)
        required: function () { return !this.userId; } // Bắt buộc nếu không có userId
    },
    // Thời điểm phiên bắt đầu (được quản lý bởi timestamps)
    // createdAt
    // Thời điểm có hoạt động cuối cùng (được quản lý bởi timestamps)
    // updatedAt
    // (Tùy chọn) Lưu trữ tóm tắt hoặc trạng thái cuối cùng của phiên
    summary: {
        type: String,
        trim: true
    },
    // (Tùy chọn) Đánh dấu nếu phiên đã kết thúc hoặc bị đóng
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Đảm bảo ít nhất userId hoặc guestSessionId tồn tại
chatSessionSchema.pre('validate', function (next) {
    if (!this.userId && !this.guestSessionId) {
        next(new Error('ChatSession must have either a userId or a guestSessionId.'));
    } else {
        next();
    }
});


const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;