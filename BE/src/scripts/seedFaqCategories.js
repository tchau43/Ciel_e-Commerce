require('dotenv').config({ path: 'BE/.env' }); // Use the correct path to .env file
const mongoose = require('mongoose');
console.log('Script starting...');

let FaqCategory;
try {
    FaqCategory = require('../models/faqCategory');
    console.log('FaqCategory model loaded');
} catch (err) {
    console.error('Error loading FaqCategory model:', err);
    process.exit(1);
}

// MongoDB connection string
// console.log('Using connection string:', process.env.MONGODB_URI);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db';
console.log('Using connection string:', MONGODB_URI);

// Connect to MongoDB with forced timeout
try {
    mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
        .then(() => {
            console.log('Connected to MongoDB');
            seedCategories().catch(err => {
                console.error('Error in seedCategories:', err);
                mongoose.connection.close();
            });
        })
        .catch(err => {
            console.error('Could not connect to MongoDB:', err);
            process.exit(1);
        });
} catch (err) {
    console.error('Unexpected error during MongoDB connection setup:', err);
}

// Sample FAQ Categories
const sampleCategories = [
    {
        name: 'shipping',
        slug: 'shipping',
        description: 'Questions about shipping methods, delivery times, and tracking orders',
        icon: 'TruckIcon',
        displayOrder: 1,
        color: 'blue'
    },
    {
        name: 'payment',
        slug: 'payment',
        description: 'Questions about payment methods, billing issues, and refunds',
        icon: 'CreditCardIcon',
        displayOrder: 2,
        color: 'green'
    },
    {
        name: 'returns',
        slug: 'returns',
        description: 'Questions about returning products, exchange policies, and warranties',
        icon: 'ArrowLeftIcon',
        displayOrder: 3,
        color: 'orange'
    },
    {
        name: 'product',
        slug: 'product',
        description: 'Questions about product features, specifications, and usage',
        icon: 'ShoppingBagIcon',
        displayOrder: 4,
        color: 'purple'
    },
    {
        name: 'account',
        slug: 'account',
        description: 'Questions about accounts, profile management, and security',
        icon: 'UserIcon',
        displayOrder: 5,
        color: 'yellow'
    },
    {
        name: 'general',
        slug: 'general',
        description: 'General questions about our services and company',
        icon: 'QuestionMarkCircledIcon',
        displayOrder: 6,
        color: 'gray'
    },
    {
        name: 'other',
        slug: 'other',
        description: 'Other questions not covered by the main categories',
        icon: 'MixerHorizontalIcon',
        displayOrder: 7,
        color: 'slate'
    }
];

// Seed categories
async function seedCategories() {
    try {
        // Delete all existing categories
        await FaqCategory.deleteMany({});
        console.log('Deleted existing FAQ categories');

        // Create new categories
        const createdCategories = await FaqCategory.insertMany(sampleCategories);
        console.log(`Created ${createdCategories.length} FAQ categories`);

        // Print the created categories
        console.log('Created categories:');
        createdCategories.forEach(cat => {
            console.log(`- ${cat.name} (${cat.slug}): ${cat._id}`);
        });

        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding FAQ categories:', error);
        mongoose.connection.close();
        process.exit(1);
    }
} 