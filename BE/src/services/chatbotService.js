// services/chatbotService.js (Improved Intent & Context)
const { GoogleGenerativeAI } = require("@google/generative-ai");
const invoiceService = require('./invoiceService');
const productService = require('./productService');
const mongoose = require('mongoose'); // For ObjectId check

// Initialize LLM Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

async function handleChatbotQueryService(userId, userMessage) {
    try {
        let intent = 'general_query';
        let extractedData = {};
        const lowerMessage = userMessage.toLowerCase();

        // --- 1. Improved Intent Recognition ---
        const orderStatusMatch = lowerMessage.match(/order status.*#?([a-fA-F0-9]{24})\b/);
        const productNameMatch = lowerMessage.match(/(?:product|item|about|any|have)\s+(.+)/); // Simple extraction

        if (orderStatusMatch && mongoose.Types.ObjectId.isValid(orderStatusMatch[1])) {
            intent = 'order_status';
            extractedData.invoiceId = orderStatusMatch[1];
        } else if (productNameMatch && productNameMatch[1]) {
            // Check if it looks like a specific product request
            intent = 'product_info';
            // Extract potential product name/type (very basic, needs improvement)
            extractedData.productName = productNameMatch[1].replace(/[?.!]$/, '').trim(); // Remove trailing punctuation
            // Filter out vague terms if needed
            if (['it', 'them', 'something'].includes(extractedData.productName)) {
                intent = 'general_query'; // Revert if too vague
                delete extractedData.productName;
            }
        } else if (lowerMessage.includes('iphone') || lowerMessage.includes('laptop') || lowerMessage.includes('watch')) {
            // Catch specific keywords if the general match fails
            intent = 'product_info';
            // Attempt to extract the keyword itself as the search term
            const keywords = ['iphone', 'laptop', 'watch', /* add other common category/brand names */];
            extractedData.productName = keywords.find(kw => lowerMessage.includes(kw)) || 'product'; // Fallback
        }
        // Add more sophisticated intent recognition if needed (e.g., using the LLM itself)
        // --- End Intent Recognition ---


        let contextData = "";
        let promptPrefix = `You are a helpful e-commerce assistant for 'TechWorld Store'. Be friendly and answer the user's question concisely based ONLY on the information provided below. If the information isn't sufficient, politely say you cannot answer that specific query or ask for clarification.\n\n`;
        let finalPrompt = "";

        // --- 2. Fetch Data from DB based on Intent ---
        switch (intent) {
            case 'order_status':
                if (!extractedData.invoiceId) return "Please provide the order ID.";

                // Fetch specific invoice securely
                const userInvoices = await invoiceService.getInvoiceService(userId); // Assumes this fetches only user's invoices
                const specificInvoice = userInvoices.find(inv => inv._id.toString() === extractedData.invoiceId);

                if (!specificInvoice) {
                    return `Sorry, I couldn't find order #${extractedData.invoiceId} associated with your account.`;
                }
                // Build more detailed context if needed
                contextData = `Relevant Invoice Data:\nID: ${specificInvoice._id}\nOrder Status: ${specificInvoice.orderStatus}\nPayment Status: ${specificInvoice.paymentStatus}\nTotal Amount: ${specificInvoice.totalAmount}\nOrder Date: ${specificInvoice.createdAt}`;
                finalPrompt = `${promptPrefix}CONTEXT:\n${contextData}\n\nUSER QUESTION:\n${userMessage}\n\nASSISTANT ANSWER:`;
                break;

            case 'product_info':
                if (!extractedData.productName) return "Which product or item are you asking about?";

                // Use your product service to search the DB
                console.log(`Searching DB for products matching: "${extractedData.productName}"`);
                const products = await productService.getProductsByNameService(extractedData.productName);

                if (!products || products.length === 0) {
                    return `Sorry, I couldn't find any products matching "${extractedData.productName}" in our catalog right now.`;
                }

                // --- Build context based on search results ---
                contextData = `Found the following product(s) matching "${extractedData.productName}":\n\n`;
                // List first few results (e.g., up to 3)
                products.slice(0, 3).forEach((p, index) => {
                    contextData += `${index + 1}. Name: ${p.name}\n   Price: ${p.base_price} VND\n   Description: ${p.description ? p.description[0] : 'N/A'}\n\n`; // Add more details? Stock?
                });
                if (products.length > 3) {
                    contextData += `...and ${products.length - 3} more.`;
                }
                contextData += `\nBased *only* on this product data, answer the user's question.`;
                // --- End context building ---

                finalPrompt = `${promptPrefix}CONTEXT:\n${contextData}\n\nUSER QUESTION:\n${userMessage}\n\nASSISTANT ANSWER:`;
                break;

            default: // General query
                finalPrompt = `${promptPrefix}USER QUESTION:\n${userMessage}\n\nASSISTANT ANSWER:`;
                break;
        }

        // --- 3. Call LLM API ---
        console.log("Sending prompt to LLM:", finalPrompt.substring(0, 300) + "...");
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();
        console.log("LLM Response received.");

        return text;

    } catch (error) {
        console.error("Chatbot Service Error:", error);
        if (error.name === 'GoogleGenerativeAIFetchError') {
            return `Sorry, I'm having trouble connecting to the AI service right now (${error.status || 'Unknown Status'}). Please try again later.`;
        }
        return "Sorry, I encountered an internal error trying to process your request. Please try again later.";
    }
}

module.exports = { handleChatbotQueryService };