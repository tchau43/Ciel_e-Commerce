//node ./src/migrations/003_removeEmbeddedVariants.js

require('dotenv').config();
const mongoose = require('mongoose');
// Use the NEW Product model definition (without the variants array)
// $unset works based on the field name, not the current schema definition
const { Product } = require('../models/product'); // Adjust path if needed

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI not found in .env file.");
    process.exit(1);
}

async function removeOldVariantsField() {
    let connection;
    let errorOccurred = false;

    try {
        console.log('Connecting to database...');
        connection = await mongoose.connect(MONGODB_URI);
        console.log('Database connected.');

        console.log("Attempting to remove ('$unset') the embedded 'variants' field from products...");

        // Target all products where the 'variants' field still exists
        const filter = { variants: { $exists: true } };
        const updateOperation = { $unset: { variants: {} } }; // The operation to remove the field

        const result = await Product.updateMany(filter, updateOperation, { strict: false });

        console.log('\n--- Removal Summary ---');
        console.log(`Documents matched (had 'variants' field): ${result.matchedCount}`);
        console.log(`Documents modified (field removed):       ${result.modifiedCount}`);
        console.log('---------------------');

        if (result.acknowledged) {
            console.log("Field removal operation acknowledged by server.");
        } else {
            console.warn("Server did not acknowledge the operation.");
        }

    } catch (error) {
        console.error('\n!!! An error occurred during the field removal process !!!:', error);
        errorOccurred = true;
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('Database disconnected.');
        }
        if (errorOccurred) {
            console.error("\nScript finished with errors.");
            process.exit(1);
        } else {
            console.log("\nScript finished.");
            process.exit(0);
        }
    }
}

// --- Run the removal script ---
// Double-check you want to do this! Backup first!
removeOldVariantsField();