const { updateProductToCartService, getCartInforService, addProductToCartService } = require("../services/cartService");

const updateProductToCart = async (req, res) => {
    const cartData = req.body;
    // console.log("cartData", cartData)
    const { userId, productId, changeQuantity } = cartData
    const data = await updateProductToCartService(userId, productId, changeQuantity);
    res.status(200).json(data);
}

const addProductToCart = async (req, res) => {
    const cartData = req.body;
    // console.log("cartData", cartData)
    const { userId, productId, changeQuantity } = cartData
    const data = await addProductToCartService(userId, productId, changeQuantity);
    res.status(200).json(data);
}

const getCartInfor = async (req, res) => {
    const { userId } = req.params
    // console.log("userId", userId)
    const data = await getCartInforService(userId)
    res.status(200).json(data);
}

module.exports = { updateProductToCart, getCartInfor, addProductToCart }