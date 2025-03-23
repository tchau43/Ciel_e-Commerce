const mongoose = require('mongoose')

const customerHomePageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
            unique: true,
            uppercase: true
        },
        description: {
            type: String,
            default: "",
        },
    },
    { timeStamp: true }
);

const CustomerHomePageSchema = mongoose.model("Customer_Home_Page", customerHomePageSchema);

module.exports = CustomerHomePageSchema;
