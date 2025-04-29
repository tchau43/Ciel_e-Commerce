// src/controllers/chatbotController.js
const chatbotService = require('../services/chatbotService'); //
const chatHistoryService = require('../services/chatHistoryService');
const logger = require('../config/logger'); //
const { v4: uuidv4 } = require('uuid');

const handleChat = async (req, res, next) => {
  try {
    const userQuery = req.body.message;
    const userId = req.user ? req.user._id : null;
    let clientSessionId = req.body.sessionId; // Frontend should send this for guests

    if (!userQuery) {
      logger.error('Missing user message in request body');
      return res.status(400).json({ message: 'Missing message in request body' });
    }

    // --- Session Management ---
    let session;
    if (userId) {
      session = await chatHistoryService.getOrCreateSession(userId, null);
      clientSessionId = session._id.toString();
    } else if (clientSessionId) {
      session = await chatHistoryService.getOrCreateSession(null, clientSessionId);
      clientSessionId = session.guestSessionId || session._id.toString(); // Prefer guestSessionId if available
    } else {
      session = await chatHistoryService.getOrCreateSession(null, null);
      clientSessionId = session.guestSessionId;
    }

    if (!session || !session._id) {
      throw new Error("Failed to establish a chat session.");
    }
    const currentSessionId = session._id; // Mongoose ObjectId
    // ------------------------

    logger.info(`Handling chat for Session: ${currentSessionId}, User: ${userId || `Guest (${session.guestSessionId || clientSessionId})`}, Query: ${userQuery}`);

    // Call service (which now also saves history internally)
    const response = await chatbotService.generateResponse(userQuery, userId, currentSessionId);

    // Return reply and session identifier
    res.status(200).json({
      reply: response,
      // Return the ID frontend should use for subsequent requests
      sessionId: userId ? currentSessionId.toString() : clientSessionId
    });

  } catch (error) {
    logger.error(`Error in handleChat controller: ${error.message}`, error);
    res.status(500).json({ message: "An internal server error occurred." });
    // next(error);
  }
};

module.exports = {
  handleChat,
};