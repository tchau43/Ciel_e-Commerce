// BE/src/controllers/chatbotController.js
const { generateResponse } = require('../services/chatbotService');
const logger = require('../config/logger'); // <--- IMPORT LOGGER TRỰC TIẾP

const handleChat = async (req, res, next) => {
  try {
    const userQuery = req.body.message;
    const userId = req.user ? req.user.id : null;

    if (!userQuery) {
      // Sử dụng logger đã import
      logger.error('Missing user message in request body'); // <--- Sửa: logger.error(...)
      return res.status(400).json({ message: 'Missing message in request body' });
    }

    // Sử dụng logger đã import
    logger.info(`Handling chat for user: ${userId || 'Guest'}, Query: ${userQuery}`); // <--- Sửa: logger.info(...)

    const response = await generateResponse(userQuery, userId);

    res.status(200).json({ reply: response });
  } catch (error) {
    // Sử dụng logger đã import (Dòng 25 cũ)
    logger.error(`Error in handleChat controller: ${error.message}`, error); // <--- Sửa: logger.error(...)
    next(error);
  }
};

module.exports = {
  handleChat,
};