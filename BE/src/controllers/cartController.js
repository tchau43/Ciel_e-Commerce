// controllers/cartController.js (Consolidated)
const cartService = require("../services/cartService"); // Adjust path if needed
const mongoose = require('mongoose');

// Consolidated function to handle adding, updating qty, or removing item (qty 0)
const addOrUpdateCartItem = async (req, res) => {
    try {
        console.log("------------------------req.body", req.body);
        const userId = req.user?._id; // Assumes verifyToken attaches user with _id
        if (!userId) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { productId, variantId, quantity } = req.body;

        // --- Basic Input Validation ---
        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: "productId and quantity are required." });
        }
        // More validation done in the service layer (ID formats, quantity range)
        // --- End Validation ---

        // Call the single consolidated service function
        const updatedCart = await cartService.addOrUpdateProductInCartService(
            userId.toString(),
            productId,
            variantId, // Pass variantId (can be undefined/null)
            quantity   // Pass quantity (can be 0 for removal)
        );

        // Service returns null if removing from non-existent cart, handle it
        if (updatedCart === null && parseInt(quantity, 10) === 0) {
            return res.status(200).json({ message: "Item not in cart, nothing removed.", cart: null });
        }

        res.status(200).json(updatedCart); // Return the updated cart state

    } catch (error) {
        console.error("Error in addOrUpdateCartItem controller:", error);
        // Handle specific errors (like validation, stock, not found)
        if (error.message.includes("Invalid") || error.message.includes("required") || error.message.includes("Stock cannot be negative")) {
            res.status(400).json({ message: error.message }); // Bad Request
        } else if (error.message.includes("Insufficient stock") || error.message.includes("not found")) {
            res.status(404).json({ message: error.message }); // Not Found
        } else {
            res.status(500).json({ message: error.message || "Failed to update cart." });
        }
    }
};

// --- Get Cart Info ---
const getCartInfo = async (req, res) => {
    const { userId } = req.params;
    const authenticatedUserId = req.user?._id;

    // Security Check: Ensure user requests their own cart (or is admin - add admin check if needed)
    if (!authenticatedUserId || authenticatedUserId.toString() !== userId) {
        return res.status(403).json({ message: "Forbidden: Cannot access another user's cart." });
    }

    try {
        const cartData = await cartService.getCartInfoService(userId);
        res.status(200).json(cartData);
    } catch (error) {
        console.error(`Error Getting Cart Info Controller for User ${userId}:`, error);
        if (error.message.includes("Invalid")) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to retrieve cart." });
        }
    }
};

// --- Remove All Products ---
const removeAllProductsFromCart = async (req, res) => {
    const { userId } = req.params;
    const authenticatedUserId = req.user?._id;

    // Security Check: Ensure user clears their own cart (or is admin)
    if (!authenticatedUserId || authenticatedUserId.toString() !== userId) {
        return res.status(403).json({ message: "Forbidden: Cannot clear another user's cart." });
    }

    try {
        const cartData = await cartService.removeAllProductsFromCartService(userId);
        res.status(200).json({ message: "Cart cleared successfully.", cart: cartData });
    } catch (error) {
        console.error(`Error Removing All Cart Items Controller for User ${userId}:`, error);
        if (error.message.includes("Invalid")) {
            res.status(400).json({ message: error.message });
        } else if (error.message.includes("not found")) { // Service might not throw, handles gracefully now
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to clear cart." });
        }
    }
};


module.exports = {
    addOrUpdateCartItem,    // Export the single consolidated function
    getCartInfo,
    removeAllProductsFromCart
    // Do not export the old separate add/update controllers
};