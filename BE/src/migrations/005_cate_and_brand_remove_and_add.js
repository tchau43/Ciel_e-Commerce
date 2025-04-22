// scripts/migrateAndCleanupCategoriesBrands.js
require('dotenv').config(); // Load environment variables FIRST

const mongoose = require('mongoose');
const Category = require('../models/category');
const { Product } = require('../models/product');
const Brand = require('../models/brand');
// Corrected Imports: Assuming standard exports from model files
// *** NHỚ ĐIỀU CHỈNH ĐƯỜNG DẪN import CHO ĐÚNG VỚI CẤU TRÚC PROJECT CỦA BẠN ***

async function migrateAndCleanupCategoriesBrands() {
    // --- 1. Connect to MongoDB ---
    if (!process.env.MONGODB_URI) {
        console.error("Error: MONGODB_URI environment variable is not set.");
        process.exit(1);
    }
    try {
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(process.env.MONGODB_URI); // No deprecated options needed
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
        // AND specifically target those that actually HAVE old names to process
        const productsToMigrate = await Product.find({
            $and: [
                { // Condition 1: Product is missing ObjectId refs OR has old string names
                    $or: [
                        { category: { $exists: false } }, { category: null },
                        { brand: { $exists: false } }, { brand: null },
                        { category_name: { $exists: true, $ne: null, $ne: "" } },
                        { brand_name: { $exists: true, $ne: null, $ne: "" } }
                    ]
                },
                { // Condition 2: Product MUST have at least one of the old names present to be selected for individual processing
                    $or: [
                        { category_name: { $exists: true, $ne: null, $ne: "" } },
                        { brand_name: { $exists: true, $ne: null, $ne: "" } }
                    ]
                }
            ]
        }).lean(); // Using lean for potentially large datasets, but update needs _id

        console.log(`Found ${productsToMigrate.length} products potentially needing category/brand migration based on old fields.`);

        if (productsToMigrate.length > 0) {
            // Process each product found
            for (const product of productsToMigrate) {
                productsProcessed++;
                let categoryDocToUse = null;
                let brandDocToUse = null;
                let skipProductUpdate = false; // Flag to skip update if critical step fails

                console.log(`\n--- Processing Product ID: ${product._id} (${product.name?.substring(0, 30)}...) ---`);

                // --- Handle Category (Required) ---
                const currentCategoryName = product.category_name?.trim();
                if (!currentCategoryName) {
                    // If no category_name, check if category field already has a valid ObjectId
                    if (product.category instanceof mongoose.Types.ObjectId) {
                        console.log(`[INFO_CAT] No category_name, but 'category' field is already an ObjectId. Using existing.`);
                        categoryDocToUse = { _id: product.category }; // Simulate doc structure needed later
                    } else {
                        console.warn(`[SKIP] Product ID ${product._id}: Missing category_name and 'category' field is not a valid ObjectId. Category is required.`);
                        productsSkipped++;
                        continue; // Skip this product
                    }
                } else {
                    // category_name exists, find or create Category document
                    try {
                        categoryDocToUse = await Category.findOne({ name: currentCategoryName });
                        if (!categoryDocToUse) {
                            console.log(`[CREATE_CAT] '${currentCategoryName}' not found. Creating...`);
                            try {
                                categoryDocToUse = await Category.create({ name: currentCategoryName });
                                categoriesCreated++;
                                console.log(`[CREATED_CAT] OK '${categoryDocToUse.name}' (${categoryDocToUse._id})`);
                            } catch (catCreationError) {
                                // Handle potential race condition if another process created it between findOne and create
                                console.error(`[FAILED_CREATE_CAT] '${currentCategoryName}':`, catCreationError.message);
                                categoryDocToUse = await Category.findOne({ name: currentCategoryName }); // Retry find
                                if (!categoryDocToUse) {
                                    console.error(`[SKIP] Product ID ${product._id}: REQUIRED category creation failed even after retry.`);
                                    productsSkipped++; skipProductUpdate = true;
                                } else { console.log(`[FOUND_CAT_AFTER_FAIL] OK '${categoryDocToUse.name}'`); }
                            }
                        } else { console.log(`[FOUND_CAT] OK '${categoryDocToUse.name}' (${categoryDocToUse._id})`); }
                    } catch (catError) {
                        console.error(`[ERROR_CAT] Finding/Handling category '${currentCategoryName}':`, catError);
                        productsSkipped++; skipProductUpdate = true;
                    }
                }

                if (skipProductUpdate) continue; // Skip to next product if category handling failed

                // --- Handle Brand (Optional field, but process if name exists) ---
                const currentBrandName = product.brand_name?.trim();
                if (!currentBrandName) {
                    // If no brand_name, check if brand field already has a valid ObjectId
                    if (product.brand instanceof mongoose.Types.ObjectId) {
                        console.log(`[INFO_BRAND] No brand_name, but 'brand' field is already an ObjectId. Using existing.`);
                        brandDocToUse = { _id: product.brand }; // Simulate doc structure
                    } else { console.log(`[SKIP_BRAND] No brand_name and 'brand' is not ObjectId. Skipping brand processing.`); }
                } else {
                    // brand_name exists, find or create Brand document
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
                    } catch (brandError) { console.error(`[ERROR_BRAND] Finding/Handling brand '${currentBrandName}':`, brandError); }
                }

                // --- Update Product Document ---
                // Ensure we have a valid category ID before proceeding
                if (!categoryDocToUse?._id) {
                    console.error(`[INTERNAL ERROR] Product ID ${product._id}: No valid category ID determined after processing. Skipping update.`);
                    productsSkipped++; continue;
                }

                try {
                    const updateSet = { category: categoryDocToUse._id };
                    const updateUnset = {};

                    // Always unset category_name if it existed in the original product data
                    if (product.category_name) updateUnset.category_name = "";

                    // Set brand ObjectId if found/created, and unset brand_name if it existed
                    if (brandDocToUse?._id) {
                        updateSet.brand = brandDocToUse._id;
                        if (product.brand_name) updateUnset.brand_name = "";
                    } else if (product.brand_name) {
                        // If we didn't get a brand ObjectId (e.g., creation failed),
                        // but the old brand_name exists, still unset the old name.
                        updateUnset.brand_name = "";
                    }

                    // Determine if an update is actually needed
                    let changesExist = false;
                    if (product.category?.toString() !== categoryDocToUse._id.toString()) changesExist = true;
                    if (product.brand?.toString() !== brandDocToUse?._id?.toString()) changesExist = true; // Compare even if brandDocToUse is null/undefined
                    if (product.category_name && updateUnset.category_name !== undefined) changesExist = true;
                    if (product.brand_name && updateUnset.brand_name !== undefined) changesExist = true;


                    if (!changesExist) {
                        console.log(`[NO CHANGE] Product ${product._id} already appears up-to-date regarding category/brand fields.`);
                        continue; // Skip the updateOne call
                    }

                    console.log(`[UPDATE] Product ID ${product._id}: $set: ${JSON.stringify(updateSet)}, $unset: ${JSON.stringify(updateUnset)}`);
                    const updateResult = await Product.updateOne({ _id: product._id }, { $set: updateSet, $unset: updateUnset });

                    if (updateResult.modifiedCount > 0) {
                        productsUpdated++; console.log(`[OK] Product ${product._id} updated.`);
                    } else if (updateResult.matchedCount > 0) { console.log(`[NO MODIFICATION] Product ${product._id} matched but required no changes (likely already updated).`); }
                    else { console.warn(`[WARN] Product ${product._id} not found during the final updateOne call.`); productsSkipped++; }

                } catch (updateError) {
                    console.error(`[ERROR_UPDATE] Product ID ${product._id}: Failed to update product document:`, updateError); productsSkipped++;
                }
            } // End of for loop
        } else {
            console.log("No products found needing individual migration updates based on old fields.");
        }

        // --- 3. Final Cleanup Step (Identical to removeOldFields.js) ---
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
        console.log(`- New Categories Created:            ${categoriesCreated}`);
        console.log(`- New Brands Created:                ${brandsCreated}`);
        console.log(`- Products Skipped/Failed:           ${productsSkipped}`);
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
console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
console.log("!!! WARNING: This script modifies product data permanently!     !!!");
console.log("!!! Ensure you have a DATABASE BACKUP before running this script! !!!");
console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
// Optional: Add a prompt or delay
// setTimeout(() => {
console.log("\nStarting category & brand migration & cleanup script...");
migrateAndCleanupCategoriesBrands().catch(err => {
    console.error("Unhandled error executing migration script:", err);
    mongoose.disconnect(); // Ensure disconnect even on unhandled errors
    process.exit(1);
});
// }, 5000); // Example 5-second delay