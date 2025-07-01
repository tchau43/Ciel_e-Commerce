const mongoose = require('mongoose');
const Category = require('../../models/category');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

const updateAllCategories = async () => {
    try {
        const result = await Category.updateMany(
            {},  
            [{ $set: { name: { $toUpper: "$name" } } }]  
        );

        console.log(`${result.modifiedCount} categories updated`);
    } catch (err) {
        console.error('Error updating categories:', err);
    }
};

async function removeDescriptionField() {
    try {
        const result = await Category.updateMany({}, { $unset: { description: "" } });
        console.log("Successfully removed description field from all documents:", result);
    } catch (error) {
        console.error("Error removing description field:", error);
    }
}

removeDescriptionField();

