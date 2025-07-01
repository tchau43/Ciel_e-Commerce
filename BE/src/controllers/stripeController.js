require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createInvoiceService } = require('../services/invoiceService');
const Invoice = require('../models/invoice');
const mongoose = require('mongoose');
const { triggerOrderConfirmationEmail } = require('../utils/helper');

const initiateStripePayment = async (req, res) => {
  const { userId, productsList, shippingAddress, couponCode, deliveryFee } = req.body;
  const paymentMethod = "CARD";

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Valid userId required." });
  if (!productsList || !Array.isArray(productsList) || productsList.length === 0) return res.status(400).json({ message: "productsList required." });
  if (!shippingAddress || !shippingAddress.street /* ...etc... */) return res.status(400).json({ message: "Complete shippingAddress required." });
  if (typeof deliveryFee !== 'number' || deliveryFee < 0) return res.status(400).json({ message: "Valid deliveryFee required." });

  let savedPendingInvoice;
  try {
    savedPendingInvoice = await createInvoiceService(
      userId,
      productsList,
      paymentMethod,
      shippingAddress,
      deliveryFee,
      couponCode,
      'paid'
    );

    if (!savedPendingInvoice || !savedPendingInvoice._id || typeof savedPendingInvoice.totalAmount !== 'number') {
      throw new Error('Invoice creation failed or returned invalid data.');
    }
    console.log(`Stripe Controller: Invoice ${savedPendingInvoice._id} created with paid status.`);

    const finalTotalAmount = savedPendingInvoice.totalAmount;
    if (finalTotalAmount <= 0) {
      console.log(`Order ${savedPendingInvoice._id} total is ${finalTotalAmount}. Marking as paid (no Stripe PI needed).`);
    
      await Invoice.findByIdAndUpdate(savedPendingInvoice._id, {
        $set: { paymentStatus: 'paid', orderStatus: 'processing' }
      });
      await triggerOrderConfirmationEmail(savedPendingInvoice)
        .catch(emailError => console.error(`Failed to trigger confirmation email for zero-amount Invoice ${savedPendingInvoice._id}:`, emailError));
      return res.status(200).json({
        message: "Order processed successfully (Free due to discount).",
        invoiceId: savedPendingInvoice._id.toString(),
        totalAmount: 0,
        clientSecret: null
      });
    }
    const amountInSmallestUnit = Math.round(finalTotalAmount);
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
      currency: 'vnd',
      metadata: {
        invoiceId: savedPendingInvoice._id.toString(),
        userId: userId
      },
      description: `Payment for Invoice #${savedPendingInvoice._id}`,
      shipping: stripeShipping,
    });

  
    await Invoice.findByIdAndUpdate(savedPendingInvoice._id, {
      $set: {
        paymentIntentId: paymentIntent.id,
        paidAt: new Date()
      }
    });
    console.log(`Stripe Controller: PI ${paymentIntent.id} created and linked to invoice ${savedPendingInvoice._id}.`);

    await triggerOrderConfirmationEmail(savedPendingInvoice)
      .catch(emailError => console.error(`Failed to trigger confirmation email for Invoice ${savedPendingInvoice._id}:`, emailError));

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      invoiceId: savedPendingInvoice._id.toString(),
      totalAmount: finalTotalAmount
    });

  } catch (error) {
    console.error("Stripe Controller: Error initiating payment:", error);
  
    if (error.message.includes("Coupon code") || error.message.includes("Insufficient stock")) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: `Failed to initiate payment: ${error.message}` });
    }
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
  
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { invoiceId } = paymentIntent.metadata;

        if (!invoiceId) {
          throw new Error('No invoiceId found in payment intent metadata');
        }

      
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