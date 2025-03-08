const { updateProductToCartService } = require("../services/cartService");

const updateProductToCart = async (req, res) => {
    const cartData = req.body;
    console.log("cartData", cartData)
    const { userId, productId, changeQuantity } = cartData
    const data = await updateProductToCartService(userId, productId, changeQuantity);
    res.status(200).json(data);
}

module.exports = { updateProductToCart }