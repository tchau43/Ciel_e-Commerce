const mongoose = require('mongoose');
const Category = require('../../models/category');
require('dotenv').config();

mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

const updateAllCategories = async () => {
    try {
        // Use aggregation pipeline in the update
        const result = await Category.updateMany(
            {},  // Update all documents
            [{ $set: { name: { $toUpper: "$name" } } }]  // Aggregation pipeline
        );

        console.log(`${result.modifiedCount} categories updated`);
    } catch (err) {
        console.error('Error updating categories:', err);
    }
};

// Alternatively, using async/await:
async function removeDescriptionField() {
    try {
        const result = await Category.updateMany({}, { $unset: { description: "" } });
        console.log("Successfully removed description field from all documents:", result);
    } catch (error) {
        console.error("Error removing description field:", error);
    }
}

removeDescriptionField();

// updateAllCategories();