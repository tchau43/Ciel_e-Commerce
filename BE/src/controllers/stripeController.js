// controllers/stripeController.js
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createInvoiceService } = require('../services/invoiceService'); // Needs the service
const Invoice = require('../models/invoice'); // Needs model for updates
const mongoose = require('mongoose');
const { triggerOrderConfirmationEmail } = require('../utils/helper'); // Import email helper

// --- Initiate Stripe Payment Flow ---
const initiateStripePayment = async (req, res) => {
  // Expect optional couponCode
  const { userId, productsList, shippingAddress, couponCode } = req.body;
  const paymentMethod = "CARD"; // Hardcoded for Stripe

  // --- Validation ---
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Valid userId required." });
  if (!productsList || !Array.isArray(productsList) || productsList.length === 0) return res.status(400).json({ message: "productsList required." });
  if (!shippingAddress || !shippingAddress.street /* ...etc... */) return res.status(400).json({ message: "Complete shippingAddress required." });
  // Coupon code validation happens in service
  // --- End Validation ---

  let savedPendingInvoice;
  try {
    // 1. Create invoice with PAID status for Stripe payments
    savedPendingInvoice = await createInvoiceService(
      userId,
      productsList,
      paymentMethod,
      shippingAddress,
      couponCode,
      'paid' // Pass payment status as paid for Stripe
    );

    if (!savedPendingInvoice || !savedPendingInvoice._id || typeof savedPendingInvoice.totalAmount !== 'number') {
      // Should have been caught by service, but double-check
      throw new Error('Invoice creation failed or returned invalid data.');
    }
    console.log(`Stripe Controller: Invoice ${savedPendingInvoice._id} created with paid status.`);

    // --- Handle Zero Amount Orders ---
    // If total is 0 (e.g., 100% discount), no need for Stripe Payment Intent
    const finalTotalAmount = savedPendingInvoice.totalAmount;
    if (finalTotalAmount <= 0) {
      console.log(`Order ${savedPendingInvoice._id} total is ${finalTotalAmount}. Marking as paid (no Stripe PI needed).`);
      // Update invoice status directly (might need a separate service call or do it here)
      await Invoice.findByIdAndUpdate(savedPendingInvoice._id, {
        $set: { paymentStatus: 'paid', orderStatus: 'processing' } // Mark as paid, ready for processing
      });

      // Send confirmation email for zero amount orders
      await triggerOrderConfirmationEmail(savedPendingInvoice)
        .catch(emailError => console.error(`Failed to trigger confirmation email for zero-amount Invoice ${savedPendingInvoice._id}:`, emailError));

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
      name: shippingAddress.fullName || "",
      address: {
        line1: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.zipCode,
        country: shippingAddress.country?.substring(0, 2)?.toUpperCase() || 'VN',
      }
    };
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: 'vnd', // Use your currency
      metadata: {
        invoiceId: savedPendingInvoice._id.toString(),
        userId: userId
      },
      description: `Payment for Invoice #${savedPendingInvoice._id}`,
      shipping: stripeShipping,
    });

    // 3. Link Payment Intent ID back to Invoice
    await Invoice.findByIdAndUpdate(savedPendingInvoice._id, {
      $set: {
        paymentIntentId: paymentIntent.id,
        paidAt: new Date() // Add paid timestamp
      }
    });
    console.log(`Stripe Controller: PI ${paymentIntent.id} created and linked to invoice ${savedPendingInvoice._id}.`);

    // 4. Send client secret to Frontend
    await triggerOrderConfirmationEmail(savedPendingInvoice)
      .catch(emailError => console.error(`Failed to trigger confirmation email for Invoice ${savedPendingInvoice._id}:`, emailError));

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

// --- Handle Stripe Webhook ---
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { invoiceId } = paymentIntent.metadata;

        if (!invoiceId) {
          throw new Error('No invoiceId found in payment intent metadata');
        }

        // Update invoice status if needed (should already be paid)
        const updatedInvoice = await Invoice.findById(invoiceId).populate('user items.product items.variant');

        if (!updatedInvoice) {
          throw new Error(`Invoice ${invoiceId} not found`);
        }

        console.log(`Payment succeeded for invoice ${invoiceId}`);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        const failedInvoiceId = failedPaymentIntent.metadata.invoiceId;

        if (failedInvoiceId) {
          await Invoice.findByIdAndUpdate(
            failedInvoiceId,
            {
              $set: {
                paymentStatus: 'failed',
                orderStatus: 'cancelled'
              }
            }
          );
          console.log(`Payment failed for invoice ${failedInvoiceId}`);
        }
        break;

      // Add other event types as needed

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};

module.exports = { initiateStripePayment, handleStripeWebhook };