// populateProductVariantsRefs.js
// PURPOSE: Finds all Variants related to a Product and populates the
// Product.variants array with the ObjectIds of those Variants.
// PREREQUISITE: Assumes variants have already been migrated to a separate
//              'variants' collection and the old embedded 'variants' array
//              has been removed from the 'products' collection.

require('dotenv').config();
const mongoose = require('mongoose');
// Use the NEW Product model definition (with the variants array of Refs)
const { Product } = require('../models/product'); // Adjust path if needed
const Variant = require('../models/variant');   // Adjust path if needed

// --- Configuration ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI not found in .env file.");
    process.exit(1);
}
const BATCH_SIZE = 100; // Process products in batches

// --- Main Migration Logic ---
async function populateRefs() {
    let connection;
    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    try {
        console.log('Connecting to database...');
        connection = await mongoose.connect(MONGODB_URI);
        console.log('Database connected.');

        console.log('Starting population of Product.variants with Variant references...');

        // Find all products (or filter if needed, e.g., based on whether 'variants' field exists/is empty)
        // Using a cursor is good practice
        const productCursor = Product.find({
            // Optional filter: only process products where variants array doesn't exist or is empty?
            // $or: [ { variants: { $exists: false } }, { variants: { $eq: [] } } ]
        }).select('_id name').cursor({ batchSize: BATCH_SIZE }); // Select only necessary fields

        console.log('Processing products...');

        await productCursor.eachAsync(async (product) => {
            processedCount++;
            console.log(`\nProcessing Product ID: ${product._id} (Name: ${product.name})`);

            try {
                // Find all Variant documents that reference this product
                const relatedVariants = await Variant.find({ product: product._id })
                    .select('_id') // Only fetch the _id field
                    .lean();       // Use lean for performance

                // Extract just the ObjectIds
                const variantIds = relatedVariants.map(v => v._id);

                if (variantIds.length > 0) {
                    console.log(`  -> Found ${variantIds.length} related variants. Updating product...`);

                    // Update the product document to set the variants array
                    const updateResult = await Product.updateOne(
                        { _id: product._id },
                        { $set: { variants: variantIds } } // Set the array of ObjectIds
                    );

                    if (updateResult.modifiedCount > 0) {
                        console.log(`  -> Successfully updated Product ${product._id} with variant references.`);
                        updatedCount++;
                    } else if (updateResult.matchedCount > 0) {
                        console.log(`  -> Product ${product._id} already had the correct variant references (or no change needed).`);
                        // Count this as success for summary? Maybe not 'updated' but 'processed'.
                    } else {
                        console.warn(`  -> Product ${product._id} was matched but not modified. Check data.`);
                    }
                } else {
                    console.log(`  -> No related variants found for Product ${product._id}. Skipping update.`);
                    // Optionally ensure the variants array is empty if it exists
                    // await Product.updateOne({ _id: product._id }, { $set: { variants: [] } });
                }

            } catch (updateError) {
                console.error(`  -> FAILED to process Product ${product._id}:`, updateError);
                errorCount++;
            }
        }); // End cursor loop

        console.log('\n--- Population Summary ---');
        console.log(`Total products processed: ${processedCount}`);
        console.log(`Products updated with variant references: ${updatedCount}`);
        console.log(`Products failed during processing: ${errorCount}`);
        console.log('--------------------------');
        console.log('Reference population script finished.');

    } catch (error) {
        console.error('\n!!! Critical error during script execution !!!:', error);
        errorCount++;
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('Database disconnected.');
        }
        if (errorCount > 0) {
            console.warn(`\nScript completed with ${errorCount} errors. Please review logs.`);
            process.exit(1);
        } else {
            console.log("\nScript completed successfully.");
            process.exit(0);
        }
    }
}

// --- Run the script ---
populateRefs();