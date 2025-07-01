const mongoose = require('mongoose');
const Cart = require("../models/cart");
const User = require("../models/user");
const Variant = require("../models/variant");

const createCartService = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid User ID format");
        }
        const user = await User.findById(userId).select('_id');
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
        return cart.toObject();
    } catch (error) {
        console.error("Error creating cart:", error);
        throw new Error("Error creating cart: " + error.message);
    }
};

const addOrUpdateProductInCartService = async (userId, productId, variantId, quantity) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid User ID format");
        if (!mongoose.Types.ObjectId.isValid(productId)) throw new Error("Invalid Product ID format");

        if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) throw new Error("Invalid Variant ID format");

        const targetQuantity = parseInt(quantity, 10);
        if (isNaN(targetQuantity) || targetQuantity < 0) {
            throw new Error("Invalid target quantity provided (must be 0 or greater)");
        }
        const effectiveVariantId = variantId || null;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            if (targetQuantity === 0) return await getCartInfoService(userId);
            console.log(`Creating new cart for user ${userId}`);
            cart = new Cart({ user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId &&
            (item.variant?.toString() === effectiveVariantId?.toString())
        );

        if (targetQuantity === 0) {
            if (itemIndex > -1) {
                console.log(`Removing item (Product: ${productId}, Variant: ${effectiveVariantId || 'N/A'}) from cart.`);
                cart.items.splice(itemIndex, 1);
            }
        } else {
            let availableStock = Infinity;
            if (effectiveVariantId) {
                const variant = await Variant.findById(effectiveVariantId).select('stock').lean();
                if (!variant) throw new Error(`Variant with ID ${effectiveVariantId} not found.`);
                availableStock = variant.stock;
            } else {
                console.warn(`Stock check skipped for base product ${productId} (no variantId provided).`);
            }

            if (targetQuantity > availableStock) {
                throw new Error(`Insufficient stock. Available: ${availableStock}, Requested: ${targetQuantity}`);
            }

            if (itemIndex > -1) {
                console.log(`Updating quantity for item (Product: ${productId}, Variant: ${effectiveVariantId || 'N/A'}) to ${targetQuantity}.`);
                cart.items[itemIndex].quantity = targetQuantity;
            } else {
                console.log(`Adding new item (Product: ${productId}, Variant: ${effectiveVariantId || 'N/A'}) with quantity ${targetQuantity}.`);
                cart.items.push({
                    product: productId,
                    variant: effectiveVariantId,
                    quantity: targetQuantity
                });
            }
        }

        await cart.save();

        return await getCartInfoService(userId);

    } catch (error) {
        console.error("Error Add/Update Cart Item Service:", error);
        throw error;
    }
};

const updateProductToCartService = addOrUpdateProductInCartService;
const addProductToCartService = addOrUpdateProductInCartService;

const getCartInfoService = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid User ID format");
        }

        let cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name images category brand base_price',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'brand', select: 'name' }
                ]
            })
            .populate({
                path: 'items.variant',
                select: 'types price stock'
            })
            .lean();

        if (!cart) {
            return { user: userId, items: [], _id: null, calculatedTotalPrice: 0, createdAt: null, updatedAt: null };
        }

        let calculatedTotalPrice = 0;
        let itemsWithDetails = [];

        if (cart.items && cart.items.length > 0) {
            itemsWithDetails = cart.items.map(item => {
                if (!item.product) return null;

                let itemPrice = 0;

                if (item.variant && typeof item.variant.price === 'number') {
                    itemPrice = item.variant.price;
                } else if (typeof item.product.base_price === 'number') {
                    if (item.variant) {
                        console.warn(`Variant price missing/invalid for variant ${item.variant._id}, using base price ${item.product.base_price} for product ${item.product._id}`);
                    }
                    itemPrice = item.product.base_price;
                } else {
                    console.error(`Could not determine price for cart item: Product=${item.product._id}, Variant=${item.variant?._id}`);
                }

                const quantity = item.quantity || 0;
                const itemSubtotal = itemPrice * quantity;
                calculatedTotalPrice += itemSubtotal;

                return {
                    productId: item.product._id,
                    variantId: item.variant?._id || null,
                    quantity: quantity,
                    name: item.product.name,
                    variantTypes: item.variant?.types,
                    pricePerUnit: itemPrice,
                    subtotal: itemSubtotal,
                    imageUrl: item.product.images?.[0],
                    stock: item.variant?.stock,
                    category: item.product.category?.name,
                    brand: item.product.brand?.name,
                };
            }).filter(Boolean);
        }

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

const removeAllProductsFromCartService = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid User ID format");
        }

        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } },
            { new: true }
        );

        if (!cart) {
            console.warn(`Attempted to clear cart for user ${userId}, but no cart was found.`);
            return await getCartInfoService(userId);
        }

        return await getCartInfoService(userId);

    } catch (error) {
        console.error("Error removing all products from cart:", error);
        throw new Error("Error removing all products from cart: " + error.message);
    }
};

module.exports = {
    createCartService,
    addOrUpdateProductInCartService,
    addProductToCartService,
    updateProductToCartService,
    getCartInfoService,
    removeAllProductsFromCartService
};