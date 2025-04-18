// controllers/stripeController.js
require('dotenv').config(); // Ensure stripe key is loaded
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createInvoiceService } = require('../services/invoiceService'); // Adjust path if needed
const Invoice = require('../models/invoice'); // Adjust path if needed
const mongoose = require('mongoose'); // Needed for ID validation

// --- Initiate Stripe Payment Flow ---
// 1. Creates a PENDING invoice in your DB (calculating total amount).
// 2. Creates a Stripe Payment Intent using the calculated amount.
// 3. Saves the Payment Intent ID to your invoice.
// 4. Returns the Payment Intent's client_secret to the frontend.
const initiateStripePayment = async (req, res) => {
  // Remove recipientEmail from here
  const { userId, productsList, shippingAddress } = req.body;
  const paymentMethod = "CARD";

  // Keep validation (excluding recipientEmail)
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) { /* ... */ }
  if (!productsList || !Array.isArray(productsList) || productsList.length === 0) { /* ... */ }
  if (!shippingAddress || !shippingAddress.street /* ...etc... */) { /* ... */ }
  if (!shippingAddress.name) { // Stripe needs name for shipping
    return res.status(400).json({ message: "shippingAddress.name is required for payment." });
  }

  let savedPendingInvoice;

  try {
    // 1. Create PENDING invoice (Service will trigger email to user's registered email)
    savedPendingInvoice = await createInvoiceService(
      userId,
      productsList,
      paymentMethod,
      shippingAddress
      // No recipientEmail passed here
    );

    if (!savedPendingInvoice || !savedPendingInvoice._id /*...etc*/) { /* ... */ }
    console.log(`Stripe Controller: Pending invoice ${savedPendingInvoice._id} created.`);

    // 2. Create Stripe Payment Intent (keep as before)
    const amountInSmallestUnit = Math.round(savedPendingInvoice.totalAmount);
    if (amountInSmallestUnit <= 0) { /* ... handle zero amount ... */ }
    const stripeShipping = { /* ... format shipping ... */ };
    const paymentIntent = await stripe.paymentIntents.create({ /* ... params ... */ });

    // 3. Link Payment Intent ID back to Invoice (keep as before)
    await Invoice.findByIdAndUpdate(savedPendingInvoice._id, { $set: { paymentIntentId: paymentIntent.id } });
    console.log(`Stripe Controller: PI ${paymentIntent.id} linked to invoice ${savedPendingInvoice._id}.`);

    // 4. Send client secret to Frontend (keep as before)
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      invoiceId: savedPendingInvoice._id.toString(),
      totalAmount: savedPendingInvoice.totalAmount
    });

  } catch (error) {
    console.error("Stripe Controller: Error initiating payment:", error);
    res.status(500).json({ message: `Failed to initiate payment: ${error.message}` });
  }
};

module.exports = {
  initiateStripePayment,
};