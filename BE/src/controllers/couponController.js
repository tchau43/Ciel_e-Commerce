const couponService = require('../services/couponService');
const mongoose = require('mongoose');

const createCoupon = async (req, res) => {
    try {
        const newCoupon = await couponService.createCouponService(req.body);
        res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });
    } catch (error) {
        console.error("Error creating coupon:", error);
        if (error.message.includes("already exists") || error.message.includes("required") || error.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to create coupon." });
        }
    }
};

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await couponService.getAllCouponsService(req.query);
        res.status(200).json(coupons);
    } catch (error) {
        console.error("Error getting all coupons:", error);
        res.status(500).json({ message: "Failed to retrieve coupons." });
    }
};

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

const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await couponService.deleteCouponService(id);
        if (!deletedCoupon) {
            return res.status(404).json({ message: "Coupon not found." });
        }
        res.status(200).json({ message: "Coupon deleted successfully.", deletedCoupon });
    } catch (error) {
        console.error(`Error deleting coupon ${req.params.id}:`, error);
        if (error.message.includes("Invalid Coupon ID")) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to delete coupon." });
        }
    }
};

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
        res.status(200).json(validationResult);

    } catch (error) {
        console.error(`Error validating coupon code ${req.query.code}:`, error);
        res.status(500).json({ valid: false, reason: "Error validating coupon." });
    }
};

module.exports = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCouponForUser
};