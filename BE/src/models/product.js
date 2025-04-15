const mongoose = require("mongoose");
// const ProductIndex = require("./productIndex");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    base_price: { type: Number, required: true, min: 0 },
    description: [String],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [String],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    variants: [
      {
        types: String,
        price: Number,
      },
    ],
    images: [String],
    popularity: { type: Number, default: 0 },
    url: String,
    productIndex: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductIndex",
    },
  },
  { timestamps: true }
);

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
