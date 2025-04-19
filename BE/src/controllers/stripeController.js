// controllers/stripeController.js
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createInvoiceService } = require('../services/invoiceService'); // Needs the service
const Invoice = require('../models/invoice'); // Needs model for updates
const mongoose = require('mongoose');

// --- Initiate Stripe Payment Flow ---
const initiateStripePayment = async (req, res) => {
  // Expect optional couponCode
  const { userId, productsList, shippingAddress, couponCode } = req.body;
  const paymentMethod = "CARD"; // Hardcoded for Stripe

  // --- Validation ---
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Valid userId required." });
  if (!productsList || !Array.isArray(productsList) || productsList.length === 0) return res.status(400).json({ message: "productsList required." });
  if (!shippingAddress || !shippingAddress.street /* ...etc... */) return res.status(400).json({ message: "Complete shippingAddress with name required." });
  // Coupon code validation happens in service
  // --- End Validation ---

  let savedPendingInvoice;
  try {
    // 1. Create PENDING invoice, passing couponCode
    // Service validates coupon, applies discount, calculates final amount, updates stock/coupon, triggers email
    savedPendingInvoice = await createInvoiceService(
      userId,
      productsList,
      paymentMethod,
      shippingAddress,
      couponCode // Pass optional code
    );

    if (!savedPendingInvoice || !savedPendingInvoice._id || typeof savedPendingInvoice.totalAmount !== 'number') {
      // Should have been caught by service, but double-check
      throw new Error('Invoice creation failed or returned invalid data.');
    }
    console.log(`Stripe Controller: Pending invoice ${savedPendingInvoice._id} created.`);

    // --- Handle Zero Amount Orders ---
    // If total is 0 (e.g., 100% discount), no need for Stripe Payment Intent
    const finalTotalAmount = savedPendingInvoice.totalAmount;
    if (finalTotalAmount <= 0) {
      console.log(`Order ${savedPendingInvoice._id} total is ${finalTotalAmount}. Marking as paid (no Stripe PI needed).`);
      // Update invoice status directly (might need a separate service call or do it here)
      await Invoice.findByIdAndUpdate(savedPendingInvoice._id, {
        $set: { paymentStatus: 'paid', orderStatus: 'processing' } // Mark as paid, ready for processing
      });
      // Send response indicating success without needing payment
      return res.status(200).json({
        message: "Order processed successfully (Free due to discount).",
        invoiceId: savedPendingInvoice._id.toString(),
        totalAmount: 0,
        clientSecret: null // No client secret needed
      });
    }
    // --- End Zero Amount Check ---


    // 2. Create Stripe Payment Intent (Only if amount > 0)
    const amountInSmallestUnit = Math.round(finalTotalAmount); // Adjust for currency if needed (*100 for USD etc)
    const stripeShipping = {
      name: "",
      address: {
        line1: shippingAddress.street, city: shippingAddress.city,
        state: shippingAddress.state, postal_code: shippingAddress.zipCode,
        country: shippingAddress.country?.substring(0, 2)?.toUpperCase() || 'VN', // Default VN if needed
      }
    };
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: 'vnd', // Use your currency
      metadata: { invoiceId: savedPendingInvoice._id.toString(), userId: userId },
      description: `Payment for Invoice #${savedPendingInvoice._id}`,
      shipping: stripeShipping,
    });

    // 3. Link Payment Intent ID back to Invoice
    await Invoice.findByIdAndUpdate(savedPendingInvoice._id, {
      $set: { paymentIntentId: paymentIntent.id }
    });
    console.log(`Stripe Controller: PI ${paymentIntent.id} created and linked to invoice ${savedPendingInvoice._id}.`);

    // 4. Send client secret to Frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      invoiceId: savedPendingInvoice._id.toString(),
      totalAmount: finalTotalAmount // Send final amount
    });

  } catch (error) {
    console.error("Stripe Controller: Error initiating payment:", error);
    // Important: If createInvoiceService failed, transaction was already aborted.
    // If Stripe PI creation failed *after* invoice was committed, the pending invoice still exists.
    // Need cleanup strategy? Or rely on user retrying / admin intervention / webhook failures.
    if (error.message.includes("Coupon code") || error.message.includes("Insufficient stock")) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: `Failed to initiate payment: ${error.message}` });
    }
  }
};

module.exports = { initiateStripePayment };