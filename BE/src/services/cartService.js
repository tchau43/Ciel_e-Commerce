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


const addProductToCartService = async (userId, productId, variantId, quantity) => { // Parameter is named 'quantity'
    try {
        const targetQuantity = parseInt(quantity, 10); // parseInt(undefined) results in NaN
        if (isNaN(targetQuantity) || targetQuantity < 0) { // isNaN(NaN) is true
            throw new Error("Invalid target quantity provided"); // Error thrown!
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await new Cart({ user: userId, items: [] });
        }

        const productIndex = cart.items.findIndex(item =>
            item.product.toString() === productId &&
            (item.variant?.toString() === variantId || (!item.variant && !variantId))
        );

        if (targetQuantity === 0) {
            // If target quantity is 0, remove the item if it exists
            if (productIndex > -1) {
                cart.items.splice(productIndex, 1);
            }
            // If item doesn't exist and quantity is 0, do nothing
        } else {
            // Target quantity is > 0
            if (productIndex > -1) {
                // Item exists, update its quantity to the target quantity
                cart.items[productIndex].quantity = targetQuantity;
            } else {
                // Item does not exist, add it with the target quantity
                cart.items.push({ product: productId, variant: variantId || null, quantity: targetQuantity });
            }
        }

        await cart.save();
        // You might want to populate before returning if the controller/frontend needs it immediately
        // await cart.populate({ path: 'items.product', populate: [{ path: 'category' }, { path: 'brand' }] });
        return cart;

    } catch (error) {
        console.error("Error Adding/Updating Cart:", error);
        throw new Error(`Error Changing Cart: ${error.message}`);
    }
};



const updateProductToCartService = async (userId, productId, variantId, quantity) => {
    try {
        const targetQuantity = parseInt(quantity, 10);

        // Validate the target quantity
        if (isNaN(targetQuantity) || targetQuantity < 0) {
            throw new Error("Invalid target quantity provided for update");
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Should not happen if updating, but handle defensively
            // If quantity > 0 maybe create cart? Or just error out.
            if (targetQuantity > 0) {
                console.warn(`Cart not found for update, but quantity > 0. User: ${userId}`);
                // Optionally create cart and add item? Or throw error. Let's throw for now.
                throw new Error(`Cart not found for user ${userId}`);
            } else {
                return null; // No cart and quantity is 0, nothing to do.
            }
        }

        // *** FIX: Find item matching product AND variant ***
        const productIndex = cart.items.findIndex(item =>
            item.product.toString() === productId &&
            (item.variant?.toString() === variantId || (!item.variant && !variantId)) // Match variantId or handle null/undefined
        );

        if (productIndex > -1) {
            // Item found in cart
            if (targetQuantity === 0) {
                // *** FIX: Remove item if quantity is 0 ***
                cart.items.splice(productIndex, 1);
            } else {
                // *** FIX: Update quantity to the target quantity ***
                cart.items[productIndex].quantity = targetQuantity;
            }
        } else {
            // Item specific variant not found in cart
            if (targetQuantity > 0) {
                // *** FIX: Item not found, ADD it if quantity > 0 ***
                // This makes the update endpoint behave like addOrUpdate
                cart.items.push({ product: productId, variant: variantId || null, quantity: targetQuantity });
            }
            // If item not found and quantity is 0, do nothing.
        }

        await cart.save(); // Save the changes

        // Populate before returning if needed (consider performance)
        // await cart.populate({ path: 'items.product', populate: [{ path: 'category' }, { path: 'brand' }] });
        return cart;

    } catch (error) {
        console.error("Error Updating Cart Item Service:", error); // Log specific error
        // Don't overwrite Mongoose validation errors, let them bubble up or re-throw carefully
        throw new Error(`Error Updating Cart: ${error.message}`);
    }
};


const getCartInforService = async (userId) => {
    try {
        // Populate product details. If you need variant details here, it's more complex.
        let cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                populate: [ // Also populate nested fields if needed
                    { path: 'category' },
                    { path: 'brand' }
                ]
            });
        if (!cart) {
            // Return a structure consistent with an empty cart
            return { user: userId, items: [], _id: null, createdAt: null, updatedAt: null };
        }
        // Note: cart.items will contain the product object, but not the specific variant details yet.
        // We also need the variantId stored alongside the item.
        return cart;
    } catch (error) {
        console.error("Error Getting Cart Info:", error);
        throw new Error(`Error Getting Cart: ${error.message}`);
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