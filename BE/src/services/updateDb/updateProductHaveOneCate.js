const Product = require("../../models/product");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout if needed
})
    .then(() => {
        console.log("Connected to MongoDB");
        updateAllProductsToSingleCategory();
    })
    .catch(err => {
        console.error("Error connecting to MongoDB", err);
    });

const updateAllProductsToSingleCategory = async () => {
    try {
        const result = await Product.updateMany(
            { category: { $type: "array" } }, // Only update products where category is an array
            [
                {
                    $set: {
                        // Replace the array with its first element
                        category: { $arrayElemAt: ["$category", 0] }
                    }
                }
            ]
        );

        console.log(`${result.modifiedCount} products updated`);
        process.exit(0); // Exit after update completes
    } catch (err) {
        console.error("Error updating products:", err);
        process.exit(1); // Exit with error
    }
};
