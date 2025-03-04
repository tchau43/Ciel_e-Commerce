const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User collection
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to Product collection
      required: true
    },
    quantity: { type: Number, min: 1, required: true },
    priceAtPurchase: { type: Number, min: 0, required: true }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;