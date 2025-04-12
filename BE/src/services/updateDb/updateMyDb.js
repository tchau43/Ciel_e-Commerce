// scripts/migrateAndCleanupCategoriesBrands.js
require('dotenv').config(); // Load environment variables FIRST

const mongoose = require('mongoose');
// Corrected Imports: Assuming standard exports from model files
const { Product } = require('../../models/product');     // Adjust path as needed
const Brand = require('../../models/brand');         // Adjust path as needed
const Category = require('../../models/category');   // Adjust path as needed

async function migrateAndCleanupCategoriesBrands() {
    // --- 1. Connect to MongoDB ---
    if (!process.env.MONGO_DB_URL) {
        console.error("Error: MONGO_DB_URL environment variable is not set.");
        process.exit(1);
    }
    try {
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(process.env.MONGO_DB_URL); // No deprecated options needed
        console.log('Successfully connected to MongoDB.');
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }

    // --- 2. Perform Migration ---
    let productsProcessed = 0;
    let productsUpdated = 0;
    let categoriesCreated = 0;
    let brandsCreated = 0;
    let productsSkipped = 0;

    try {
        // Find products missing ObjectIds OR having the old string names.
        const productsToMigrate = await Product.find({
            $or: [
                { category: { $exists: false } }, { category: null },
                { brand: { $exists: false } }, { brand: null },
                { category_name: { $exists: true, $ne: null, $ne: "" } },
                { brand_name: { $exists: true, $ne: null, $ne: "" } }
            ],
            $and: [
                { $or: [{ category_name: { $exists: true, $ne: null, $ne: "" } }, { brand_name: { $exists: true, $ne: null, $ne: "" } }] }
            ]
        }).lean();

        console.log(`Found ${productsToMigrate.length} products potentially needing category/brand migration.`);

        if (productsToMigrate.length > 0) {
            // Process each product found
            for (const product of productsToMigrate) {
                productsProcessed++;
                let categoryDocToUse = null;
                let brandDocToUse = null;
                let skipProductUpdate = false;

                console.log(`\n--- Processing Product ID: ${product._id} (${product.name?.substring(0, 30)}...) ---`);

                // --- Handle Category (Required) ---
                const currentCategoryName = product.category_name?.trim();
                if (!currentCategoryName) {
                    if (product.category instanceof mongoose.Types.ObjectId) {
                        console.log(`[INFO_CAT] Category already ObjectId. Using existing.`);
                        categoryDocToUse = { _id: product.category };
                    } else {
                        console.warn(`[SKIP] Product ID ${product._id}: Missing category_name and field not ObjectId. Required.`);
                        productsSkipped++;
                        continue;
                    }
                } else {
                    try {
                        categoryDocToUse = await Category.findOne({ name: currentCategoryName });
                        if (!categoryDocToUse) {
                            console.log(`[CREATE_CAT] '${currentCategoryName}' not found. Creating...`);
                            try {
                                categoryDocToUse = await Category.create({ name: currentCategoryName });
                                categoriesCreated++;
                                console.log(`[CREATED_CAT] OK '${categoryDocToUse.name}' (${categoryDocToUse._id})`);
                            } catch (catCreationError) {
                                console.error(`[FAILED_CREATE_CAT] '${currentCategoryName}':`, catCreationError.message);
                                categoryDocToUse = await Category.findOne({ name: currentCategoryName }); // Retry find
                                if (!categoryDocToUse) {
                                    console.error(`[SKIP] Product ID ${product._id}: REQUIRED category creation failed.`);
                                    productsSkipped++; skipProductUpdate = true;
                                } else { console.log(`[FOUND_CAT_AFTER_FAIL] OK '${categoryDocToUse.name}'`); }
                            }
                        } else { console.log(`[FOUND_CAT] OK '${categoryDocToUse.name}' (${categoryDocToUse._id})`); }
                    } catch (catError) {
                        console.error(`[ERROR_CAT] '${currentCategoryName}':`, catError);
                        productsSkipped++; skipProductUpdate = true;
                    }
                }

                if (skipProductUpdate) continue;

                // --- Handle Brand (Optional field, but process if name exists) ---
                const currentBrandName = product.brand_name?.trim();
                if (!currentBrandName) {
                    if (product.brand instanceof mongoose.Types.ObjectId) {
                        console.log(`[INFO_BRAND] Brand already ObjectId. Using existing.`);
                        brandDocToUse = { _id: product.brand };
                    } else { console.log(`[SKIP_BRAND] No brand_name. Skipping brand processing.`); }
                } else {
                    try {
                        brandDocToUse = await Brand.findOne({ name: currentBrandName });
                        if (!brandDocToUse) {
                            console.log(`[CREATE_BRAND] '${currentBrandName}' not found. Creating...`);
                            try {
                                brandDocToUse = await Brand.create({ name: currentBrandName });
                                brandsCreated++;
                                console.log(`[CREATED_BRAND] OK '${brandDocToUse.name}' (${brandDocToUse._id})`);
                            } catch (brandCreationError) {
                                console.error(`[FAILED_CREATE_BRAND] '${currentBrandName}':`, brandCreationError.message);
                                brandDocToUse = await Brand.findOne({ name: currentBrandName }); // Retry find
                                if (!brandDocToUse) { console.warn(`[WARN_BRAND] Proceeding without brand update due to creation failure.`); }
                                else { console.log(`[FOUND_BRAND_AFTER_FAIL] OK '${brandDocToUse.name}'`); }
                            }
                        } else { console.log(`[FOUND_BRAND] OK '${brandDocToUse.name}' (${brandDocToUse._id})`); }
                    } catch (brandError) { console.error(`[ERROR_BRAND] '${currentBrandName}':`, brandError); }
                }

                // --- Update Product Document ---
                if (!categoryDocToUse?._id) {
                    console.error(`[INTERNAL ERROR] Product ID ${product._id}: No valid category ID. Skipping update.`);
                    productsSkipped++; continue;
                }

                try {
                    const updateSet = { category: categoryDocToUse._id };
                    const updateUnset = {};
                    if (product.category_name) updateUnset.category_name = "";
                    if (brandDocToUse?._id) {
                        updateSet.brand = brandDocToUse._id;
                        if (product.brand_name) updateUnset.brand_name = "";
                    } else if (product.brand_name) { updateUnset.brand_name = ""; }

                    const changesExist = (product.category?.toString() !== categoryDocToUse._id.toString()) ||
                        (product.brand?.toString() !== brandDocToUse?._id?.toString()) ||
                        (product.category_name) ||
                        (product.brand_name && updateUnset.brand_name !== undefined);

                    if (!changesExist) {
                        console.log(`[NO CHANGE] Product ${product._id} already up-to-date.`);
                        continue;
                    }

                    console.log(`[UPDATE] Product ID ${product._id}: $set: ${JSON.stringify(updateSet)}, $unset: ${JSON.stringify(updateUnset)}`);
                    const updateResult = await Product.updateOne({ _id: product._id }, { $set: updateSet, $unset: updateUnset });

                    if (updateResult.modifiedCount > 0) {
                        productsUpdated++; console.log(`[OK] Product ${product._id} updated.`);
                    } else if (updateResult.matchedCount > 0) { console.log(`[NO CHANGE NEEDED] Product ${product._id} matched but required no modification.`); }
                    else { console.warn(`[WARN] Product ${product._id} not found during update.`); productsSkipped++; }

                } catch (updateError) {
                    console.error(`[ERROR_UPDATE] Product ID ${product._id}:`, updateError); productsSkipped++;
                }
            } // End of for loop
        } else {
            console.log("No products found needing individual migration updates.");
        }

        // --- 3. Final Cleanup Step ---
        console.log('\n--- Starting Final Cleanup Phase ---');
        console.log('Attempting to remove any remaining category_name or brand_name fields from ALL products...');

        try {
            const cleanupResult = await Product.updateMany(
                { // Filter: Find documents that still have either field
                    $or: [
                        { category_name: { $exists: true } },
                        { brand_name: { $exists: true } }
                    ]
                },
                { // Update: Remove both fields if they exist
                    $unset: {
                        category_name: "",
                        brand_name: ""
                    }
                }
            );

            console.log(`[CLEANUP] Finished.`);
            console.log(`[CLEANUP] Matched ${cleanupResult.matchedCount} documents potentially having old fields.`);
            console.log(`[CLEANUP] Removed fields from ${cleanupResult.modifiedCount} documents in cleanup.`);

        } catch (cleanupError) {
            console.error('[CLEANUP ERROR] Failed to execute final cleanup update:', cleanupError);
            // Continue to summary despite cleanup error
        }

        // --- 4. Summary ---
        console.log('---------------------------------------------');
        console.log('Category & Brand Migration Summary:');
        console.log(`- Products Processed (individually): ${productsProcessed}`);
        console.log(`- Products Successfully Updated:     ${productsUpdated}`);
        console.log(`- New Categories Created:          ${categoriesCreated}`);
        console.log(`- New Brands Created:              ${brandsCreated}`);
        console.log(`- Products Skipped/Failed:         ${productsSkipped}`);
        console.log('---------------------------------------------');

    } catch (error) { // Catch fatal errors during the overall migration process
        console.error('FATAL ERROR during migration operations:', error);
    } finally {
        // --- 5. Disconnect from MongoDB ---
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

// --- Run the Migration ---
console.log("Starting category & brand migration & cleanup script (with auto-create)...");
migrateAndCleanupCategoriesBrands().catch(err => {
    console.error("Unhandled error executing migration script:", err);
    mongoose.disconnect(); // Ensure disconnect even on unhandled errors
    process.exit(1);
});
// --- Minimal Product Model Definition (for this script) ---
// We need a model to interact with the collection.
// Define at least the collection name. Using 'strict: false' is helpful
// here as we don't care about the full schema, just removing fields.
const productSchemaMinimal = new mongoose.Schema({}, {
    strict: false, // Allows interaction even if fields aren't defined here
    collection: 'products' // Explicitly specify the collection name
});
const Product = mongoose.model('ProductMinimal', productSchemaMinimal); // Use a unique model name for this script if needed

// --- Main Async Function ---
async function removeOldProductFields() {
    // 1. Connect to MongoDB
    if (!process.env.MONGO_DB_URL) {
        console.error("Error: MONGO_DB_URL environment variable is not set.");
        process.exit(1);
    }
    try {
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log('Successfully connected to MongoDB.');
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if connection fails
    }

    // 2. Perform the Field Removal
    console.log('\nAttempting to remove category_name and brand_name fields from ALL products...');
    try {
        const cleanupResult = await Product.updateMany(
            { // Filter: Find documents that have EITHER field present
                // No filter is needed if you want to apply to ALL documents regardless
                // But filtering for existence is slightly safer/more targeted
                $or: [
                    { category_name: { $exists: true } },
                    { brand_name: { $exists: true } }
                ]
            },
            { // Update: Use $unset to remove both fields
                $unset: {
                    category_name: "", // The value "" is arbitrary for $unset
                    brand_name: ""
                }
            }
            // { multi: true } // Not needed for updateMany, it applies to all matches by default
        );

        console.log(`\n--- Cleanup Results ---`);
        console.log(`- Matched ${cleanupResult.matchedCount} documents potentially having old fields.`);
        console.log(`- Fields removed from ${cleanupResult.modifiedCount} documents.`);
        if (cleanupResult.acknowledged) {
            console.log("- Operation acknowledged by the server.");
        } else {
            console.warn("- Operation NOT acknowledged by the server.");
        }


    } catch (error) {
        console.error('\nERROR during field removal operation:', error);
        // Decide if you want to exit on error or just log it before disconnecting
    } finally {
        // 3. Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
    }
}

// --- Warnings and Execution ---
console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
console.log("!!! WARNING: This script will permanently delete fields! !!!");
console.log("!!! Make sure you have a backup of your 'products' collection! !!!");
console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
// Optional: Add a small delay or prompt before running
// setTimeout(() => {
console.log("Starting field removal script...");
removeOldProductFields().catch(err => {
    console.error("Unhandled error executing script:", err);
    mongoose.disconnect(); // Ensure disconnect even on unhandled errors
    process.exit(1);
});
// }, 3000); // Example 3-second delay