const { updateProductToCartService, getCartInforService, addProductToCartService, removeAllProductsFromCartService } = require("../services/cartService");

const updateProductToCart = async (req, res) => {
    try { // Add try...catch for better error handling
        const cartData = req.body;
        console.log("Received body for UPDATE cart:", cartData); // Good for debugging

        // *** FIX: Extract 'quantity' and 'variantId' ***
        const { userId, productId, variantId, quantity } = cartData;

        // Basic validation (optional but recommended)
        if (!userId || !productId || quantity === undefined || quantity === null) {
            return res.status(400).json({ message: "Missing required fields for cart update." });
        }

        // *** FIX: Pass correct arguments to the service ***
        const data = await updateProductToCartService(userId, productId, variantId, quantity); // Pass variantId and quantity

        res.status(200).json(data);
    } catch (error) {
        console.error("Error in updateProductToCart controller:", error);
        res.status(500).json({ message: error.message || "Failed to update cart." });
    }
};


const addProductToCart = async (req, res) => {
    const cartData = req.body;
    const { userId, productId, variantId, quantity } = cartData
    const data = await addProductToCartService(userId, productId, variantId, quantity); // Pass undefined to the service
    res.status(200).json(data);
}

const getCartInfor = async (req, res) => {
    const { userId } = req.params
    const data = await getCartInforService(userId)
    res.status(200).json(data);
}

const removeAllProductsFromCart = async (req, res) => {
    const { userId } = req.params
    const data = await removeAllProductsFromCartService(userId)
    res.status(200).json(data);
}

module.exports = { updateProductToCart, getCartInfor, addProductToCart, removeAllProductsFromCart }