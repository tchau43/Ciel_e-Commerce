// services/couponService.js
const mongoose = require('mongoose');
const Coupon = require('../models/coupon'); // Adjust path if needed

/**
 * Creates a new coupon.
 * @param {object} couponData - Data for the new coupon.
 * @returns {Promise<object>} The created coupon document.
 */
const createCouponService = async (couponData) => {
    try {
        // Basic validation (more specific validation is in the schema)
        if (!couponData.code || !couponData.discountType || couponData.discountValue === undefined || !couponData.maxUses || !couponData.expiresAt) {
            throw new Error("Missing required coupon fields: code, discountType, discountValue, maxUses, expiresAt.");
        }

        // Ensure code is uppercase and trimmed
        const code = couponData.code.trim().toUpperCase();

        // Check if code already exists (case-sensitive check as we store uppercase)
        const existing = await Coupon.findOne({ code: code });
        if (existing) {
            throw new Error(`Coupon code "${code}" already exists.`);
        }

        // Create and save
        const newCoupon = new Coupon({
            ...couponData,
            code: code // Use the processed code
        });
        await newCoupon.save();
        return newCoupon.toObject(); // Return plain object
    } catch (error) {
        console.error("Error creating coupon:", error);
        // Handle Mongoose validation errors specifically if needed
        if (error.name === 'ValidationError') {
            throw new Error(`Coupon validation failed: ${error.message}`);
        }
        throw new Error(error.message || "Failed to create coupon.");
    }
};

/**
 * Retrieves all coupons, optionally filtered and paginated.
 * @param {object} queryParams - Query parameters (e.g., { isActive: true, page: 1, limit: 20, sort: {createdAt: -1} })
 * @returns {Promise<Array<object>>} Array of coupon documents.
 */
const getAllCouponsService = async (queryParams = {}) => {
    try {
        const { page = 1, limit = 20, sort = { createdAt: -1 }, ...filters } = queryParams;
        const skip = (page - 1) * limit;

        // Build filter query (example: filter by isActive status)
        const query = {};
        if (filters.isActive !== undefined) {
            query.isActive = String(filters.isActive).toLowerCase() === 'true';
        }
        // Add more filters as needed (e.g., search by code)

        const coupons = await Coupon.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean for plain objects

        // Optionally get total count for pagination
        // const totalCoupons = await Coupon.countDocuments(query);
        // return { coupons, totalCoupons, currentPage: page, totalPages: Math.ceil(totalCoupons / limit) };

        return coupons;
    } catch (error) {
        console.error("Error getting all coupons:", error);
        throw new Error("Failed to retrieve coupons.");
    }
};

/**
 * Retrieves a single coupon by its Code (case-insensitive).
 * @param {string} code - The coupon code.
 * @returns {Promise<object|null>} The coupon document or null if not found.
 */
const getCouponByCodeService = async (code) => {
    if (!code || typeof code !== 'string') {
        throw new Error("Coupon code must be provided as a string.");
    }
    const upperCode = code.trim().toUpperCase();
    try {
        const coupon = await Coupon.findOne({ code: upperCode }).lean();
        return coupon; // Returns null if not found
    } catch (error) {
        console.error(`Error finding coupon by code ${upperCode}:`, error);
        throw new Error("Failed to retrieve coupon.");
    }
};

/**
 * Retrieves a single coupon by its MongoDB _id.
 * @param {string} id - The coupon ObjectId.
 * @returns {Promise<object|null>} The coupon document or null if not found.
 */
const getCouponByIdService = async (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Coupon ID format provided.");
    }
    try {
        const coupon = await Coupon.findById(id).lean();
        return coupon; // Returns null if not found
    } catch (error) {
        console.error(`Error finding coupon by ID ${id}:`, error);
        throw new Error("Failed to retrieve coupon.");
    }
};


/**
 * Updates an existing coupon by its ID.
 * @param {string} id - The ID of the coupon to update.
 * @param {object} updateData - The fields to update.
 * @returns {Promise<object|null>} The updated coupon document or null if not found.
 */
const updateCouponService = async (id, updateData) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Coupon ID format provided.");
    }
    try {
        // Prevent changing certain fields directly if needed
        delete updateData.code;      // Code should generally not be changed
        delete updateData.usedCount; // usedCount should only be changed via $inc

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            { $set: updateData }, // Use $set to update only provided fields
            { new: true, runValidators: true } // Return updated doc, run schema validation
        ).lean();

        return updatedCoupon; // Returns null if not found
    } catch (error) {
        console.error(`Error updating coupon ${id}:`, error);
        if (error.name === 'ValidationError') {
            throw new Error(`Coupon validation failed: ${error.message}`);
        }
        throw new Error(error.message || "Failed to update coupon.");
    }
};

/**
 * Deletes a coupon by its ID.
 * @param {string} id - The ID of the coupon to delete.
 * @returns {Promise<object|null>} The deleted coupon document or null if not found.
 */
const deleteCouponService = async (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Coupon ID format provided.");
    }
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        // Note: This doesn't check if the coupon was already used in past invoices.
        // Deleting might orphan couponCode references in old invoices.
        // Consider setting isActive=false instead of hard deleting.
        return deletedCoupon; // Returns null if not found
    } catch (error) {
        console.error(`Error deleting coupon ${id}:`, error);
        throw new Error("Failed to delete coupon.");
    }
};

/**
 * Validates if a coupon code is usable for a given subtotal (for frontend display).
 * Does NOT increment usage count.
 * @param {string} code - Coupon code entered by user.
 * @param {number} subtotal - Current cart subtotal.
 * @returns {Promise<object>} Validation result object { valid: boolean, reason?: string, coupon?: object }
 */
const validateCouponForUserViewService = async (code, subtotal) => {
    if (!code || typeof code !== 'string') {
        return { valid: false, reason: "Coupon code is required." };
    }
    if (typeof subtotal !== 'number' || subtotal < 0) {
        return { valid: false, reason: "Valid subtotal is required." };
    }

    const upperCode = code.trim().toUpperCase();
    try {
        const coupon = await Coupon.findOne({ code: upperCode }); // Fetch full doc for methods

        if (!coupon) {
            return { valid: false, reason: `Coupon "${upperCode}" not found.` };
        }
        if (!coupon.isValid()) { // Checks active, expiry, maxUses vs usedCount
            return { valid: false, reason: `Coupon "${upperCode}" is invalid or expired.` };
        }
        if (!coupon.canApply(subtotal)) { // Checks minPurchaseAmount
            const formattedMin = formatCurrencyVND(coupon.minPurchaseAmount);
            return { valid: false, reason: `Minimum purchase of ${formattedMin} required for coupon "${upperCode}".` };
        }

        // If all checks pass, return valid status and coupon details
        const discount = coupon.calculateDiscount(subtotal);
        return {
            valid: true,
            coupon: { // Return relevant info to FE
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                calculatedDiscount: discount, // Show how much discount *will* be applied
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