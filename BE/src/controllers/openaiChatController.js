// src/controllers/openaiChatController.js
const openaiAssistantService = require('../services/openaiAssistantService');
const chatHistoryService = require('../services/chatHistoryService'); // Để lưu lịch sử nếu muốn
const logger = require('../config/logger'); //

const handleOpenAIChat = async (req, res, next) => {
    const { message, threadId } = req.body; // Frontend gửi message và threadId (nếu có)
    // const userId = req.user?._id; // Lấy userId nếu route yêu cầu đăng nhập
    // console.log("Received message:", message, "Thread ID:", threadId);
    if (!message) {
        return res.status(400).json({ message: "Missing 'message' in request body" });
    }

    let currentThreadId = threadId;

    try {
        // 1. Lấy hoặc tạo Thread ID
        currentThreadId = await openaiAssistantService.getOrCreateThread(currentThreadId);

        // (Tùy chọn) Lưu tin nhắn người dùng vào DB của bạn
        // const userSession = await chatHistoryService.getOrCreateSession(userId, currentThreadId);
        // await chatHistoryService.saveMessage(userSession._id, 'user', message);

        // 2. Thêm tin nhắn người dùng vào Thread OpenAI
        await openaiAssistantService.addMessageToThread(currentThreadId, message);
        console.log("---------------currentThreadId", currentThreadId);

        // 3. Chạy Assistant và lấy phản hồi (hàm này đã bao gồm polling và function calling)
        const assistantReply = await openaiAssistantService.runAssistantAndGetResponse(currentThreadId);

        // (Tùy chọn) Lưu tin nhắn của bot vào DB của bạn
        // await chatHistoryService.saveMessage(userSession._id, 'bot', assistantReply || '');

        // 4. Trả lời Frontend
        res.status(200).json({
            reply: assistantReply || "Tôi không thể đưa ra phản hồi lúc này.", // Trả lời của Assistant
            threadId: currentThreadId // Trả lại threadId để frontend lưu và dùng tiếp
        });

    } catch (error) {
        logger.error(`Error in handleOpenAIChat controller: ${error.message}`, error); //
        res.status(500).json({ message: error.message || "An internal server error occurred" });
        // next(error);
    }
};

module.exports = {
    handleOpenAIChat,
};