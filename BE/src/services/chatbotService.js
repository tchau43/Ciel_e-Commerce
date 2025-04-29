// src/services/chatbotService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const logger = require('../config/logger'); //
const mongoose = require('mongoose');

// --- Import các service bạn cần ---
const productService = require('./productService'); //
const categoryService = require('./categoryService'); //
const invoiceService = require('./invoiceService'); //
const cartService = require('./cartService'); //
const couponService = require('./couponService'); //
const chatHistoryService = require('./chatHistoryService'); // Service mới
const { formatCurrencyVND } = require('../utils/helper'); //

// --- Khởi tạo Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// --- Hàm NLU ---
async function getIntentAndEntities(userQuery) {
    // (Như code đã cung cấp ở phản hồi trước - dùng Gemini để phân tích intent/entities)
    const nluPrompt = `
Analyze the following user query for an e-commerce chatbot. Identify the primary intent and extract relevant entities.
Respond ONLY with a valid JSON object containing "intent" (string) and "entities" (object).
If the intent is unclear, use "unknown". If no specific entities are found, return an empty object for "entities".

Possible intents: check_order_status, find_product, find_extreme_product, list_categories, list_brands, check_cart, ask_general_info, check_coupon, unknown.
Relevant entities: order_id (string), product_name (string), category_name (string), brand_name (string), coupon_code (string), topic (string), attribute (string, e.g., 'price'), order (string, e.g., 'ascending', 'descending').

User Query: "${userQuery}"

JSON Response:
`;
    try {
        logger.debug(`Sending NLU query to Gemini for: "${userQuery}"`);
        const result = await model.generateContent(nluPrompt);
        const response = await result.response;
        let jsonResponse = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        logger.debug(`NLU JSON response raw: ${jsonResponse}`);
        const parsedJson = JSON.parse(jsonResponse);
        logger.info(`NLU Result: Intent='${parsedJson.intent}', Entities='${JSON.stringify(parsedJson.entities)}'`);
        return parsedJson;
    } catch (error) {
        logger.error(`Error during NLU processing: ${error.message}`, error);
        return { intent: 'unknown', entities: {} };
    }
}

// --- Các hàm Fetch Context ---

// Ví dụ: Lấy thông tin đơn hàng
async function fetchOrderContext(orderId, userId) { // Cần userId để xác thực
    if (!orderId) return "Context: Order ID not provided by user.\n";
    if (!userId) return "Context: User must be logged in to check order status.\n";
    try {
        // TODO: Thay thế bằng logic gọi invoiceService của bạn
        // Ví dụ: Tìm invoice theo orderId VÀ userId để đảm bảo quyền truy cập
        // const invoice = await invoiceService.getInvoiceByCodeAndUser(orderId, userId); // Giả sử có hàm này
        const invoice = null; // <<<< THAY THẾ BẰNG LOGIC GỌI SERVICE THỰC TẾ

        if (!invoice) return `Context: No order found with ID/Code ${orderId} for the logged-in user.\n`;
        return `Context: Order ${orderId} status is ${invoice.orderStatus}. Total: ${formatCurrencyVND(invoice.totalAmount)}. Payment: ${invoice.paymentStatus}. Placed on: ${invoice.createdAt.toLocaleDateString()}.\n`; //
    } catch (error) {
        logger.error(`Error fetching order context for ${orderId}: ${error.message}`);
        return `Context: Error fetching order details for ${orderId}.\n`;
    }
}

// Ví dụ: Tìm sản phẩm
async function fetchProductContext(productName, categoryName, brandName) {
    try {
        // TODO: Lấy categoryId từ categoryName nếu cần
        let categoryIds = [];
        // const categories = await categoryService.getAllCategoriesService(); //
        // ... logic tìm categoryId ...

        // TODO: Gọi productService.searchProductService hoặc tương tự
        const products = await productService.searchProductService(productName, categoryIds); //

        if (!products || products.length === 0) return "Context: No products found matching the description.\n";

        let context = "Context: Found products:\n";
        products.slice(0, 3).forEach(p => {
            // TODO: Cần logic lấy giá chính xác từ variants hoặc base_price
            const priceInfo = `Price: ${formatCurrencyVND(p.base_price || 0)}`; // Ví dụ đơn giản
            context += `- ${p.name} (Category: ${p.category?.name || 'N/A'}, Brand: ${p.brand?.name || 'N/A'}). ${priceInfo}. View: /product/${p._id}\n`;
        });
        if (products.length > 3) context += "...and more.\n";
        return context;
    } catch (error) {
        logger.error(`Error fetching product context: ${error.message}`);
        return "Context: Error fetching product information.\n";
    }
}

// Ví dụ: Tìm sản phẩm đắt nhất/rẻ nhất
async function fetchExtremeProductContext(attribute, order) {
    if (attribute !== 'price') {
        return "Context: Currently, I can only find the most/least expensive products.\n";
    }
    const sortOrder = (order === 'descending') ? -1 : 1;
    try {
        // Gọi service function đã sửa đổi dùng Aggregation
        const products = await productService.getProductsSortedByPriceService(sortOrder, 1);

        if (!products || products.length === 0) {
            return "Context: Could not determine the product based on the price criteria.\n";
        }
        const p = products[0]; // Kết quả từ aggregate pipeline

        // *** SỬA ĐỔI Ở ĐÂY: Lấy giá 'effectivePrice' từ kết quả aggregate ***
        const priceToSort = p.effectivePrice; // Lấy giá đã dùng để sort

        const priceLabel = sortOrder === -1 ? "most expensive" : "least expensive";

        // Đảm bảo tên category/brand được lấy đúng từ kết quả project
        const categoryName = p.category || 'N/A';
        const brandName = p.brand || 'N/A';

        // Tạo context với thông tin chính xác
        return `Context: The ${priceLabel} product found is: ${p.name} (Category: ${categoryName}, Brand: ${brandName}) with a price of ${formatCurrencyVND(priceToSort)}. View: /product/${p._id}\n`;

    } catch (error) {
        logger.error(`Error fetching extreme product context: ${error.message}`, error); //
        return `Context: Error finding the ${order === 'descending' ? 'most' : 'least'} expensive product.\n`;
    }
}



// Ví dụ: Lấy giỏ hàng
async function fetchCartContext(userId) {
    if (!userId) return "Context: User is not logged in. Cannot check cart.\n";
    try {
        // TODO: Gọi cartService.getCartInfoService
        const cart = await cartService.getCartInfoService(userId); //
        if (!cart || !cart.items || cart.items.length === 0) return "Context: Your shopping cart is currently empty.\n";

        let context = "Context: Your current cart:\n";
        cart.items.forEach(item => {
            context += `- ${item.quantity}x ${item.name} ${item.variantTypes ? '(' + item.variantTypes + ')' : ''} - Subtotal: ${formatCurrencyVND(item.subtotal)}\n`; //
        });
        context += `Total Cart Value: ${formatCurrencyVND(cart.calculatedTotalPrice)}. View Cart: /cart\n`; //
        return context;
    } catch (error) {
        logger.error(`Error fetching cart context for user ${userId}: ${error.message}`);
        return "Context: Error fetching your cart information.\n";
    }
}

// Ví dụ: Lấy danh mục
async function fetchCategoriesContext() {
    try {
        // TODO: Gọi categoryService.getAllCategoriesService
        const categories = await categoryService.getAllCategoriesService(); //
        if (!categories || categories.length === 0) return "Context: No categories found.\n";
        return `Context: Available product categories: ${categories.map(c => c.name).join(', ')}.\n`;
    } catch (error) {
        logger.error(`Error fetching categories context: ${error.message}`);
        return "Context: Error fetching categories.\n";
    }
}
// ... (Thêm các hàm fetch context khác cho brands, coupons, ask_general_info nếu cần) ...


// --- Hàm Generate Response Chính ---
const generateResponse = async (userQuery, userId, sessionId) => {
    let nluResult = { intent: 'unknown', entities: {} };
    let context = "Context: General store information available. Ask about products, categories, orders (if logged in), etc.\n"; // Default context
    let botReply = "I'm sorry, I couldn't understand that. Could you please rephrase?"; // Default reply

    try {
        // 1. Lưu tin nhắn người dùng
        await chatHistoryService.saveMessage(sessionId, 'user', userQuery);

        // 2. NLU
        nluResult = await getIntentAndEntities(userQuery);
        const intent = nluResult.intent;
        const entities = nluResult.entities || {};

        // 3. Fetch Context dựa trên Intent
        // **** ĐÂY LÀ PHẦN QUAN TRỌNG CẦN HOÀN THIỆN LOGIC ****
        logger.info(`Processing intent: ${intent} with entities: ${JSON.stringify(entities)}`); //
        switch (intent) {
            case 'check_order_status':
                context = await fetchOrderContext(entities.order_id, userId);
                break;
            case 'find_product':
                context = await fetchProductContext(entities.product_name, entities.category_name, entities.brand_name);
                break;
            case 'find_extreme_product': // Xử lý intent mới
                context = await fetchExtremeProductContext(entities.attribute, entities.order);
                break;
            case 'list_categories':
                context = await fetchCategoriesContext();
                break;
            // case 'list_brands':
            //     context = await fetchBrandsContext(); // TODO: Implement fetchBrandsContext
            //     break;
            case 'check_cart':
                context = await fetchCartContext(userId);
                break;
            // case 'check_coupon':
            //     context = await fetchCouponContext(entities.coupon_code); // TODO: Implement fetchCouponContext
            //     break;
            case 'ask_general_info':
                // TODO: Implement fetchGeneralInfoContext or use default
                context = "Context: Our store sells great products! You can ask about shipping, returns, or specific items.\n";
                break;
            case 'unknown':
            default:
                logger.warn(`Intent unknown or unhandled for query: "${userQuery}"`); //
                context = "Context: The user's query was unclear or not supported. Ask for clarification or try answering generally about the store.\n";
                break;
        }
        logger.debug(`Context fetched for intent '${intent}': ${context.substring(0, 100)}...`); //

        // 4. Tạo Prompt cuối cùng
        const finalPrompt = `You are a friendly and helpful E-commerce Assistant for the online store.
Use ONLY the provided context below to answer the user's question concisely and accurately.
If the context indicates an error (like 'not found', 'error fetching') or doesn't contain the relevant information, explicitly state that you cannot provide the specific information from the database/system.
Do not make up information, prices, stock levels, order statuses, or URLs.

Context:
---
${context}---

User Question: ${userQuery}

Assistant Answer:`;

        // 5. Gọi Gemini để tạo câu trả lời
        logger.debug(`Sending final prompt to Gemini for session ${sessionId}`);
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        botReply = response.text().trim();

        // 6. Lưu câu trả lời của Bot
        await chatHistoryService.saveMessage(sessionId, 'bot', botReply, { nluData: nluResult, contextData: { retrievedContext: context } });

        logger.info(`Generated bot reply for session ${sessionId}: ${botReply.substring(0, 100)}...`);
        return botReply;

    } catch (error) {
        logger.error(`Error in generateResponse for session ${sessionId}: ${error.message}`, error);
        // Lưu lỗi (tùy chọn)
        try {
            await chatHistoryService.saveMessage(sessionId, 'bot', "I apologize, I encountered an internal error. Please try again later.");
        } catch (saveError) {
            logger.error(`Failed to save error message to history for session ${sessionId}: ${saveError.message}`);
        }
        return "I'm sorry, an error occurred. Please try again later.";
    }
};

module.exports = {
    generateResponse,
};