const cartService = require("../services/cartService"); 

const addOrUpdateCartItem = async (req, res) => {
    try {
        console.log("------------------------req.body", req.body);
        const userId = req.user?._id; 
        if (!userId) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { productId, variantId, quantity } = req.body;

        
        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: "productId and quantity are required." });
        }
          
        const updatedCart = await cartService.addOrUpdateProductInCartService(
            userId.toString(),
            productId,
            variantId, 
            quantity   
        );

        if (updatedCart === null && parseInt(quantity, 10) === 0) {
            return res.status(200).json({ message: "Item not in cart, nothing removed.", cart: null });
        }

        res.status(200).json(updatedCart); 

    } catch (error) {
        console.error("Error in addOrUpdateCartItem controller:", error);
        
        if (error.message.includes("Invalid") || error.message.includes("required") || error.message.includes("Stock cannot be negative")) {
            res.status(400).json({ message: error.message }); 
        } else if (error.message.includes("Insufficient stock") || error.message.includes("not found")) {
            res.status(404).json({ message: error.message }); 
        } else {
            res.status(500).json({ message: error.message || "Failed to update cart." });
        }
    }
};

const getCartInfo = async (req, res) => {
    const { userId } = req.params;
    const authenticatedUserId = req.user?._id;

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


const removeAllProductsFromCart = async (req, res) => {
    const { userId } = req.params;
    const authenticatedUserId = req.user?._id;

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
        } else if (error.message.includes("not found")) { 
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to clear cart." });
        }
    }
};

module.exports = {
    addOrUpdateCartItem,    
    getCartInfo,
    removeAllProductsFromCart
    
};