//node ./src/migrations/002_migrateVariants.js
require('dotenv').config();
const mongoose = require('mongoose');
// Ensure these paths correctly point to your model files
const { Product } = require('../models/product'); // Uses the Product model (even the new definition should work for $unset)
const Variant = require('../models/variant');   // Uses the NEW Variant model

// --- Configuration ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI not found in .env file.");
    process.exit(1);
}
const BATCH_SIZE = 50;

// --- Main Migration Logic ---
async function runMigration() {
    let connection;
    let processedCount = 0;
    let migratedCount = 0;
    let errorCount = 0;

    try {
        console.log('Connecting to database...');
        connection = await mongoose.connect(MONGODB_URI);
        console.log('Database connected.');

        // --- Define a TEMPORARY Schema reflecting the OLD structure JUST FOR READING ---
        // Include only the fields needed for the migration query and processing
        const oldProductSchemaForRead = new mongoose.Schema({
            name: String, // For logging
            variants: [{ // Include the embedded variants array structure
                // We don't strictly need to define _id, types, price, stock here,
                // just that 'variants' is an array of objects. Mongoose is flexible.
                // Defining it loosely as Array works.
                types: String,
                price: Number,
                stock: Number,
                // Add other fields that were in the embedded variant if needed for mapping
            }]
        }, {
            strict: false, // Allow fields not defined here to be loaded (like _id)
            collection: 'products' // Explicitly use the 'products' collection
        });
        // Create a temporary model using the existing 'products' collection
        const ProductModelForRead = mongoose.model('Product_OldStructure', oldProductSchemaForRead);
        // --- End Temporary Schema Definition ---


        console.log('Starting variant migration...');

        // Find products using the TEMPORARY model that includes the variants field definition
        const productCursor = ProductModelForRead.find({
            variants: { $exists: true, $ne: [] } // Query still works the same way at DB level
        }).cursor({ batchSize: BATCH_SIZE });

        console.log('Processing products with embedded variants...');

        await productCursor.eachAsync(async (product) => { // 'product' here is based on ProductModelForRead
            processedCount++;
            console.log(`\nProcessing Product ID: ${product._id} (Name: ${product.name})`);

            // Now, product.variants should be populated correctly because ProductModelForRead defines it
            if (!product.variants || product.variants.length === 0) {
                // This check should ideally NOT be hit now if the query is correct,
                // but keeping it as a safeguard against truly empty arrays found by $ne:[].
                console.log(`  -> Product ${product._id} found by query but variants array is missing or empty after load. Skipping and attempting unset.`);
                try {
                    // Use the REAL Product model for the update operation
                    await Product.updateOne({ _id: product._id }, { $unset: { variants: "" } });
                    console.log(`  -> Successfully unset variants field for product ${product._id}.`);
                } catch (unsetError) {
                    console.error(`  -> FAILED to unset variants field for product ${product._id}:`, unsetError);
                    errorCount++;
                }
                return;
            }

            // Prepare data for the new Variant documents
            const variantsToCreate = product.variants.map(embVariant => {
                // Let Mongoose generate new _ids for the Variant documents.
                return {
                    product: product._id,
                    types: embVariant.types,
                    price: embVariant.price,
                    stock: embVariant.stock,
                };
            }).filter(v => v.types && v.price !== undefined && v.stock !== undefined);

            if (variantsToCreate.length === 0) {
                console.log(`  -> No valid variant data found to migrate for product ${product._id}. Unsetting variants field.`);
                try {
                    await Product.updateOne({ _id: product._id }, { $unset: { variants: "" } });
                    console.log(`  -> Successfully unset empty/invalid variants field for product ${product._id}.`);
                } catch (unsetError) {
                    console.error(`  -> FAILED to unset variants field for product ${product._id}:`, unsetError);
                    errorCount++;
                }
                return;
            }

            console.log(`  -> Preparing to create ${variantsToCreate.length} variant documents...`);

            // Optional: Transactions
            // const session = await mongoose.startSession();
            // session.startTransaction();

            try {
                // Use the REAL Variant model to create new documents
                const createdVariants = await Variant.insertMany(variantsToCreate, { /* session */ });
                console.log(`  -> Successfully created ${createdVariants.length} documents in 'variants' collection.`);

                // Use the REAL Product model to perform the update ($unset)
                await Product.updateOne({ _id: product._id }, { $unset: { variants: "" } }, { /* session */ });
                console.log(`  -> Successfully removed 'variants' array from Product ${product._id}.`);

                // await session.commitTransaction();
                migratedCount++;

            } catch (migrationError) {
                // await session.abortTransaction();
                console.error(`  -> FAILED migration step for Product ${product._id}:`, migrationError);
                errorCount++;
            } finally {
                // session.endSession();
            }
        }); // End cursor loop

        // ... (Rest of the summary logging and disconnect logic remains the same) ...
        console.log('\n--- Migration Summary ---');
        console.log(`Total products checked (matched query): ${processedCount}`); // Changed label slightly
        console.log(`Products successfully migrated (variants created + field unset): ${migratedCount}`);
        console.log(`Products failed during migration step: ${errorCount}`);
        console.log('-------------------------');
        console.log('Variant migration script finished.');

    } catch (error) {
        console.error('\n!!! Critical error during migration setup or processing !!!:', error);
        errorCount++;
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('Database disconnected.');
        }
        if (errorCount > 0) {
            console.warn(`\nMigration completed with ${errorCount} errors. Please review logs carefully.`);
            process.exit(1);
        } else if (processedCount === 0 && migratedCount === 0) {
            console.log("\nNo products with embedded variants found needing migration (or already migrated).")
            process.exit(0);
        }
        else {
            console.log("\nMigration completed successfully.");
            process.exit(0);
        }
    }
}

// --- Run the Migration ---
runMigration();