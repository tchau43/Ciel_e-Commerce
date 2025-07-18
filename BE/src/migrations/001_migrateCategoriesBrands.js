require('dotenv').config(); 
const mongoose = require('mongoose');
const { Product } = require('../models/product'); 
const Category = require('../models/category'); 
const Brand = require('../models/brand'); 

async function migrateAndCleanProducts() {
    console.log("!!! IMPORTANT !!!");
    console.log("!!! Backup your database BEFORE running this script. !!!");
    console.log("--- This script will migrate category/brand references AND force remove old fields ---");
    console.log("------------------------------------------------------------------------------------");
    console.log("Starting combined migration and cleanup script...");

    try {
        console.log(`Connecting to MongoDB at ${process.env.MONGODB_URI}...`);
        connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully.");

        console.log("\n--- Phase 1: Migrating References ---");

        const productsToMigrate = await Product.find({
            $or: [
                { category_name: { $exists: true, $ne: null } },
                { brand_name: { $exists: true, $ne: null } },
            ],
        }).lean();

        console.log(`Found ${productsToMigrate.length} products potentially needing reference migration.`);

        let migratedCount = 0;
        const batchSize = 50;
        const totalProducts = productsToMigrate.length;

        for (let i = 0; i < totalProducts; i += batchSize) {
            const batch = productsToMigrate.slice(i, i + batchSize);
            const promises = batch.map(async (product) => {
                try {
                    const updateOps = { $set: {}, $unset: {} };
                    let categoryId = null;
                    let brandId = null;

                    if (product.category_name) {
                        const categoryNameUpper = product.category_name.toUpperCase().trim();
                        if (categoryNameUpper) {
                            const categoryDoc = await Category.findOneAndUpdate(
                                { name: categoryNameUpper },
                                { $setOnInsert: { name: categoryNameUpper } },
                                { upsert: true, new: true, lean: true }
                            );
                            categoryId = categoryDoc._id;
                            updateOps.$set.category = categoryId;
                        } else {
                            console.warn(`Product ${product._id}: Empty category_name found. Will be removed in cleanup phase.`);
                        }
                        updateOps.$unset.category_name = "";
                    }
                    if (product.brand_name) {
                        const brandNameUpper = product.brand_name.toUpperCase().trim();
                        if (brandNameUpper) {
                            const brandDoc = await Brand.findOneAndUpdate(
                                { name: brandNameUpper },
                                { $setOnInsert: { name: brandNameUpper } },
                                { upsert: true, new: true, lean: true }
                            );
                            brandId = brandDoc._id;
                            updateOps.$set.brand = brandId;
                        } else {
                            console.warn(`Product ${product._id}: Empty brand_name found. Will be removed in cleanup phase.`);
                        }
                        
                        updateOps.$unset.brand_name = "";
                    }

                    if (Object.keys(updateOps.$set).length === 0) delete updateOps.$set;
                    
                    if (product.category_name && updateOps.$unset.category_name === undefined) updateOps.$unset.category_name = "";
                    if (product.brand_name && updateOps.$unset.brand_name === undefined) updateOps.$unset.brand_name = "";
                    if (Object.keys(updateOps.$unset).length === 0) delete updateOps.$unset;

                    if (updateOps.$set || updateOps.$unset) {
                        
                        await Product.updateOne({ _id: product._id }, updateOps);
                        return true;
                    }
                    return false; 
                } catch (error) {
                    console.error(`Error processing product ${product._id} in Phase 1:`, error);
                    return false; 
                }
            });

            const results = await Promise.all(promises);
            migratedCount += results.filter(Boolean).length;
            console.log(`Processed batch ${Math.ceil((i + batchSize) / batchSize)}/${Math.ceil(totalProducts / batchSize)}. Total updated in Phase 1 so far: ${migratedCount}`);
        }
        console.log(`--- Phase 1 Finished: ${migratedCount} products had references updated/fields marked for unsetting. ---`);

        console.log("\n--- Phase 2: Force Removing Old Fields ---");

        const cleanupUpdateOperation = {
            $unset: {
                category_name: "",
                brand_name: ""
            }
        };

        const cleanupFilter = {
            $or: [
                { category_name: { $exists: true } },
                { brand_name: { $exists: true } }
            ]
        };

        console.log("Executing updateMany to ensure all old fields are removed...");
        const cleanupResult = await Product.updateMany(cleanupFilter, cleanupUpdateOperation, { strict: false });

        console.log('Cleanup operation result:');
        console.log(`- Documents matched by cleanup filter: ${cleanupResult.matchedCount}`);
        console.log(`- Documents modified by cleanup: ${cleanupResult.modifiedCount}`);
        console.log("--- Phase 2 Finished: Old fields removed where they existed. ---");
        console.log("\n----------------------------------------------------------");
        console.log("Combined migration and cleanup finished successfully.");
        console.log(`Phase 1: ${migratedCount} products updated with references.`);
        console.log(`Phase 2: ${cleanupResult.modifiedCount} documents had old fields definitively removed.`);
        console.log("----------------------------------------------------------");

    } catch (error) {
        console.error("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("Script failed during execution:", error);
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    } finally {
        
        if (mongoose.connection?.readyState === 1) { 
            await mongoose.disconnect();
            console.log("\nMongoDB disconnected.");
        } else {
            console.log("\nMongoDB connection already closed or not established.");
        }
    }
}

migrateAndCleanProducts();