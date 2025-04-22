// node ./src/migrations/002_upsertVariants.js
require('dotenv').config();
const mongoose = require('mongoose');
// Ensure these paths correctly point to your model files
const { Product } = require('../models/product'); // Used for final update ($unset)
const Variant = require('../models/variant');   // Used for finding/creating new variants

// --- Configuration ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI not found in .env file.");
    process.exit(1);
}

// --- Main Migration Logic ---
async function runMigration() {
    console.log("!!! IMPORTANT !!!");
    console.log("!!! Backup your database BEFORE running this script. !!!");
    console.log("--- Migrating/Upserting variants sequentially to separate collection ---");
    console.log("--- Checking existing variants by Product ID and 'types' field ---");
    console.log("--------------------------------------------------------------------");

    // Optional: Confirmation Step
    const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    await new Promise(resolve => {
        readline.question('Type YES to confirm and start the variant upsert migration: ', (answer) => {
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
    let migratedProductCount = 0;
    let variantUpsertCount = 0;
    let errorCount = 0;
    let cursor;

    try {
        console.log('Connecting to database...');
        connection = await mongoose.connect(MONGODB_URI);
        console.log('Database connected.');

        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        console.log('Starting variant migration/upsert...');

        const filter = {
            variants: { $exists: true, $ne: [], $type: "array" }
        };

        cursor = productsCollection.find(filter, { projection: { _id: 1, name: 1, variants: 1 } });

        console.log('Processing products with embedded variants...');

        while (await cursor.hasNext()) {
            const product = await cursor.next();
            processedProductCount++;
            let productErrorOccurred = false;
            console.log(`\nProcessing Product ID: ${product._id} (Name: ${product.name})`);

            if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
                console.log(`  -> Product ${product._id} variants array missing/invalid after load. Attempting unset only.`);
                try {
                    await Product.updateOne({ _id: product._id }, { $unset: { variants: "" } });
                    console.log(`  -> Successfully unset variants field for product ${product._id}.`);
                } catch (unsetError) {
                    console.error(`  -> FAILED to unset variants field for product ${product._id}:`, unsetError);
                    errorCount++;
                }
                continue;
            }

            // --- Transaction Block for each Product ---
            const session = await mongoose.startSession();
            try {
                let productUpsertCount = 0;
                await session.withTransaction(async () => {
                    console.log(`  -> Processing ${product.variants.length} embedded variants for Product ${product._id} sequentially...`);

                    const processedTypes = new Set();

                    // *** CHANGE: Process variants sequentially using for...of and await ***
                    for (const embVariant of product.variants) {
                        if (!embVariant || typeof embVariant.types !== 'string' || !embVariant.types.trim() || typeof embVariant.price !== 'number') {
                            console.warn(`   -> Skipping invalid embedded variant data inside Product ${product._id}:`, embVariant);
                            continue;
                        }

                        const variantTypes = embVariant.types.trim();

                        if (processedTypes.has(variantTypes)) {
                            console.log(`   -> Skipping duplicate embedded type "${variantTypes}" for Product ${product._id}.`);
                            continue;
                        }

                        const variantFilter = { product: product._id, types: variantTypes };
                        const variantUpdate = {
                            $set: { price: embVariant.price },
                            $setOnInsert: { product: product._id, types: variantTypes, stock: 0 }
                        };
                        const options = {
                            upsert: true, new: true, runValidators: true,
                            setDefaultsOnInsert: true, session
                        };

                        // *** CHANGE: Await each operation directly ***
                        try {
                            const result = await Variant.findOneAndUpdate(variantFilter, variantUpdate, options);
                            if (result) {
                                productUpsertCount++;
                                // console.log(`    -> Upserted variant type "${variantTypes}"`); // Optional log
                            } else {
                                console.error(`    -> Failed to upsert variant type "${variantTypes}" (Result was null/undefined)`);
                                throw new Error(`Upsert failed for type "${variantTypes}"`);
                            }
                        } catch (err) {
                            console.error(`    -> Error during findOneAndUpdate for type "${variantTypes}", Product ${product._id}:`, err);
                            throw err; // Re-throw to abort transaction
                        }

                        processedTypes.add(variantTypes);
                    } // *** End sequential for...of loop ***

                    console.log(`   -> Completed ${productUpsertCount} variant upserts for Product ${product._id}.`);

                    // *** If all variant upserts succeeded, remove the old array from the product ***
                    const unsetResult = await Product.updateOne(
                        { _id: product._id },
                        { $unset: { variants: "" } },
                        { session }
                    );

                    if (unsetResult.modifiedCount !== 1) {
                        throw new Error(`Product ${product._id} was not updated to remove variants array (modifiedCount: ${unsetResult.modifiedCount}).`);
                    }
                    console.log(`   -> Successfully removed 'variants' array from Product ${product._id}.`);

                }); // End transaction block

                // If transaction succeeded for this product
                migratedProductCount++;
                variantUpsertCount += productUpsertCount;

            } catch (migrationError) {
                // If transaction failed for this product
                console.error(`  -> FAILED migration transaction for Product ${product._id}:`, migrationError.message); // Log only message for cleaner output maybe
                errorCount++;
                productErrorOccurred = true;
            } finally {
                await session.endSession();
            }
            // --- End Transaction Block ---

        } // End while loop for products

        console.log('\n--- Migration Summary ---');
        console.log(`Total products checked (matched query): ${processedProductCount}`);
        console.log(`Products successfully migrated (variants upserted + field unset): ${migratedProductCount}`);
        console.log(`Total variant documents upserted: ${variantUpsertCount}`);
        console.log(`Products failed during migration transaction: ${errorCount}`);
        console.log('-------------------------');
        console.log('Variant migration/upsert script finished.');

    } catch (error) {
        console.error('\n!!! Critical error during migration setup or processing !!!:', error);
        errorCount++;
    } finally {
        if (cursor) {
            await cursor.close();
            console.log('Native cursor closed.');
        }
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('Database disconnected.');
        } else {
            console.log('Database already disconnected or connection failed.');
        }

        // --- Exit Code ---
        if (errorCount > 0) {
            console.warn(`\nMigration completed with ${errorCount} errors. Please review logs carefully.`);
            process.exit(1);
        } else if (processedProductCount === 0 && migratedProductCount === 0) {
            console.log("\nNo products with embedded variants found needing migration (or already migrated).")
            process.exit(0);
        } else {
            console.log("\nMigration completed successfully.");
            process.exit(0);
        }
    }
}

// --- Run the Migration ---
runMigration();
