// models/coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { // The unique code customers enter (e.g., "SUMMER20", "SAVE100K")
        type: String,
        required: true,
        unique: true, // Ensure codes are unique
        trim: true,
        uppercase: true, // Store codes consistently (e.g., all uppercase)
        index: true
    },
    description: { // Optional description for admin reference
        type: String,
        trim: true
    },
    discountType: { // Type of discount
        type: String,
        required: true,
        enum: ['PERCENTAGE', 'FIXED_AMOUNT'] // Specify allowed types
    },
    discountValue: { // The actual discount value
        type: Number,
        required: true,
        min: 0 // Value must be non-negative
    },
    minPurchaseAmount: { // Minimum order subtotal required to use the coupon
        type: Number,
        required: true,
        min: 0,
        default: 0 // Default to no minimum purchase
    },
    maxUses: { // Maximum number of times this coupon can be used in total
        type: Number,
        required: true,
        min: 1 // Must be usable at least once
    },
    usedCount: { // How many times this coupon has been used
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    expiresAt: { // Expiry date/time for the coupon
        type: Date,
        required: true
    },
    isActive: { // Allows manually activating/deactivating coupons
        type: Boolean,
        default: true
    }
}, { timestamps: true }); // Add createdAt/updatedAt automatically

// Method to check if the coupon is still valid (not expired, within usage limits)
couponSchema.methods.isValid = function () {
    const now = new Date();
    return this.isActive &&
        this.expiresAt > now &&
        this.usedCount < this.maxUses;
};

// Method to calculate the discount amount based on subtotal
couponSchema.methods.calculateDiscount = function (subtotal) {
    if (subtotal < this.minPurchaseAmount) {
        return 0; // Subtotal doesn't meet minimum requirement
    }

    let discount = 0;
    if (this.discountType === 'PERCENTAGE') {
        // Calculate percentage discount, ensure value is reasonable (e.g., 0-100)
        const percentage = Math.max(0, Math.min(100, this.discountValue));
        discount = (subtotal * percentage) / 100;
    } else if (this.discountType === 'FIXED_AMOUNT') {
        discount = this.discountValue;
    }

    // Ensure discount doesn't exceed the subtotal
    return Math.min(discount, subtotal);
};


const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;