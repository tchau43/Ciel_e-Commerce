// node ./src/migrations/003_embedVariants.js
require('dotenv').config();
const mongoose = require('mongoose');

// Ensure these paths correctly point to your model files
// IMPORTANT: Product model MUST be the version with:
// variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variant' }]
const { Product } = require('../models/product');
const Variant = require('../models/variant');

// --- Configuration ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI not found in .env file.");
    process.exit(1);
}

// --- Main Migration Logic ---
async function runMigration() {
    console.log("!!! IMPORTANT !!!");
    console.log("!!! Ensure Product schema in models/product.js expects an array of ObjectIds for 'variants'. !!!");
    console.log("!!! Backup your database BEFORE running this script. !!!");
    console.log("--- Linking Variants (ObjectIds) back into Products ---");
    console.log("-------------------------------------------------------");

    // Optional: Confirmation Step
    const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    await new Promise(resolve => {
        readline.question('Type YES to confirm and start linking variants: ', (answer) => {
            readline.close();
            if (answer !== 'YES') {
                console.log('Operation cancelled.');
                process.exit(0);
            }
            resolve();
        });
    });
    // End Optional Confirmation

    let connection;
    let processedProductCount = 0;
    let updatedProductCount = 0;
    let errorCount = 0;
    let productCursor;

    try {
        console.log('Connecting to database...');
        connection = await mongoose.connect(MONGODB_URI);
        console.log('Database connected.');

        console.log('Starting variant linking...');

        // Find all products. Fetch only ID for efficiency.
        productCursor = Product.find({}, { _id: 1, name: 1 }).cursor(); // Include name for logging

        console.log('Processing products...');

        await productCursor.eachAsync(async (productStub) => {
            processedProductCount++;
            const productId = productStub._id;
            console.log(`\nProcessing Product ID: ${productId} (Name: ${productStub.name})`);

            try {
                // Find all variants associated with this product ID, selecting ONLY their _id
                const variantDocs = await Variant.find(
                    { product: productId }, // Filter by product ID
                    { _id: 1 } // Projection: only select the _id field
                ).lean(); // Use lean for performance

                // Extract just the ObjectId values into an array
                const variantIdsArray = variantDocs.map(v => v._id);

                if (variantIdsArray.length === 0) {
                    console.log(`  -> No variants found in Variant collection for Product ${productId}. Setting 'variants' array to empty.`);
                    // Ensure the product's variant array is empty
                    await Product.updateOne({ _id: productId }, { $set: { variants: [] } });
                    // updatedProductCount++; // Optionally count this
                    return; // Move to next product
                }

                console.log(`  -> Found ${variantIdsArray.length} variant IDs. Linking to product...`);

                // Update the product document, setting its variants array to the array of ObjectIds
                const updateResult = await Product.updateOne(
                    { _id: productId },
                    { $set: { variants: variantIdsArray } } // Use $set to replace/create the array with IDs
                );

                if (updateResult.modifiedCount === 1) {
                    console.log(`  -> Successfully linked ${variantIdsArray.length} variant IDs to Product ${productId}.`);
                    updatedProductCount++;
                } else if (updateResult.matchedCount === 1 && updateResult.modifiedCount === 0) {
                    console.log(`  -> Product ${productId} found but variant IDs were already correctly linked (no modification needed).`);
                    // updatedProductCount++; // Optionally count this too
                } else {
                    console.warn(`  -> Product ${productId} not found during update (matchedCount: ${updateResult.matchedCount}). This shouldn't happen.`);
                }

            } catch (error) {
                console.error(`  -> FAILED processing for Product ${productId}:`, error);
                errorCount++;
            }
        }); // End cursor loop

        console.log('\n--- Migration Summary ---');
        console.log(`Total products checked: ${processedProductCount}`);
        console.log(`Products successfully updated with variant links: ${updatedProductCount}`);
        console.log(`Products failed during processing: ${errorCount}`);
        console.log('-------------------------');
        console.log('Variant linking script finished.');

    } catch (error) {
        console.error('\n!!! Critical error during migration setup or processing !!!:', error);
        errorCount++;
    } finally {
        if (productCursor) {
            await productCursor.close();
            console.log('Product cursor closed.');
        }
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('Database disconnected.');
        } else {
            console.log('Database already disconnected or connection failed.');
        }

        // --- Exit Code ---
        if (errorCount > 0) {
            console.warn(`\nLinking completed with ${errorCount} errors. Please review logs carefully.`);
            process.exit(1);
        } else {
            console.log("\nLinking completed successfully.");
            process.exit(0);
        }
    }
}

// --- Run the Migration ---
runMigration();
