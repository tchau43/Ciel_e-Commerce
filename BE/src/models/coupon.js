const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
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
        enum: ['PERCENTAGE', 'FIXED_AMOUNT']
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minPurchaseAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    maxUses: {
        type: Number,
        required: true,
        min: 1
    },
    usedCount: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        validate: {
            validator: function (value) {
                return value <= this.maxUses;
            },
            message: 'Coupon usage limit reached.'
        }
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

couponSchema.methods.isValid = function () {
    const now = new Date();
    return this.isActive &&
        this.expiresAt > now &&
        this.usedCount < this.maxUses;
};

couponSchema.methods.canApply = function (subtotal) {
    if (!this.isValid()) return false;
    return subtotal >= this.minPurchaseAmount;
};

couponSchema.methods.calculateDiscount = function (subtotal) {
    if (!this.canApply(subtotal)) {
        return 0;
    }

    let discount = 0;
    if (this.discountType === 'PERCENTAGE') {
        const percentage = Math.max(0, Math.min(100, this.discountValue));
        discount = (subtotal * percentage) / 100;
    } else if (this.discountType === 'FIXED_AMOUNT') {
        discount = this.discountValue;
    }

    return Math.round(Math.min(discount, subtotal));
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;