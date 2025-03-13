const mongoose = require('mongoose');
const Product = require('../../models/product'); // Adjust the path to your Product model

require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
        updateProducts();
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Function to update products
const updateProducts = async () => {
    try {
        // Fetch all products to update
        const products = await Product.find({});

        // Loop through each product to update
        for (let product of products) {
            // Set default values for the new fields
            product.name = product.name || "name";
            product.price = product.price || 0;
            product.shortDescription = product.shortDescription || product.name + " shortDescription";
            product.description = product.description || product.name + " description";
            product.category = product.category || null; // You can replace null with a default category if needed
            product.tags = product.tags || []; // Initialize tags as an empty array if not set
            product.brand = product.brand || ''; // Default to empty string if no brand
            product.status = product.status || 'active'; // Set default status if not present
            product.quantity_in_stock = product.quantity_in_stock || 0; // Default stock quantity
            product.images = product.images || []; // Default to empty array if no images
            product.moreInfomation = product.moreInfomation || product.name + " moreInfomation"; // Default to empty string if not present

            // Save the updated product
            await product.save();
        }

        console.log('All products have been updated successfully!');
        process.exit(0); // Exit the script after completion
    } catch (error) {
        console.error('Error updating products:', error);
        process.exit(1); // Exit with error
    }
};

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


