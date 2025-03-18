const Cart = require("../models/cart")

const User = require("../models/user")

const createCartService = async (cartData) => {
    try {
        const userId = cartData.user; // assuming user is passed as an ID
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const newCart = new Cart({
            ...cartData,
            user: user._id
        });
        await newCart.save();
        return newCart;
    } catch (error) {
        throw new Error("Error creating cart: " + error.message);
    }
};


const addProductToCartService = async (userId, productId, changeQuantity) => {
    try {
        // console.log("userId, productId, changeQuantity", userId, productId, changeQuantity)
        changeQuantity = parseInt(changeQuantity, 10);
        let cart = await Cart.findOne({ user: userId })
        if (!cart) {
            cart = await new Cart({ user: userId, items: [] });
        }

        const productIndex = await cart.items.findIndex(item => item.product.toString() === productId)
        if (productIndex > -1) {
            cart.items[productIndex].quantity += changeQuantity;
            if (cart.items[productIndex].quantity <= 0) {
                cart.items.splice(productIndex, 1);
            }
        }

        else {
            await cart.items.push({ product: productId, quantity: changeQuantity })
        }
        await cart.save()
        return cart;
    } catch (error) {
        throw new Error(`Error Changing Cart: ${error.message}`);
    }
}

const updateProductToCartService = async (userId, productId, changeQuantity) => {
    try {
        // console.log("userId, productId, changeQuantity", userId, productId, changeQuantity)
        changeQuantity = parseInt(changeQuantity, 10);
        let cart = await Cart.findOne({ user: userId })
        if (!cart) {
            cart = await new Cart({ user: userId, items: [] });
        }

        const productIndex = await cart.items.findIndex(item => item.product.toString() === productId)
        if (productIndex > -1) {
            cart.items[productIndex].quantity = changeQuantity;
            if (cart.items[productIndex].quantity <= 0) {
                cart.items.splice(productIndex, 1);
            }
        }

        else {
            await cart.items.push({ product: productId, quantity: changeQuantity })
        }
        await cart.save()
        return cart;
    } catch (error) {
        throw new Error(`Error Changing Cart: ${error.message}`);
    }
}

const getCartInforService = async (userId) => {
    try {
        let cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart) {
            cart = await new Cart({ user: userId, items: [] });
        }
        return cart
    } catch (error) {
        throw new Error(`Error Changing Cart: ${error.message}`);
    }
}

const removeAllProductsFromCartService = async (userId) => {
    try {
        // Find the cart for the user
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            throw new Error("Cart not found for the user");
        }

        // Empty the items array to remove all products
        cart.items = [];

        // Save the updated cart
        await cart.save();

        return cart; // Return the updated cart
    } catch (error) {
        throw new Error("Error removing all products from cart: " + error.message);
    }
};



module.exports = { createCartService, addProductToCartService, updateProductToCartService, getCartInforService, removeAllProductsFromCartService };