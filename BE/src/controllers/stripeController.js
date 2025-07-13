require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createInvoiceService } = require("../services/invoiceService");
const Invoice = require("../models/invoice");
const mongoose = require("mongoose");
const { triggerOrderConfirmationEmail } = require("../utils/helper");

const initiateStripePayment = async (req, res) => {
  const { userId, productsList, shippingAddress, couponCode, deliveryFee } =
    req.body;
  const paymentMethod = "CARD";

  if (!userId || !mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ message: "Valid userId required." });
  if (
    !productsList ||
    !Array.isArray(productsList) ||
    productsList.length === 0
  )
    return res.status(400).json({ message: "productsList required." });
  if (!shippingAddress || !shippingAddress.street /* ...etc... */)
    return res
      .status(400)
      .json({ message: "Complete shippingAddress required." });
  if (typeof deliveryFee !== "number" || deliveryFee < 0)
    return res.status(400).json({ message: "Valid deliveryFee required." });

  let savedPendingInvoice;
  try {
    savedPendingInvoice = await createInvoiceService(
      userId,
      productsList,
      paymentMethod,
      shippingAddress,
      deliveryFee,
      couponCode,
      "pending"
    );

    if (
      !savedPendingInvoice ||
      !savedPendingInvoice._id ||
      typeof savedPendingInvoice.totalAmount !== "number"
    ) {
      throw new Error("Invoice creation failed or returned invalid data.");
    }
    console.log(
      `Stripe Controller: Invoice ${savedPendingInvoice._id} created with pending status.`
    );

    const finalTotalAmount = savedPendingInvoice.totalAmount;
    if (finalTotalAmount <= 0) {
      console.log(
        `Order ${savedPendingInvoice._id} total is ${finalTotalAmount}. Marking as paid (no Stripe PI needed).`
      );

      await Invoice.findByIdAndUpdate(savedPendingInvoice._id, {
        $set: { paymentStatus: "paid", orderStatus: "processing" },
      });
      await triggerOrderConfirmationEmail(savedPendingInvoice).catch(
        (emailError) =>
          console.error(
            `Failed to trigger confirmation email for zero-amount Invoice ${savedPendingInvoice._id}:`,
            emailError
          )
      );
      return res.status(200).json({
        message: "Order processed successfully (Free due to discount).",
        invoiceId: savedPendingInvoice._id.toString(),
        totalAmount: 0,
        clientSecret: null,
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
        country:
          shippingAddress.country?.substring(0, 2)?.toUpperCase() || "VN",
      },
    };
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: "vnd",
      metadata: {
        invoiceId: savedPendingInvoice._id.toString(),
        userId: userId,
      },
      description: `Payment for Invoice #${savedPendingInvoice._id}`,
      shipping: stripeShipping,
    });

    await Invoice.findByIdAndUpdate(savedPendingInvoice._id, {
      $set: {
        paymentIntentId: paymentIntent.id,
        paymentStatus: "pending",
        orderStatus: "processing",
      },
    });
    console.log(
      `Stripe Controller: PI ${paymentIntent.id} created and linked to invoice ${savedPendingInvoice._id} with pending status.`
    );

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      invoiceId: savedPendingInvoice._id.toString(),
      totalAmount: finalTotalAmount,
    });
  } catch (error) {
    console.error("Stripe Controller: Error initiating payment:", error);

    if (
      error.message.includes("Coupon code") ||
      error.message.includes("Insufficient stock")
    ) {
      res.status(400).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: `Failed to initiate payment: ${error.message}` });
    }
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    console.log("Webhook received:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      bodyLength: req.body ? req.body.length : 0,
    });

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("Webhook event type:", event.type);
    console.log(
      "Webhook event data:",
      JSON.stringify(event.data.object, null, 2)
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        const { invoiceId } = paymentIntent.metadata;

        console.log("Payment succeeded for invoice:", invoiceId);

        if (!invoiceId) {
          console.error("No invoiceId found in payment intent metadata");
          throw new Error("No invoiceId found in payment intent metadata");
        }

        const updatedInvoice = await Invoice.findById(invoiceId).populate(
          "user items.product items.variant"
        );

        if (!updatedInvoice) {
          console.error(`Invoice ${invoiceId} not found`);
          throw new Error(`Invoice ${invoiceId} not found`);
        }

        
        await Invoice.findByIdAndUpdate(invoiceId, {
          $set: {
            paymentStatus: "paid",
            orderStatus: "processing",
            paidAt: new Date(),
          },
        });

        console.log(
          `Payment succeeded for invoice ${invoiceId} - Status updated to paid`
        );

        
        await triggerOrderConfirmationEmail(updatedInvoice).catch(
          (emailError) =>
            console.error(
              `Failed to trigger confirmation email for Invoice ${invoiceId}:`,
              emailError
            )
        );

        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        const failedInvoiceId = failedPaymentIntent.metadata.invoiceId;

        console.log("Payment failed for invoice:", failedInvoiceId);

        if (failedInvoiceId) {
          await Invoice.findByIdAndUpdate(failedInvoiceId, {
            $set: {
              paymentStatus: "failed",
              orderStatus: "cancelled",
            },
          });
          console.log(
            `Payment failed for invoice ${failedInvoiceId} - Status updated to failed`
          );
        }
        break;

      case "payment_intent.canceled":
        const canceledPaymentIntent = event.data.object;
        const canceledInvoiceId = canceledPaymentIntent.metadata.invoiceId;

        console.log("Payment canceled for invoice:", canceledInvoiceId);

        if (canceledInvoiceId) {
          await Invoice.findByIdAndUpdate(canceledInvoiceId, {
            $set: {
              paymentStatus: "pending",
              orderStatus: "processing",
            },
          });
          console.log(
            `Payment canceled for invoice ${canceledInvoiceId} - Status reset to processing`
          );
        }
        break;

      case "payment_intent.processing":
        const processingPaymentIntent = event.data.object;
        const processingInvoiceId = processingPaymentIntent.metadata.invoiceId;

        console.log("Payment processing for invoice:", processingInvoiceId);

        if (processingInvoiceId) {
          await Invoice.findByIdAndUpdate(processingInvoiceId, {
            $set: {
              paymentStatus: "pending",
              orderStatus: "processing",
            },
          });
          console.log(
            `Payment processing for invoice ${processingInvoiceId} - Status set to processing`
          );
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
};

const checkPaymentStatus = async (req, res) => {
  const { paymentIntentId } = req.params;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const { invoiceId } = paymentIntent.metadata;

    console.log("Checking payment status for:", paymentIntentId);
    console.log("Payment status:", paymentIntent.status);
    console.log("Invoice ID:", invoiceId);

    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        console.log("Current invoice status:", invoice.paymentStatus);

        
        if (paymentIntent.status === "succeeded") {
          await Invoice.findByIdAndUpdate(invoiceId, {
            $set: {
              paymentStatus: "paid",
              orderStatus: "processing",
              paidAt: new Date(),
            },
          });
          console.log("Invoice updated to paid");
        } else if (paymentIntent.status === "requires_payment_method") {
          await Invoice.findByIdAndUpdate(invoiceId, {
            $set: {
              paymentStatus: "pending",
              orderStatus: "processing",
            },
          });
          console.log("Invoice updated to pending");
        }
      }
    }

    res.json({
      paymentIntentId,
      status: paymentIntent.status,
      invoiceId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  initiateStripePayment,
  handleStripeWebhook,
  checkPaymentStatus,
};
