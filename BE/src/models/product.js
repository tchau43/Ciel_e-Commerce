const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    shortDescription: String,
    description: String,
    category:
    {
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
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
