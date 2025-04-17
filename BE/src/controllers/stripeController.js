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
  // 1. Get required data from request body
  const { userId, productsList, shippingAddress } = req.body;
  const paymentMethod = "CARD"; // Payment method is CARD for Stripe flow

  // Basic Input Validation
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Valid userId is required." });
  }
  if (!productsList || !Array.isArray(productsList) || productsList.length === 0) {
    return res.status(400).json({ message: "A non-empty productsList array is required." });
  }
  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country || !shippingAddress.zipCode /* Add other required fields */) {
    console.error("Stripe Controller: Incomplete shippingAddress.", shippingAddress);
    return res.status(400).json({ message: "Incomplete shippingAddress is required." });
  }
  // Add more validation on productsList items if needed

  let pendingInvoice;

  try {
    // 2. Create the PENDING invoice first using the service
    // The service now handles fetching variant prices correctly & decrementing stock (within its transaction)
    pendingInvoice = await createInvoiceService(
      userId,
      productsList,
      paymentMethod, // Set as 'CARD'
      shippingAddress
      // paymentIntentId is not passed here initially
    );

    // Validate the created invoice
    if (!pendingInvoice || !pendingInvoice._id || typeof pendingInvoice.totalAmount !== 'number') {
      throw new Error('Invoice creation failed or returned invalid data.');
    }

    console.log(`Stripe Controller: Pending invoice ${pendingInvoice._id} created successfully.`);

    // 3. Create Stripe Payment Intent
    // Ensure amount is in the smallest currency unit (e.g., cents for USD, or base unit for zero-decimal like VND)
    const amountInSmallestUnit = Math.round(pendingInvoice.totalAmount); // Adjust if your currency has decimals (e.g., * 100 for USD)

    if (amountInSmallestUnit <= 0) {
      // You might want to cancel/delete the pendingInvoice here
      await Invoice.findByIdAndDelete(pendingInvoice._id); // Example cleanup
      console.error(`Stripe Controller: Invoice ${pendingInvoice._id} resulted in zero or negative amount. Invoice deleted.`);
      throw new Error('Calculated total amount must be positive.');
    }

    // Format shipping for Stripe
    // Ensure you have a 'name' field in your shippingAddress object from the frontend
    const stripeShipping = {
      name: shippingAddress.name || `${userId}`, // Use name or fallback to User ID
      address: {
        line1: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state, // Optional for some countries
        postal_code: shippingAddress.zipCode,
        // Stripe generally expects 2-letter ISO country codes (e.g., 'VN', 'US')
        country: shippingAddress.country ? shippingAddress.country.substring(0, 2).toUpperCase() : undefined,
      }
    };

    // Create the Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: 'vnd', // IMPORTANT: Set your currency code correctly!
      metadata: { // Useful for linking back in webhooks
        invoiceId: pendingInvoice._id.toString(),
        userId: userId,
      },
      description: `Payment for Invoice #${pendingInvoice._id}`,
      shipping: stripeShipping, // Include shipping details
      // automatic_payment_methods: { enabled: true }, // Consider using this
      // payment_method_types: ['card'], // Explicitly allow card
    });

    // 4. Link Payment Intent ID back to your Invoice (Optional but Recommended)
    // Use findByIdAndUpdate to ensure atomicity if not using transactions broadly
    await Invoice.findByIdAndUpdate(pendingInvoice._id, {
      $set: { paymentIntentId: paymentIntent.id }
    });

    console.log(`Stripe Controller: Payment Intent ${paymentIntent.id} created and linked to invoice ${pendingInvoice._id}.`);

    // 5. Send Client Secret back to Frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret, // Frontend uses this with Stripe Elements/SDK
      invoiceId: pendingInvoice._id.toString(),   // Send your internal invoice ID back
      totalAmount: pendingInvoice.totalAmount   // Send the final calculated amount
    });

  } catch (error) {
    console.error("Stripe Controller: Error initiating payment:", error);
    // If invoice was created but Stripe failed, should you update invoice status to failed?
    // if (pendingInvoice && pendingInvoice._id) {
    //     await Invoice.findByIdAndUpdate(pendingInvoice._id, { $set: { paymentStatus: 'failed', orderStatus: 'cancelled' } });
    // }
    res.status(500).json({ message: `Failed to initiate payment: ${error.message}` });
  }
};

module.exports = {
  initiateStripePayment,
};