// controllers/couponController.js
const couponService = require('../services/couponService'); // Adjust path if needed
const mongoose = require('mongoose');

// --- Admin Controllers ---

// POST /admin/coupons
const createCoupon = async (req, res) => {
    try {
        const newCoupon = await couponService.createCouponService(req.body);
        res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });
    } catch (error) {
        console.error("Error creating coupon:", error);
        // Check for specific errors from service (validation, duplicate)
        if (error.message.includes("already exists") || error.message.includes("required") || error.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to create coupon." });
        }
    }
};

// GET /admin/coupons
const getAllCoupons = async (req, res) => {
    try {
        // Pass query params like ?isActive=true&limit=10 to the service
        const coupons = await couponService.getAllCouponsService(req.query);
        res.status(200).json(coupons);
    } catch (error) {
        console.error("Error getting all coupons:", error);
        res.status(500).json({ message: "Failed to retrieve coupons." });
    }
};

// GET /admin/coupons/:id
const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await couponService.getCouponByIdService(id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found." });
        }
        res.status(200).json(coupon);
    } catch (error) {
        console.error(`Error getting coupon by ID ${req.params.id}:`, error);
        if (error.message.includes("Invalid Coupon ID")) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to retrieve coupon." });
        }
    }
}

// PATCH /admin/coupons/:id
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCoupon = await couponService.updateCouponService(id, req.body);
        if (!updatedCoupon) {
            return res.status(404).json({ message: "Coupon not found." });
        }
        res.status(200).json({ message: "Coupon updated successfully", coupon: updatedCoupon });
    } catch (error) {
        console.error(`Error updating coupon ${req.params.id}:`, error);
        if (error.message.includes("Invalid Coupon ID") || error.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to update coupon." });
        }
    }
};

// DELETE /admin/coupons/:id
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await couponService.deleteCouponService(id);
        if (!deletedCoupon) {
            return res.status(404).json({ message: "Coupon not found." });
        }
        res.status(200).json({ message: "Coupon deleted successfully.", deletedCoupon });
        // OR use res.status(204).send(); for no content response
    } catch (error) {
        console.error(`Error deleting coupon ${req.params.id}:`, error);
        if (error.message.includes("Invalid Coupon ID")) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to delete coupon." });
        }
    }
};

// --- User-Facing Controller ---

// GET /coupons/validate?code=XYZ&subtotal=12345
const validateCouponForUser = async (req, res) => {
    try {
        const { code, subtotal } = req.query;
        if (!code) {
            return res.status(400).json({ message: "Query parameter 'code' is required." });
        }
        const subtotalNum = parseFloat(subtotal);
        if (isNaN(subtotalNum) || subtotalNum < 0) {
            return res.status(400).json({ message: "Query parameter 'subtotal' must be a valid non-negative number." });
        }

        const validationResult = await couponService.validateCouponForUserViewService(code, subtotalNum);
        res.status(200).json(validationResult); // Returns { valid: boolean, reason?, coupon? }

    } catch (error) {
        console.error(`Error validating coupon code ${req.query.code}:`, error);
        res.status(500).json({ valid: false, reason: "Error validating coupon." });
    }
};


module.exports = {
    // Admin
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    // User
    validateCouponForUser
};