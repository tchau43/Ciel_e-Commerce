const mongoose = require("mongoose");
// const ProductIndex = require("./productIndex");
const Category = require("./category");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    shortDescription: String,
    description: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [String],
    brand: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    quantity_in_stock: { type: Number, min: 0, default: 0 },
    images: [String],
    moreInfomation: String,
    popularity: { type: Number, default: 0 },
    productIndex: {
      // Add this field
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductIndex",
    },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  // Remove any leading/trailing spaces from image paths
  if (this.images && Array.isArray(this.images)) {
    this.images = this.images.map(img => img.trim());
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

const productIndexSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true, // Ensures one-to-one relationship
  },
  productIndex: String,
  price: { type: Number, required: true, min: 0 },
});

const ProductIndex = mongoose.model("ProductIndex", productIndexSchema);
module.exports = { Product, ProductIndex };
