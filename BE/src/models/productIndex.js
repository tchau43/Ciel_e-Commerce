const mongoose = require("mongoose");

const productIndexSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        unique: true // Ensures one-to-one relationship
    },
    productIndex: String,
    price: { type: Number, required: true, min: 0 },
});

const ProductIndex = mongoose.model("ProductIndex", productIndexSchema);
// module.exports = ProductIndex;