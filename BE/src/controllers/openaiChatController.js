const logger = require('../config/logger');
const { getOrCreateThread, runAssistantAndGetResponse, addMessageToThread } = require('../services/openaiChatService');
const { getOrCreateSession, saveMessage, getMessagesForSession, updateSessionThreadId } = require('../services/chatHistoryService');
const ChatSession = require('../models/chatSession');

const handleOpenAIChat = async (req, res) => {
    const { message, threadId } = req.body;
    const userId = req.user?._id;
    console.log("--------------------userId", userId);
    console.log("--------------------threadId", threadId);
    console.log("--------------------message", message);
    console.log("--------------------req.user", req.user);
    if (!message) {
        return res.status(400).json({
            success: false,
            message: "Message is required"
        });
    }

    try {
        const session = await getOrCreateSession(userId, threadId);

        await saveMessage(session._id, 'user', message);

        const currentThreadId = await getOrCreateThread(session.threadId);

        if (currentThreadId !== session.threadId) {
            await updateSessionThreadId(session._id, currentThreadId);
        }

        await addMessageToThread(currentThreadId, message);
        const assistantReply = await runAssistantAndGetResponse(currentThreadId);

        if (assistantReply) {
            await saveMessage(session._id, 'bot', assistantReply);
        }

        const chatHistory = await getMessagesForSession(session._id, 10);
        res.status(200).json({
            success: true,
            reply: assistantReply || "I apologize, but I cannot provide a response at this moment.",
            threadId: currentThreadId,
            chatHistory: chatHistory
        });
    } catch (error) {
        logger.error(`Error in handleOpenAIChat: ${error.message}`);
        logger.error(error.stack);
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error: error.message
        });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { threadId } = req.params;

        console.log("--------------------userId", userId);
        console.log("--------------------req.user", req.user);

        let session;
        if (userId) {
            // If user is logged in, get their most recent active session
            session = await ChatSession.findOne({
                userId: userId,
                isActive: true
            }).sort({ createdAt: -1 });
        } else if (threadId) {
            // For guest users, use threadId
            session = await getOrCreateSession(null, threadId);
        } else {
            return res.status(400).json({
                success: false,
                message: "ThreadId is required for guest users"
            });
        }

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "No chat session found"
            });
        }

        const messages = await getMessagesForSession(session._id);
        res.status(200).json({
            success: true,
            threadId: session.threadId,
            chatHistory: messages
        });
    } catch (error) {
        logger.error(`Error in getChatHistory: ${error.message}`);
        logger.error(error.stack);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve chat history",
            error: error.message
        });
    }
};

module.exports = {
    handleOpenAIChat,
    getChatHistory
};