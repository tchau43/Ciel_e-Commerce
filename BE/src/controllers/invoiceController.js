
const {
  createInvoiceService,
  getInvoiceService,
  updateInvoiceStatusService,
  getAllInvoicesAdminService,
  getDeliveredProductsForUserService,
} = require("../services/invoiceService");
const Invoice = require("../models/invoice"); 
const mongoose = require("mongoose");

const createInvoice = async (req, res) => {
  
  const { userId, productsList, paymentMethod, shippingAddress, couponCode, deliveryFee } = req.body;

  
  if (!userId || !productsList || !paymentMethod || !shippingAddress) {
    return res.status(400).json({
      message: "Missing required fields (userId, productsList, paymentMethod, shippingAddress).",
    });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format." });
  }

  
  const parsedDeliveryFee = typeof deliveryFee === 'string' ? parseFloat(deliveryFee) : deliveryFee;
  if (typeof parsedDeliveryFee !== 'number' || isNaN(parsedDeliveryFee) || parsedDeliveryFee < 0) {
    return res.status(400).json({ message: "Invalid delivery fee. Must be a non-negative number." });
  }

  try {
    
    const createdInvoice = await createInvoiceService(
      userId,
      productsList,
      paymentMethod,
      shippingAddress,
      parsedDeliveryFee,
      couponCode
    );

    res.status(201).json({
      message: "Invoice created successfully, confirmation email processing.",
      invoice: createdInvoice,
    });
  } catch (error) {
    console.error("Invoice Creation Controller Error:", error);
    
    if (
      error.message.includes("Coupon code") ||
      error.message.includes("Insufficient stock") ||
      error.message.includes("not found") ||
      error.message.includes("minimum purchase") ||
      error.message.includes("invalid or expired") ||
      error.message.includes("usage limit")
    ) {
      res.status(400).json({ message: error.message });
    } else if (error.message.includes("Invalid")) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({
        message: error.message || "Failed to create invoice due to server error.",
      });
    }
  }
};


const getInvoice = async (req, res) => {
  const { userId } = req.params;
  const authenticatedUserId = req.user?._id; 

  
  if (!authenticatedUserId || authenticatedUserId.toString() !== userId) {
    return res
      .status(403)
      .json({ message: "Forbidden: Cannot access another user's invoices." });
  }

  try {
    
    const data = await getInvoiceService(userId, req.query);
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


const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const statusUpdates = req.body; 

    
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
      res.status(404).json({ message: error.message }); 
    } else if (error.message.includes("No valid status")) {
      res.status(400).json({ message: error.message }); 
    } else {
      res
        .status(500)
        .json({ message: error.message || "Failed to update invoice status." });
    }
  }
};

const getAllInvoicesAdmin = async (req, res) => {
  try {
    
    const queryParams = req.query;
    console.log("-------------------------queryParams", queryParams);
    const data = await getAllInvoicesAdminService(queryParams);
    res.status(200).json(data); 
  } catch (error) {
    console.error("Admin Get All Invoices Controller Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to get invoices." });
  }
};


const getDeliveredProducts = async (req, res) => {
  const { userId } = req.params;
  const authenticatedUserId = req.user?._id; 

  
  if (!authenticatedUserId || (authenticatedUserId.toString() !== userId && req.user?.role !== 'ADMIN')) {
    return res
      .status(403)
      .json({ message: "Forbidden: Cannot access another user's product data." });
  }

  try {
    const deliveredProducts = await getDeliveredProductsForUserService(userId);
    res.status(200).json(deliveredProducts);
  } catch (error) {
    console.error(`Get Delivered Products Controller Error for User ${userId}:`, error);
    if (error.message.includes("Invalid")) {
      res.status(400).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: error.message || "Failed to get delivered products." });
    }
  }
};

module.exports = {
  createInvoice,
  getInvoice,
  updateInvoiceStatus,
  getAllInvoicesAdmin,
  getDeliveredProducts,
};
