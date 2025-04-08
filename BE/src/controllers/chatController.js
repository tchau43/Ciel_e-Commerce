// src/controllers/chatController.js
// Rename the imported function to match the service export
const { getChatGPTResponseWithContext } = require("../services/chatgptService");

const getChatbotResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Call the service function that includes context retrieval
    const response = await getChatGPTResponseWithContext(message);

    res.status(200).json({ response });
  } catch (error) {
    console.error("Error in chat controller:", error); // Log the specific error
    res.status(500).json({ error: "Failed to get chatbot response." }); // More generic message to user
  }
};

module.exports = {
  getChatbotResponse,
};
