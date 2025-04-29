// src/services/chatHistoryService.js
const mongoose = require('mongoose');
const ChatSession = require('../models/chatSession');
const ChatMessage = require('../models/chatMessage');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger'); //

const getOrCreateSession = async (userId = null, guestSessionId = null) => {
    try {
        let session;
        let query = { isActive: true };

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.userId = userId;
            session = await ChatSession.findOne(query);
            if (!session) {
                logger.info(`Creating new session for user ${userId}`);
                session = new ChatSession({ userId: userId });
                await session.save();
            }
        } else if (guestSessionId) {
            query.guestSessionId = guestSessionId;
            session = await ChatSession.findOne(query);
            if (!session) {
                logger.info(`Creating new guest session ${guestSessionId}`);
                // Kiểm tra xem guestId này có bị trùng không (hiếm khi xảy ra với UUID)
                const existingGuest = await ChatSession.findOne({ guestSessionId: guestSessionId });
                if (existingGuest) {
                    logger.warn(`Guest session ID ${guestSessionId} conflict. Generating new one.`);
                    guestSessionId = uuidv4(); // Tạo ID mới nếu trùng
                }
                session = new ChatSession({ guestSessionId: guestSessionId });
                await session.save();
            }
        } else {
            const newGuestId = uuidv4();
            logger.info(`Creating new guest session (auto-generated ID) ${newGuestId}`);
            session = new ChatSession({ guestSessionId: newGuestId });
            await session.save();
        }
        return session.toObject();
    } catch (error) {
        logger.error(`Error getting or creating chat session: ${error.message}`, error);
        throw error;
    }
};

const saveMessage = async (sessionId, sender, message, options = {}) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new Error("Invalid sessionId format for saving message.");
        }

        const chatMessage = new ChatMessage({
            sessionId: sessionId,
            sender: sender,
            message: message,
            nluData: options.nluData,
            contextData: options.contextData
        });
        const savedMessage = await chatMessage.save();
        logger.debug(`Saved message ${savedMessage._id} for session ${sessionId}`); //
        return savedMessage.toObject();
    } catch (error) {
        logger.error(`Error saving chat message for session ${sessionId}: ${error.message}`, error);
        return null;
    }
};

const getMessagesForSession = async (sessionId, limit = 50) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new Error("Invalid sessionId format for getting messages.");
        }
        const messages = await ChatMessage.find({ sessionId: sessionId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return messages.reverse();
    } catch (error) {
        logger.error(`Error getting messages for session ${sessionId}: ${error.message}`, error);
        throw error;
    }
};

module.exports = {
    getOrCreateSession,
    saveMessage,
    getMessagesForSession
};