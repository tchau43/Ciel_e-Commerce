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

  subtotal: { type: Number, required: true, min: 0 }, // Sum of item prices * quantity BEFORE discounts/fees
  couponCode: { type: String, trim: true, uppercase: true, sparse: true, index: true }, // Store the code used (optional)
  discountAmount: { type: Number, default: 0, min: 0 }, // Amount deducted by coupon
  deliveryFee: { type: Number, default: 0, min: 0 },   // Delivery charge
  totalAmount: { type: Number, required: true, min: 0 }, // Final amount: subtotal - discount + deliveryFee

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


// Optional: Add pre-save hook to ensure totalAmount calculation is correct
// invoiceSchema.pre('save', function (next) {
//   const calculatedTotal = (this.subtotal || 0) - (this.discountAmount || 0) + (this.deliveryFee || 0);
//   this.totalAmount = Math.max(0, calculatedTotal); // Ensure total isn't negative
//   next();
// });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;