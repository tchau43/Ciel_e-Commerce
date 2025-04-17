// controllers/invoiceController.js
const { createInvoiceService, getInvoiceService, updateInvoiceStatusService } = require("../services/invoiceService");
const Invoice = require('../models/invoice'); // Need Invoice model for validation potentially

const createInvoice = async (req, res) => {
    const { userId, productsList, paymentMethod, shippingAddress } = req.body; // <-- Updated names

    if (!userId || !productsList || !paymentMethod || !shippingAddress) {
        return res.status(400).json({ message: "Missing required invoice fields." });
    }

    try {
        const data = await createInvoiceService(
            userId,
            productsList,
            paymentMethod,
            shippingAddress
        );

        res.status(201).json({
            message: "Invoice created successfully",
            invoice: data,
        });
    } catch (error) {
        console.error("Invoice Creation Error:", error);
        res.status(500).json({ message: error.message || "Failed to create invoice." });
    }
};

// getInvoice remains the same structurally
const getInvoice = async (req, res) => {
    const { userId } = req.params;
    try {
        const data = await getInvoiceService(userId);
        res.status(200).json(data);
    } catch (error) {
        console.error("Get Invoice Error:", error);
        res.status(500).json({ message: error.message || "Failed to get invoices." });
    }
};

const updateInvoiceStatus = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const statusUpdates = req.body; // e.g., { "orderStatus": "shipped", "paymentStatus": "paid" }

        // --- Input Validation ---
        const allowedOrderStatuses = Invoice.schema.path('orderStatus').enumValues;
        const allowedPaymentStatuses = Invoice.schema.path('paymentStatus').enumValues;
        const updatesToApply = {};

        if (statusUpdates.orderStatus) {
            if (!allowedOrderStatuses.includes(statusUpdates.orderStatus)) {
                return res.status(400).json({ message: `Invalid orderStatus. Must be one of: ${allowedOrderStatuses.join(', ')}` });
            }
            updatesToApply.orderStatus = statusUpdates.orderStatus;
        }

        if (statusUpdates.paymentStatus) {
            if (!allowedPaymentStatuses.includes(statusUpdates.paymentStatus)) {
                return res.status(400).json({ message: `Invalid paymentStatus. Must be one of: ${allowedPaymentStatuses.join(', ')}` });
            }
            updatesToApply.paymentStatus = statusUpdates.paymentStatus;
        }

        // Check if there's anything actually to update
        if (Object.keys(updatesToApply).length === 0) {
            return res.status(400).json({ message: "No valid status fields provided for update (use orderStatus or paymentStatus)." });
        }
        // --- End Input Validation ---

        const updatedInvoice = await updateInvoiceStatusService(invoiceId, updatesToApply);

        res.status(200).json({
            message: "Invoice status updated successfully",
            invoice: updatedInvoice
        });

    } catch (error) {
        console.error(`Error in updateInvoiceStatus controller for ID ${req.params.invoiceId}:`, error);
        // Check for specific errors from the service
        if (error.message.includes("not found") || error.message.includes("Invalid invoice ID")) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || "Failed to update invoice status." });
        }
    }
};


module.exports = { createInvoice, getInvoice, updateInvoiceStatus };