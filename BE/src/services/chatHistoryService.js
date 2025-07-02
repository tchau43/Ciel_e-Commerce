const mongoose = require('mongoose');
const ChatSession = require('../models/chatSession');
const ChatMessage = require('../models/chatMessage');
const logger = require('../config/logger');

const getOrCreateSession = async (userId, threadId) => {
    try {
        let session;

        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid userId format');
            }

            session = await ChatSession.findOne({
                userId,
                isActive: true
            });

            if (!session) {
                session = new ChatSession({
                    userId: new mongoose.Types.ObjectId(userId),
                    threadId: new mongoose.Types.ObjectId().toString(),
                    isActive: true
                });
                await session.save();
            }
            return session;
        }

        if (threadId) {
            session = await ChatSession.findOne({
                threadId,
                userId: null,
                isActive: true
            });

            if (session) {
                return session;
            }

            try {
                session = new ChatSession({
                    threadId,
                    isActive: true
                });
                await session.save();
                return session;
            } catch (saveError) {
                if (saveError.code === 11000) {
                    session = await ChatSession.findOne({
                        threadId,
                        userId: null,
                        isActive: true
                    });

                    if (session) {
                        return session;
                    }
                }
                session = new ChatSession({
                    threadId: new mongoose.Types.ObjectId().toString(),
                    isActive: true
                });
                await session.save();
                return session;
            }
        }

        const newThreadId = new mongoose.Types.ObjectId().toString();
        session = new ChatSession({
            threadId: newThreadId,
            isActive: true
        });
        await session.save();
        return session;

    } catch (error) {
        logger.error(`Error in getOrCreateSession: ${error.message}`);
        throw error;
    }
};

const saveMessage = async (sessionId, sender, message) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new Error('Invalid sessionId format');
        }

        const chatMessage = new ChatMessage({
            sessionId: new mongoose.Types.ObjectId(sessionId),
            sender,
            message
        });
        return await chatMessage.save();
    } catch (error) {
        logger.error(`Error in saveMessage: ${error.message}`);
        throw error;
    }
};

const getMessagesForSession = async (sessionId, limit = 50) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new Error('Invalid sessionId format');
        }

        const messages = await ChatMessage.find({
            sessionId: new mongoose.Types.ObjectId(sessionId)
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return messages.reverse();
    } catch (error) {
        logger.error(`Error in getMessagesForSession: ${error.message}`);
        throw error;
    }
};

const deactivateSession = async (sessionId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new Error('Invalid sessionId format');
        }

        await ChatSession.findByIdAndUpdate(
            new mongoose.Types.ObjectId(sessionId),
            { isActive: false }
        );
    } catch (error) {
        logger.error(`Error in deactivateSession: ${error.message}`);
        throw error;
    }
};

const updateSessionThreadId = async (sessionId, newThreadId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new Error('Invalid sessionId format');
        }

        const existingSession = await ChatSession.findOne({ threadId: newThreadId });
        if (existingSession) {
            if (existingSession._id.toString() === sessionId.toString()) {
                return;
            }
            newThreadId = new mongoose.Types.ObjectId().toString();
        }

        await ChatSession.findByIdAndUpdate(
            new mongoose.Types.ObjectId(sessionId),
            { threadId: newThreadId }
        );
    } catch (error) {
        logger.error(`Error in updateSessionThreadId: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getOrCreateSession,
    saveMessage,
    getMessagesForSession,
    deactivateSession,
    updateSessionThreadId
};