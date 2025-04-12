const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
      uppercase: true
    },
  },
  { timeStamp: true }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
