// controllers/invoiceController.js
const {
  createInvoiceService,
  getInvoiceService,
  updateInvoiceStatusService,
  getAllInvoicesAdminService,
} = require("../services/invoiceService");
const Invoice = require("../models/invoice"); // For enum validation if needed
const mongoose = require("mongoose");

const createInvoice = async (req, res) => {
  // Expect optional couponCode
  const { userId, productsList, paymentMethod, shippingAddress, couponCode } =
    req.body;

  // Basic Validation
  if (!userId || !productsList || !paymentMethod || !shippingAddress) {
    return res.status(400).json({
      message:
        "Missing required fields (userId, productsList, paymentMethod, shippingAddress).",
    });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format." });
  }
  // Add more validation for productsList structure, shippingAddress details if needed

  try {
    // Pass couponCode (can be null/undefined) to the service
    const createdInvoice = await createInvoiceService(
      userId,
      productsList,
      paymentMethod,
      shippingAddress,
      couponCode // Pass coupon code string or null
    );

    res.status(201).json({
      message: "Invoice created successfully, confirmation email processing.",
      invoice: createdInvoice,
    });
  } catch (error) {
    console.error("Invoice Creation Controller Error:", error);
    // Check for specific user-friendly errors from the service
    if (
      error.message.includes("Coupon code") ||
      error.message.includes("Insufficient stock") ||
      error.message.includes("not found") || // Product/Variant/Coupon not found
      error.message.includes("minimum purchase") ||
      error.message.includes("invalid or expired") ||
      error.message.includes("usage limit")
    ) {
      res.status(400).json({ message: error.message }); // Bad request for these issues
    } else if (error.message.includes("Invalid")) {
      res.status(400).json({ message: error.message }); // Other validation errors
    } else {
      res.status(500).json({
        message:
          error.message || "Failed to create invoice due to server error.",
      });
    }
  }
};

// Get User's Invoices
const getInvoice = async (req, res) => {
  const { userId } = req.params;
  const authenticatedUserId = req.user?._id; // Assuming verifyToken adds req.user

  // Security check: User can only get their own invoices (or admin bypass needed)
  if (!authenticatedUserId || authenticatedUserId.toString() !== userId) {
    return res
      .status(403)
      .json({ message: "Forbidden: Cannot access another user's invoices." });
  }

  try {
    const data = await getInvoiceService(userId);
    res.status(200).json(data);
  } catch (error) {
    console.error(`Get Invoice Controller Error for User ${userId}:`, error);
    if (error.message.includes("Invalid")) {
      res.status(400).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: error.message || "Failed to get invoices." });
    }
  }
};

// Admin Update Invoice Status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const statusUpdates = req.body; // e.g., { "orderStatus": "shipped", "paymentStatus": "paid" }

    // Validation is handled within the service now
    const updatedInvoice = await updateInvoiceStatusService(
      invoiceId,
      statusUpdates
    );

    res.status(200).json({
      message: "Invoice status updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error(
      `Error in updateInvoiceStatus controller for ID ${req.params.invoiceId}:`,
      error
    );
    if (
      error.message.includes("not found") ||
      error.message.includes("Invalid")
    ) {
      res.status(404).json({ message: error.message }); // Not found or Invalid ID
    } else if (error.message.includes("No valid status")) {
      res.status(400).json({ message: error.message }); // Bad Request
    } else {
      res
        .status(500)
        .json({ message: error.message || "Failed to update invoice status." });
    }
  }
};

const getAllInvoicesAdmin = async (req, res) => {
  try {
    // Lấy các query params từ request (ví dụ: /admin/invoices?searchTerm=john&page=1&limit=20)
    const queryParams = req.query;
    const data = await getAllInvoicesAdminService(queryParams);
    res.status(200).json(data); // Trả về object chứa invoices và thông tin phân trang
  } catch (error) {
    console.error("Admin Get All Invoices Controller Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to get invoices." });
  }
};

module.exports = {
  createInvoice,
  getInvoice,
  updateInvoiceStatus,
  getAllInvoicesAdmin,
};
