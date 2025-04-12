// src/services/chatgptService.js
const axios = require('axios');
const Product = require('../models/product'); // Import your Product model (adjust path if needed)
// Import other models you might need to query (User, Category, etc.)
// const User = require('../models/user');
// const Category = require('../models/category');

// --- Helper function to search your database (Example for Products) ---
// You'll need to make this more sophisticated based on the user's query.
// This is a very basic example searching product names.
const searchDatabaseForContext = async (userMessage) => {
  try {
    // Example: Simple keyword search in product names or descriptions
    // You might need more advanced logic like NLP to understand intent
    // or specific commands like "what is the price of [product name]?"
    const keywords = userMessage.toLowerCase().split(' '); // Basic keyword splitting

    // Search products based on keywords (adjust query as needed)
    const relevantProducts = await Product.find({
        // Example: Search name and description using regex for partial matches
        $or: [
             { name: { $regex: keywords.join('|'), $options: 'i' } },
             { description: { $regex: keywords.join('|'), $options: 'i' } }
        ]
    }).limit(3); // Limit the amount of context to avoid overly long prompts

    if (relevantProducts.length > 0) {
        // Format the data clearly for the LLM
        let context = "Relevant product information from database:\n";
        relevantProducts.forEach(p => {
            context += `- Name: ${p.name}, Price: ${p.price}, Description: ${p.description}, Stock: ${p.stock}\n`; // Add relevant fields
        });
        return context;
    } else {
        return "No specific product information found in the database for this query.";
    }
  } catch (error) {
      console.error('Error searching database for context:', error);
      return "Error retrieving information from database.";
  }
};

// --- Main function to interact with OpenAI, now including context retrieval ---
const getChatGPTResponseWithContext = async (userMessage) => {
  try {
    // 1. Search your database for relevant context
    const dbContext = await searchDatabaseForContext(userMessage);

    // 2. Construct the prompt for OpenAI, including the context
    const systemMessage = `You are a helpful assistant for our e-commerce store. Answer the user's questions based *only* on the provided context. If the context doesn't contain the answer, say you don't have that specific information from the database. Do not use your general knowledge unless asked explicitly.`;

    const messages = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: `Context:\n---\n${dbContext}\n---\n\nUser Question: ${userMessage}` }
    ];

    // 3. Call the OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // Or your preferred model
        messages: messages
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 4. Return the response content
    return response.data.choices[0].message.content;

  } catch (error) {
    // Handle potential errors from the OpenAI API call
    if (error.response) {
        console.error('Error from OpenAI API:', error.response.status, error.response.data);
    } else {
        console.error('Error interacting with OpenAI API:', error.message);
    }
    // Consider throwing the error or returning a specific error message
    throw new Error('Failed to get response from ChatGPT API after searching database.');
  }
};

module.exports = {
  getChatGPTResponseWithContext, // Export the new function
};