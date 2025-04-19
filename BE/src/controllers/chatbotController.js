// controllers/chatbotController.js

const { handleChatbotQueryService } = require("../services/chatbotService");

/**
 * Handles incoming chatbot queries from authenticated users.
 * POST /chatbot/query
 */
const handleChatbotQuery = async (req, res) => {
  console.log("API call received for handleChatbotQuery");
  try {
    // 1. Get user message from request body
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: "Message content is required and must be a non-empty string." });
    }

    // 2. Get authenticated user ID from middleware (verifyToken)
    const userId = req.user?._id; // Assumes verifyToken attached req.user
    if (!userId) {
      // Should ideally be caught by verifyToken, but good to check
      console.warn("Chatbot query received without authenticated user ID.");
      return res.status(401).json({ message: "Authentication required to use the chatbot." });
    }

    console.log(`Chatbot query from User ${userId}: "${message}"`);

    // 3. Call the chatbot service to process the message
    // The service will handle intent recognition, DB fetching (if needed), and LLM interaction
    const reply = await handleChatbotQueryService(userId.toString(), message.trim());

    // 4. Send the chatbot's reply back to the frontend
    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error("Error in handleChatbotQuery controller:", error);
    // Send a generic error response
    res.status(500).json({ message: "Sorry, the chatbot encountered an error. Please try again later." });
  }
};

module.exports = {
  handleChatbotQuery,
};