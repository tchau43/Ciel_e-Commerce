// models/review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant',
        required: true,
    },
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
}, { timestamps: true });

reviewSchema.index({ user: 1, product: 1, variant: 1, invoice: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;