const mongoose = require('mongoose');
const Coupon = require('../models/coupon');

/**
 * Creates a new coupon.
 * @param {object} couponData - Data for the new coupon.
 * @returns {Promise<object>} The created coupon document.
 */
const createCouponService = async (couponData) => {
    try {
        if (!couponData.code || !couponData.discountType || couponData.discountValue === undefined || !couponData.maxUses || !couponData.expiresAt) {
            throw new Error("Missing required coupon fields: code, discountType, discountValue, maxUses, expiresAt.");
        }

        const code = couponData.code.trim().toUpperCase();

        const existing = await Coupon.findOne({ code: code });
        if (existing) {
            throw new Error(`Coupon code "${code}" already exists.`);
        }

        const newCoupon = new Coupon({
            ...couponData,
            code: code
        });
        await newCoupon.save();
        return newCoupon.toObject();
    } catch (error) {
        console.error("Error creating coupon:", error);
        if (error.name === 'ValidationError') {
            throw new Error(`Coupon validation failed: ${error.message}`);
        }
        throw new Error(error.message || "Failed to create coupon.");
    }
};

const getAllCouponsService = async (queryParams = {}) => {
    try {
        const { page = 1, limit = 20, sort = { createdAt: -1 }, ...filters } = queryParams;
        const skip = (page - 1) * limit;

        const query = {};
        if (filters.isActive !== undefined) {
            query.isActive = String(filters.isActive).toLowerCase() === 'true';
        }

        const coupons = await Coupon.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        return coupons;
    } catch (error) {
        console.error("Error getting all coupons:", error);
        throw new Error("Failed to retrieve coupons.");
    }
};

const getCouponByCodeService = async (code) => {
    if (!code || typeof code !== 'string') {
        throw new Error("Coupon code must be provided as a string.");
    }
    const upperCode = code.trim().toUpperCase();
    try {
        const coupon = await Coupon.findOne({ code: upperCode }).lean();
        return coupon;
    } catch (error) {
        console.error(`Error finding coupon by code ${upperCode}:`, error);
        throw new Error("Failed to retrieve coupon.");
    }
};

const getCouponByIdService = async (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Coupon ID format provided.");
    }
    try {
        const coupon = await Coupon.findById(id).lean();
        return coupon;
    } catch (error) {
        console.error(`Error finding coupon by ID ${id}:`, error);
        throw new Error("Failed to retrieve coupon.");
    }
};

const updateCouponService = async (id, updateData) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Coupon ID format provided.");
    }
    try {
        delete updateData.code;
        delete updateData.usedCount;

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        return updatedCoupon;
    } catch (error) {
        console.error(`Error updating coupon ${id}:`, error);
        if (error.name === 'ValidationError') {
            throw new Error(`Coupon validation failed: ${error.message}`);
        }
        throw new Error(error.message || "Failed to update coupon.");
    }
};

const deleteCouponService = async (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Coupon ID format provided.");
    }
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        return deletedCoupon;
    } catch (error) {
        console.error(`Error deleting coupon ${id}:`, error);
        throw new Error("Failed to delete coupon.");
    }
};

const validateCouponForUserViewService = async (code, subtotal) => {
    if (!code || typeof code !== 'string') {
        return { valid: false, reason: "Coupon code is required." };
    }
    if (typeof subtotal !== 'number' || subtotal < 0) {
        return { valid: false, reason: "Valid subtotal is required." };
    }

    const upperCode = code.trim().toUpperCase();
    try {
        const coupon = await Coupon.findOne({ code: upperCode });

        if (!coupon) {
            return { valid: false, reason: `Coupon "${upperCode}" not found.` };
        }
        if (!coupon.isValid()) {
            return { valid: false, reason: `Coupon "${upperCode}" is invalid or expired.` };
        }
        if (!coupon.canApply(subtotal)) {
            const formattedMin = formatCurrencyVND(coupon.minPurchaseAmount);
            return { valid: false, reason: `Minimum purchase of ${formattedMin} required for coupon "${upperCode}".` };
        }

        const discount = coupon.calculateDiscount(subtotal);
        return {
            valid: true,
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                calculatedDiscount: discount,
            }
        };
    } catch (error) {
        console.error(`Error validating coupon ${upperCode}:`, error);
        return { valid: false, reason: "Error validating coupon." };
    }
};

module.exports = {
    createCouponService,
    getAllCouponsService,
    getCouponByCodeService,
    getCouponByIdService,
    updateCouponService,
    deleteCouponService,
    validateCouponForUserViewService
};