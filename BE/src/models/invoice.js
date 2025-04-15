// models/invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    _id: false, // Often not needed for invoice items subdoc unless referenced
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: { type: Number, min: 1, required: true },
    priceAtPurchase: { type: Number, min: 0, required: true },
    // Optionally store variant info if needed for display/refunds later
    // variant: { type: mongoose.Schema.Types.ObjectId } // Store variant ObjectId
    // variantType: { type: String } // Store variant type/name
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"], // Added refunded example
    default: "pending",
    required: true
  },
  // Add paymentMethod to store how the user intended to pay
  paymentMethod: {
    type: String,
    required: true,
    enum: ["COD", "Stripe", "Other"] // Adjust as needed
  },
  shippingAddress: {
    // Assuming structure based on previous discussions
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    // You might want a name/phone here too for shipping label
    // name: String,
    // phone: String,
  },
  // Optionally store Stripe Payment Intent ID for reconciliation
  paymentIntentId: {
    type: String,
    index: true, // Index if you plan to query by it
    sparse: true // Allow null/missing values efficiently
  }
}, { timestamps: true }); // Adds createdAt, updatedAt

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;