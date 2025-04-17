// models/invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    _id: false,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true, },
    quantity: { type: Number, min: 1, required: true },
    priceAtPurchase: { type: Number, min: 0, required: true },
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending", required: true
  },
  paymentMethod: { type: String, required: true, enum: ["CARD", "CASH", "BANK_TRANSFER"] },
  orderStatus: { type: String, enum: ["processing", "shipped", "delivered", "cancelled", "returned"], default: "processing", required: true },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  paymentIntentId: {
    type: String,
    index: true,
    sparse: true
  }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;