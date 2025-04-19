// BE/src/services/chatbotService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const logger = require('../config/logger'); // <--- IMPORT LOGGER TRỰC TIẾP

// Import các Mongoose models cần thiết
const Category = require('../models/category');
const Brand = require('../models/brand');
const Coupon = require('../models/coupon');
const Review = require('../models/review');
const Cart = require('../models/cart');
const Invoice = require('../models/invoice');
const Variant = require('../models/variant'); // Đảm bảo đã import Variant
const { Product } = require('../models/product');

// Khởi tạo Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Hoặc model bạn muốn dùng

// Hàm helper để lấy dữ liệu (có thể tách ra file riêng nếu phức tạp)
const getStoreContext = async (userId) => {
    try {
        // 1. Lấy thông tin chung
        const categories = await Category.find({ deleted: false }).limit(10).lean();
        const brands = await Brand.find({ deleted: false }).limit(10).lean();
        const coupons = await Coupon.find({
            deleted: false,
            expiryDate: { $gt: new Date() }
        }).limit(5).lean();

        const popularProducts = await Product.find({ deleted: false })
            .sort({ sold: -1, totalViews: -1 })
            .limit(5)
            .populate('variants', 'variantName price stock images')
            .populate('category', 'name')
            .populate('brand', 'name')
            .lean();

        // 2. Lấy thông tin người dùng (nếu có userId)
        let userCart = null;
        let userInvoices = null;
        if (userId) {
            userCart = await Cart.findOne({ userId: userId })
                .populate({
                    path: 'items.variant',
                    select: 'variantName price product',
                    populate: {
                        path: 'product',
                        select: 'name slug thumbnail'
                    }
                })
                .lean();

            userInvoices = await Invoice.find({ userId: userId })
                .sort({ createdAt: -1 })
                .limit(3)
                .select('orderCode status shippingAddress paymentMethod totalAmount createdAt items')
                .populate({
                    path: 'items.variant',
                    select: 'variantName price product',
                    populate: {
                        path: 'product',
                        select: 'name'
                    }
                })
                .lean();
        }

        // 3. Format dữ liệu thành context text
        let contextText = `You are a helpful E-commerce Assistant for 'My Awesome Shop'. Answer the user's questions based *only* on the information provided below. Do not make up information or URLs. Be concise and friendly. Current date: ${new Date().toLocaleDateString()}\n\n`;

        contextText += "=== General Information ===\n";
        contextText += `Categories: ${categories.map(c => c.name).join(', ')}\n`;
        contextText += `Brands: ${brands.map(b => b.name).join(', ')}\n`;
        contextText += `Available Coupons: ${coupons.map(c => `${c.code} (${c.discountType === 'percentage' ? c.discountValue + '%' : '$' + c.discountValue} off, expires ${new Date(c.expiryDate).toLocaleDateString()})`).join('; ')}\n`;

        contextText += "\n=== Popular Products ===\n";
        popularProducts.forEach((p, index) => {
            contextText += `${index + 1}. ${p.name} (Brand: ${p.brand.name}, Category: ${p.category.name})\n`;
            if (p.variants && p.variants.length > 0) {
                const firstVariant = p.variants[0];
                contextText += `   - Example Variant: ${firstVariant.variantName}, Price: $${firstVariant.price}, Stock: ${firstVariant.stock > 0 ? 'Available' : 'Out of Stock'}\n`;
                if (p.variants.length > 1) {
                    contextText += `   - (${p.variants.length} total variants available)\n`
                }
            } else {
                contextText += `   - Price: $${p.originalPrice}\n`;
            }
            contextText += `   - View Product: /product/${p.slug}\n`;
        });


        if (userId && (userCart || userInvoices)) {
            contextText += "\n=== Your Information ===\n";
            if (userCart && userCart.items && userCart.items.length > 0) {
                contextText += "Your Cart:\n";
                userCart.items.forEach(item => {
                    if (item.variant && item.variant.product) {
                        contextText += ` - ${item.quantity}x ${item.variant.product.name} (${item.variant.variantName}) - Price: $${item.variant.price}\n`;
                    } else {
                        contextText += ` - ${item.quantity}x [Product details unavailable]\n`;
                    }
                });
                contextText += `   Cart Total: $${userCart.totalAmount}\n`;
                contextText += `   View Cart: /cart\n`;
            } else if (userCart) {
                contextText += "Your Cart is empty.\n";
            }

            if (userInvoices && userInvoices.length > 0) {
                contextText += "\nYour Recent Orders:\n";
                userInvoices.forEach(inv => {
                    contextText += ` - Order ${inv.orderCode} (Placed: ${new Date(inv.createdAt).toLocaleDateString()}): Status - ${inv.status}, Total: $${inv.totalAmount}\n`;
                    // contextText += `   View Order: /user/purchase/order/${inv._id}\n`;
                    contextText += `   View Order Details: /user/purchase/order/${inv._id}\n`; // Sửa lại link cho rõ nghĩa hơn
                });
                contextText += `   View All Orders: /user/purchase\n`;
            }
        } else if (userId) {
            contextText += "\n=== Your Information ===\n";
            contextText += "Your cart is empty and you have no recent orders.\n";
        }


        contextText += "\n=========================\n";
        // Sử dụng chuỗi 'debug', 'warn' thay vì GLogLevel
        logger.debug(`Generated Context Length: ${contextText.length}`); // <--- Sửa: logger.debug(...)
        const MAX_CONTEXT_LENGTH = 15000;
        if (contextText.length > MAX_CONTEXT_LENGTH) {
            contextText = contextText.substring(0, MAX_CONTEXT_LENGTH) + "\n... (context truncated)\n=========================\n";
            logger.warn(`Context truncated due to length limit.`); // <--- Sửa: logger.warn(...)
        }

        return contextText;

    } catch (error) {
        // Sử dụng logger đã import
        logger.error(`Error fetching store context: ${error.message}`, error); // <--- Sửa: logger.error(...)
        return "Error retrieving store information. Please try again later.\n";
    }
};

const generateResponse = async (userQuery, userId) => {
    try {
        const context = await getStoreContext(userId);
        const prompt = `${context}\nUser Question: ${userQuery}\n\nAssistant Answer:`;

        // Sử dụng logger đã import
        logger.info(`Sending prompt to Gemini for user: ${userId || 'Guest'}`); // <--- Sửa: logger.info(...)
        // logger.debug(`Full Prompt: ${prompt}`); // logger.debug(...)

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Sử dụng logger đã import
        logger.info(`Received response from Gemini for user: ${userId || 'Guest'}`); // <--- Sửa: logger.info(...)
        // logger.debug(`Gemini Response: ${text}`); // logger.debug(...)

        return text;

    } catch (error) {
        // Sử dụng logger đã import
        logger.error(`Error generating response from Gemini: ${error.message}`, error); // <--- Sửa: logger.error(...)
        return "I'm sorry, I encountered an error while processing your request. Please try again later.";
    }
};

module.exports = {
    generateResponse,
};