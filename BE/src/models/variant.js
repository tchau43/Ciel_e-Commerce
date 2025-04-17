// models/variant.js
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true
    },
    types: {
        type: String, required: true, trim: true
    },
    price: {
        type: Number, required: true, min: 0
    },
    stock: {
        type: Number, required: true, min: 0, default: 0
    },
}, { timestamps: true });
const Variant = mongoose.model('Variant', variantSchema);

module.exports = Variant;