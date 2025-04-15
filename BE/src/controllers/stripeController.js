// controllers/stripeController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createInvoiceService } = require('../services/invoiceService'); // Make sure path is correct
const Invoice = require('../models/invoice'); // Make sure path is correct

const initiateStripePayment = async (req, res) => {
  // 1. Get data from frontend request body
  const { userId, productsList, shippingAddress } = req.body;
  const paymentMethod = "Stripe"; // Hardcode for this flow

  // Basic Validation
  if (!userId || !productsList || !shippingAddress || !Array.isArray(productsList) || productsList.length === 0) {
    console.error("BACKEND Controller: Missing required fields for initiateStripePayment.", req.body);
    return res.status(400).json({ message: "Missing required fields to initiate payment." });
  }

  let savedInvoice;

  try {
    // 2. Create the PENDING invoice first
    savedInvoice = await createInvoiceService(
      userId,
      productsList,
      paymentMethod,
      shippingAddress
      // Do NOT pass paymentIntentId here yet
    );

    if (!savedInvoice || !savedInvoice._id || typeof savedInvoice.totalAmount !== 'number') {
      throw new Error('Invoice creation failed or returned invalid data.');
    }

    console.log(`BACKEND Controller: Pending invoice ${savedInvoice._id} created.`);

    // 3. Create a Stripe Payment Intent
    const amountInSmallestUnit = Math.round(savedInvoice.totalAmount); // Assuming VND (zero-decimal)

    if (amountInSmallestUnit <= 0) {
      // Maybe delete the pending invoice or mark as failed?
      throw new Error('Calculated total amount must be positive to create Payment Intent.');
    }

    const paymentIntentParams = {
      amount: amountInSmallestUnit,
      currency: 'vnd', // Or your currency
      metadata: {
        invoiceId: savedInvoice._id.toString(), // Link to invoice
        userId: userId,
      },
      description: `Invoice payment for ${savedInvoice._id}`,
      // Optionally add customer ID if you create/retrieve Stripe Customers
      // customer: stripeCustomerId,
      shipping: { // Pass shipping details to Stripe
        name: shippingAddress.name || 'Customer', // Add name to your ShippingAddress type/form if possible
        address: {
          line1: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zipCode,
          // Stripe expects 2-letter ISO country code
          country: shippingAddress.country ? shippingAddress.country.substring(0, 2).toUpperCase() : undefined,
        }
      }
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // --- Optional: Store PI ID on the pending invoice ---
    // This helps link them definitively before the webhook confirms
    // Make sure your Invoice schema has `paymentIntentId: { type: String, index: true, sparse: true }`
    savedInvoice.paymentIntentId = paymentIntent.id;
    await savedInvoice.save();
    // ---

    console.log(`BACKEND Controller: Payment Intent ${paymentIntent.id} created for invoice ${savedInvoice._id}.`);

    // 4. Send the client secret and invoice ID back to the frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      invoiceId: savedInvoice._id.toString(),
      totalAmount: savedInvoice.totalAmount // Send back calculated total
    });

  } catch (error) {
    console.error("BACKEND Controller: Error initiating Stripe payment:", error);
    // Consider more specific error responses based on the failure point
    res.status(500).json({ message: `Failed to initiate payment: ${error.message}` });
  }
};

// Keep the old createPaymentIntent if it's used elsewhere, otherwise, it can be removed
// const createPaymentIntent = async (req, res) => { ... };

module.exports = {
  initiateStripePayment,
  // createPaymentIntent, // only if still needed elsewhere
};