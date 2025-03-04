const { timeStamp } = require("console");
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timeStamp: true }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
