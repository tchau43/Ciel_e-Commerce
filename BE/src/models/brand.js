const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
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

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
