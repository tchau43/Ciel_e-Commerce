const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
            quantity: { type: Number, default: 1, min: 1 }, 
            _id: false 
        }],
        // totalPrice: { type: Number, default: 0 }, // totalPrice is often calculated on fetch, not stored persistently
    },
    { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;