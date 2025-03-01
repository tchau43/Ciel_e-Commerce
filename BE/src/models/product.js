const mongoose = require("mongoose");

const productTable = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  tags: String,
  brand: String,
  status: String,
  quantity_in_stock: Number,
  image: String,
});

const Product = mongoose.model("product", productTable);
export default Product;
