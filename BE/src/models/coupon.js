// models/coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { // The unique code customers enter (e.g., "SUMMER20", "SAVE100K")
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    description: {
        type: String,
        trim: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ['PERCENTAGE', 'FIXED_AMOUNT'] // Discount type
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0 // Non-negative value
    },
    minPurchaseAmount: { // Minimum subtotal required
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    maxUses: { // Total usage limit for the coupon
        type: Number,
        required: true,
        min: 1
    },
    usedCount: { // How many times it has been used
        type: Number,
        required: true,
        default: 0,
        min: 0,
        validate: { // Ensure usedCount never exceeds maxUses
            validator: function (value) {
                // `this` refers to the document being saved/updated
                return value <= this.maxUses;
            },
            message: 'Coupon usage limit reached.'
        }
    },
    expiresAt: { // Expiry date
        type: Date,
        required: true
    },
    isActive: { // Manual activation toggle
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// --- Instance Methods ---

// Check if the coupon is currently valid for use (syntactic check)
couponSchema.methods.isValid = function () {
    const now = new Date();
    return this.isActive &&
        this.expiresAt > now &&
        this.usedCount < this.maxUses;
};

// Check if the coupon can be applied to a given subtotal (functional check)
couponSchema.methods.canApply = function (subtotal) {
    if (!this.isValid()) return false; // Must pass basic validity first
    return subtotal >= this.minPurchaseAmount; // Check minimum purchase
};


// Calculate the discount amount for a given subtotal
couponSchema.methods.calculateDiscount = function (subtotal) {
    if (!this.canApply(subtotal)) {
        return 0; // Cannot apply if not valid or min purchase not met
    }

    let discount = 0;
    if (this.discountType === 'PERCENTAGE') {
        const percentage = Math.max(0, Math.min(100, this.discountValue)); // Clamp percentage 0-100
        discount = (subtotal * percentage) / 100;
    } else if (this.discountType === 'FIXED_AMOUNT') {
        discount = this.discountValue;
    }

    // Discount cannot be more than the subtotal
    return Math.round(Math.min(discount, subtotal)); // Round discount to avoid fractional VND
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;