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


const addProductToCartService = async ({ userId, productId, quantity = 1 }) => {
    try {
        const cart = await Cart.findOne({ user: userId })
        if (!cart) {
            // Optionally, create a new cart if one doesn't exist
            cart = new Cart({ user: userId, items: [] });
        }
        const productIndex = cart.items.findIndex(item => item.product.toString() === productId)

        if (productIndex > -1) {
            cart.items[productIndex].quantity += quantity;
        }
        else {
            cart.items.push({ product: productId, quantity })
        }
        cart.save();
        return cart;
    } catch (error) {
        throw new Error("Error adding product cart: " + error.message);
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


// const updateCartItemQuantity = async ({ userId, productId, change }) => {
//     try {
//         // Find the cart for the user
//         let cart = await Cart.findOne({ user: userId });
//         if (!cart) {
//             throw new Error("Cart not found for the user");
//         }

//         // Find the index of the product in the cart items
//         const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
//         if (itemIndex === -1) {
//             throw new Error("Product not found in cart");
//         }

//         // Update the product's quantity
//         cart.items[itemIndex].quantity += change;

//         // If quantity drops to 0 or below, remove the item from the cart
//         if (cart.items[itemIndex].quantity <= 0) {
//             cart.items.splice(itemIndex, 1);
//         }

//         // Optionally, update totalPrice here if needed

//         await cart.save();
//         return cart;
//     } catch (error) {
//         throw new Error("Error updating cart item: " + error.message);
//     }
// };


module.exports = { createCartService, addProductToCartService, updateProductToCartService };