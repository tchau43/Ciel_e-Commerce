require('dotenv').config({ path: 'BE/.env' }); // Use the correct path to .env file
const mongoose = require('mongoose');
const FAQ = require('../models/faq');
const FaqCategory = require('../models/faqCategory');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        updateFaqs();
    })
    .catch(err => {
        console.error('Could not connect to MongoDB:', err);
        process.exit(1);
    });

// Update FAQs to use category ObjectIds
async function updateFaqs() {
    try {
        console.log('Starting update of FAQs to use category ObjectIds...');

        // Get all FAQ categories
        const categories = await FaqCategory.find({});
        console.log(`Found ${categories.length} FAQ categories`);

        // Create a mapping from category slug to category ObjectId
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.slug] = cat._id;
        });

        console.log('Category mapping:', categoryMap);

        // Get all FAQs
        const faqs = await FAQ.find({});
        console.log(`Found ${faqs.length} FAQs to update`);

        // Track updates
        let updatedCount = 0;
        let errorCount = 0;

        // Update each FAQ
        for (const faq of faqs) {
            try {
                // If the category is already an ObjectId, skip this FAQ
                if (faq.category instanceof mongoose.Types.ObjectId) {
                    console.log(`FAQ ${faq._id} already has an ObjectId category: ${faq.category}`);
                    continue;
                }

                // Get the current category as a string (old format)
                const oldCategory = faq.category;

                // Convert category string to the corresponding ObjectId
                if (categoryMap[oldCategory]) {
                    // Update the FAQ
                    await FAQ.updateOne(
                        { _id: faq._id },
                        { $set: { category: categoryMap[oldCategory] } }
                    );

                    console.log(`Updated FAQ ${faq._id}: ${oldCategory} -> ${categoryMap[oldCategory]}`);
                    updatedCount++;
                } else {
                    // If category not found, default to 'general'
                    console.warn(`Category '${oldCategory}' not found for FAQ ${faq._id}, defaulting to 'general'`);

                    await FAQ.updateOne(
                        { _id: faq._id },
                        { $set: { category: categoryMap['general'] } }
                    );

                    console.log(`Updated FAQ ${faq._id}: ${oldCategory} -> ${categoryMap['general']} (default)`);
                    updatedCount++;
                }
            } catch (error) {
                console.error(`Error updating FAQ ${faq._id}:`, error);
                errorCount++;
            }
        }

        console.log(`
Update complete:
- Total FAQs processed: ${faqs.length}
- Successfully updated: ${updatedCount}
- Errors: ${errorCount}
        `);

        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error updating FAQs:', error);
        mongoose.connection.close();
        process.exit(1);
    }
} 