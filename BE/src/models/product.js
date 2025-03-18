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
    productIndex: { // Add this field
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
    unique: true // Ensures one-to-one relationship
  },
  productIndex: String,
  price: { type: Number, required: true, min: 0 },
});

const ProductIndex = mongoose.model("ProductIndex", productIndexSchema);

// Add post-save hook to update ProductIndex
// productSchema.post("save", async (doc) => {
//   const cate = await Category.findOne({ _id: doc.category });

//   // Helper function to process text fields
//   const processField = (field) =>
//     (field || "").toLowerCase().trim().replace(/\s+/g, "_");

//   // Generate the productIndex string
//   const parts = [
//     processField(doc.name),
//     processField(cate.name),
//     processField(doc.description),
//     processField(doc.shortDescription),
//   ].filter((part) => part); // Remove empty strings

//   const productIndexStr = parts.join("_");

//   // Update or create the ProductIndex document
//   const productIndex = await ProductIndex.findOneAndUpdate(
//     { product: doc._id },
//     {
//       productIndex: productIndexStr,
//       price: doc.price,
//     },
//     { upsert: true, new: true } // Create if doesn't exist
//   );

//   // Update the productIndex reference in the Product document
//   doc.productIndex = productIndex._id;
//   await doc.save();
// });

module.exports = { Product, ProductIndex };