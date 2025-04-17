// services/cartService.js
const mongoose = require('mongoose');
const Cart = require("../models/cart");      // Adjust path if needed
const User = require("../models/user");      // Adjust path if needed
const Variant = require("../models/variant");  // Adjust path if needed
const { Product } = require('../models/product'); // Adjust path if needed

// --- CREATE CART ---
// Creates an empty cart if one doesn't exist.
const createCartService = async (userId) => { // Simplified input
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid User ID format");
        }
        const user = await User.findById(userId).select('_id'); // Check if user exists
        if (!user) {
            throw new Error("User not found");
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            console.log(`Creating new cart for user ${userId}`);
            cart = new Cart({ user: userId, items: [] });
            await cart.save();
        } else {
            console.warn(`Cart already exists for user ${userId}.`);
        }
        return cart.toObject(); // Return plain object
    } catch (error) {
        console.error("Error creating cart:", error);
        throw new Error("Error creating cart: " + error.message);
    }
};

// --- ADD/UPDATE/REMOVE ITEM IN CART (Consolidated) ---
// Handles adding new items, updating quantity of existing items,
// and removing items if quantity is set to 0. Includes stock check.
const addOrUpdateProductInCartService = async (userId, productId, variantId, quantity) => {
    try {
        // 1. Validate Inputs
        if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid User ID format");
        if (!mongoose.Types.ObjectId.isValid(productId)) throw new Error("Invalid Product ID format");
        // Ensure variantId is either valid ObjectId or null/undefined
        if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) throw new Error("Invalid Variant ID format");

        const targetQuantity = parseInt(quantity, 10);
        if (isNaN(targetQuantity) || targetQuantity < 0) {
            throw new Error("Invalid target quantity provided (must be 0 or greater)");
        }
        const effectiveVariantId = variantId || null; // Use null if variantId is undefined/empty string

        // 2. Find or Create Cart for the user
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            if (targetQuantity === 0) return await getCartInfoService(userId); // Return standard empty cart structure
            console.log(`Creating new cart for user ${userId}`);
            cart = new Cart({ user: userId, items: [] });
        }

        // 3. Find Existing Item Index based on product AND variant
        const itemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId &&
            (item.variant?.toString() === effectiveVariantId?.toString()) // Compare ObjectIds or nulls
        );

        // 4. Handle Quantity = 0 (Remove Item)
        if (targetQuantity === 0) {
            if (itemIndex > -1) {
                console.log(`Removing item (Product: ${productId}, Variant: ${effectiveVariantId || 'N/A'}) from cart.`);
                cart.items.splice(itemIndex, 1); // Remove item from array
            }
            // If item not found and quantity is 0, do nothing further.
        }
        // 5. Handle Quantity > 0 (Add or Update Item)
        else {
            // --- Stock Check ---
            let availableStock = Infinity;
            if (effectiveVariantId) { // Only check stock if it's a specific variant
                const variant = await Variant.findById(effectiveVariantId).select('stock').lean();
                if (!variant) throw new Error(`Variant with ID ${effectiveVariantId} not found.`);
                // Verify variant belongs to product (optional sanity check)
                // if (variant.product.toString() !== productId) throw new Error("Variant does not belong to product");
                availableStock = variant.stock;
            } else {
                // If adding base product (no variantId), implement stock check if your Product model has stock
                console.warn(`Stock check skipped for base product ${productId} (no variantId provided).`);
                // If only specific variants are sellable, throw an error here:
                // throw new Error("A specific variant must be selected to add this product.");
            }

            // Compare needed quantity (target) vs available stock
            if (targetQuantity > availableStock) {
                throw new Error(`Insufficient stock. Available: ${availableStock}, Requested: ${targetQuantity}`);
            }
            // --- End Stock Check ---

            if (itemIndex > -1) {
                // Item exists, update its quantity
                console.log(`Updating quantity for item (Product: ${productId}, Variant: ${effectiveVariantId || 'N/A'}) to ${targetQuantity}.`);
                cart.items[itemIndex].quantity = targetQuantity;
            } else {
                // Item does not exist, add it to the items array
                console.log(`Adding new item (Product: ${productId}, Variant: ${effectiveVariantId || 'N/A'}) with quantity ${targetQuantity}.`);
                cart.items.push({
                    product: productId,
                    variant: effectiveVariantId, // Store ObjectId or null
                    quantity: targetQuantity
                });
            }
        }

        // 6. Save the updated cart
        await cart.save();

        // 7. Fetch and return the updated cart with populated details and calculated total
        return await getCartInfoService(userId);

    } catch (error) {
        console.error("Error Add/Update Cart Item Service:", error);
        // Don't obscure specific errors (like stock or validation)
        throw error; // Re-throw original error
    }
};

// Aliases for potential backward compatibility if needed, but recommend using the main name
const updateProductToCartService = addOrUpdateProductInCartService;
const addProductToCartService = addOrUpdateProductInCartService;


// --- GET CART INFO (WITH POPULATED DETAILS & TOTAL) ---
const getCartInfoService = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid User ID format");
        }

        // Find cart and populate nested details
        let cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name images category brand base_price', // Select needed product fields
                populate: [ // Populate nested refs within product
                    { path: 'category', select: 'name' },
                    { path: 'brand', select: 'name' }
                ]
            })
            .populate({
                path: 'items.variant', // Populate the referenced Variant document
                select: 'types price stock' // Select needed variant fields
            })
            .lean(); // Get plain JS objects

        // If no cart exists, return a standard empty cart structure
        if (!cart) {
            return { user: userId, items: [], _id: null, calculatedTotalPrice: 0, createdAt: null, updatedAt: null };
        }

        // Calculate total price and format items AFTER population
        let calculatedTotalPrice = 0;
        let itemsWithDetails = [];

        if (cart.items && cart.items.length > 0) {
            itemsWithDetails = cart.items.map(item => {
                // Gracefully handle potentially missing populated data (though populate should ensure it)
                if (!item.product) return null; // Skip item if product somehow didn't populate

                let itemPrice = 0;
                // Prefer variant price if variant exists and has a valid price
                if (item.variant && typeof item.variant.price === 'number') {
                    itemPrice = item.variant.price;
                }
                // Fallback to product base_price if no valid variant/variant price
                else if (typeof item.product.base_price === 'number') {
                    if (item.variant) { // Log if variant existed but price didn't
                        console.warn(`Variant price missing/invalid for variant ${item.variant._id}, using base price ${item.product.base_price} for product ${item.product._id}`);
                    }
                    itemPrice = item.product.base_price;
                } else {
                    // Log error if no price could be determined
                    console.error(`Could not determine price for cart item: Product=${item.product._id}, Variant=${item.variant?._id}`);
                }

                const quantity = item.quantity || 0; // Default quantity to 0 if missing
                const itemSubtotal = itemPrice * quantity;
                calculatedTotalPrice += itemSubtotal;

                // Structure the item detail for the response
                return {
                    productId: item.product._id,
                    variantId: item.variant?._id || null, // Send variantId or null
                    quantity: quantity,
                    name: item.product.name,
                    variantTypes: item.variant?.types, // Include variant description
                    pricePerUnit: itemPrice,
                    subtotal: itemSubtotal,
                    imageUrl: item.product.images?.[0], // First product image
                    stock: item.variant?.stock, // Available stock for the variant
                    category: item.product.category?.name, // Populated category name
                    brand: item.product.brand?.name, // Populated brand name
                };
            }).filter(Boolean); // Filter out any null items from map
        }

        // Return the structured cart data
        return {
            _id: cart._id,
            user: cart.user,
            items: itemsWithDetails,
            calculatedTotalPrice: calculatedTotalPrice,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt
        };

    } catch (error) {
        console.error("Error Getting Cart Info:", error);
        throw new Error(`Error Getting Cart: ${error.message}`);
    }
};


// --- REMOVE ALL PRODUCTS FROM CART ---
const removeAllProductsFromCartService = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid User ID format");
        }

        // Find the cart and update it by setting items to an empty array
        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } },
            { new: true } // Return the modified document
        );

        if (!cart) {
            // It's okay if the cart didn't exist, just means it's already clear
            console.warn(`Attempted to clear cart for user ${userId}, but no cart was found.`);
            // Return the standard empty cart structure
            return await getCartInfoService(userId);
        }

        // Return the updated (now empty) cart using the standard getter
        return await getCartInfoService(userId);

    } catch (error) {
        console.error("Error removing all products from cart:", error);
        throw new Error("Error removing all products from cart: " + error.message);
    }
};


module.exports = {
    createCartService,
    addOrUpdateProductInCartService, // Use this primarily
    // Keep aliases if controllers still reference them, but phase out
    addProductToCartService,
    updateProductToCartService,
    getCartInfoService,
    removeAllProductsFromCartService
};