// models/cart.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            variant: { type: mongoose.Schema.Types.ObjectId }, // <-- ADD THIS FIELD (stores the _id of the variant subdocument)
            quantity: { type: Number, default: 1, min: 1 }, // Ensure quantity is at least 1
            _id: false // Usually not needed for subdocuments unless referenced elsewhere
        }],
        // totalPrice: { type: Number, default: 0 }, // totalPrice is often calculated on fetch, not stored persistently
    },
    { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;