// src/services/updateDb/updateProduct.js
// Script to update ProductIndex based on Product, Category, Brand, Tags, and Variant data

const mongoose = require("mongoose");
const Category = require("../../models/category"); // Adjust path if needed
const Brand = require("../../models/brand");       // Adjust path if needed
const Variant = require("../../models/variant");   // Adjust path if needed
const { Product, ProductIndex } = require("../../models/product"); // Adjust path if needed
// const fs = require("fs").promises; // fs logic removed as it wasn't part of the request
// const path = require("path");     // path logic removed

require("dotenv").config();

// --- Connection Function ---
async function connectDB() {
  try {
    // Add connection options if needed, but defaults are often fine with newer Mongoose
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit if connection fails
  }
}

// --- Helper to process text for indexing ---
const processIndexField = (field) => {
  if (!field) return null;
  // Handle both strings and arrays of strings (like tags)
  const values = Array.isArray(field) ? field : [field];
  return values
    .map(val => String(val || "").toLowerCase().trim().replace(/\s+/g, "_")) // Convert to string, lowercase, trim, replace space with underscore
    .filter(val => val); // Remove empty strings
}

// --- Function to update product indexes ---
const updateProductIndex = async () => {
  console.log("Starting product index update (Refactored)...");
  try {
    // 1. Fetch all Products (selecting necessary fields)
    const products = await Product.find({}).select(
      "name description category brand tags base_price" // Added brand, tags
    ).lean(); // Use lean for plain objects

    if (!products || products.length === 0) {
      console.log("No products found to index.");
      return;
    }

    console.log(`Found ${products.length} products to process.`);

    // 2. Collect all unique IDs needed for related data
    const productIds = products.map(p => p._id);
    const categoryIds = [...new Set(products.map(p => p.category).filter(id => id))];
    const brandIds = [...new Set(products.map(p => p.brand).filter(id => id))];

    // 3. Fetch related data in bulk
    const [categories, brands, variants] = await Promise.all([
      Category.find({ _id: { $in: categoryIds } }).select("name").lean(),
      Brand.find({ _id: { $in: brandIds } }).select("name").lean(),
      Variant.find({ product: { $in: productIds } }).select("product types price").lean() // Fetch variants linked to these products
    ]);

    // 4. Create lookup maps/groups for efficient access
    const categoryMap = new Map(categories.map(c => [c._id.toString(), c.name]));
    const brandMap = new Map(brands.map(b => [b._id.toString(), b.name]));
    const variantsByProduct = variants.reduce((acc, variant) => {
      const productIdStr = variant.product.toString();
      if (!acc[productIdStr]) {
        acc[productIdStr] = [];
      }
      acc[productIdStr].push(variant);
      return acc;
    }, {}); // Group variants by product ID

    console.log(`Workspaceed related data: ${categories.length} categories, ${brands.length} brands, ${variants.length} variants.`);

    // 5. Prepare bulk operations
    const productIndexOps = []; // For ProductIndex upserts
    const productLinkOps = [];  // For updating Product.productIndex field

    let processedIndexCount = 0;

    // 6. Process each product
    for (const p of products) {
      const productIdStr = p._id.toString();

      // Get related data from maps/groups
      const categoryName = categoryMap.get(p.category?.toString());
      const brandName = brandMap.get(p.brand?.toString());
      const productVariants = variantsByProduct[productIdStr] || []; // Get variants for this product

      // Prepare parts for the index string
      const nameParts = processIndexField(p.name);
      const categoryParts = processIndexField(categoryName); // Use looked-up name
      const brandParts = processIndexField(brandName);       // Use looked-up name
      const tagParts = processIndexField(p.tags);            // Process tags array
      const descriptionParts = processIndexField(p.description); // Process description array
      const variantTypeParts = productVariants.flatMap(v => processIndexField(v.types)); // Process types from all variants

      // Combine all parts into a unique set to avoid duplicate keywords
      const uniqueParts = new Set([
        ...nameParts,
        ...(categoryParts || []),
        ...(brandParts || []),
        ...(tagParts || []),
        ...(descriptionParts || []),
        ...(variantTypeParts || [])
      ]);

      // Create the final index string
      const productIndexStr = [...uniqueParts].join("_");

      // Prepare the array of variant prices
      let variantPrices = productVariants.map(v => v.price).filter(price => typeof price === 'number' && price >= 0);

      // If there are no variants, potentially use base_price? Or leave empty?
      // Decision: Use base_price if no variants exist and base_price is valid
      if (variantPrices.length === 0 && typeof p.base_price === 'number' && p.base_price >= 0) {
        variantPrices = [p.base_price];
      } else if (variantPrices.length === 0) {
        variantPrices = []; // Ensure it's an empty array if no variants and no base price
      }


      // Prepare upsert operation for ProductIndex
      productIndexOps.push({
        updateOne: {
          filter: { product: p._id }, // Find by product ID
          update: {
            $set: { // Set all fields
              product: p._id,
              productIndex: productIndexStr,
              price: variantPrices, // Set the array of prices
            }
          },
          upsert: true // Create if it doesn't exist
        }
      });
      processedIndexCount++;

    } // End product loop

    // 7. Execute bulk operations
    if (productIndexOps.length > 0) {
      console.log(`Executing ${productIndexOps.length} upsert operations on ProductIndex...`);
      const indexBulkResult = await ProductIndex.bulkWrite(productIndexOps, { ordered: false });
      console.log("ProductIndex bulkWrite result:", JSON.stringify(indexBulkResult));

      // Important: We need the IDs of the upserted/matched indexes to link back to Product
      // Fetching them after upsert is needed if we don't know them beforehand.
      console.log("Fetching updated ProductIndex documents to link back to Products...");
      const updatedIndexes = await ProductIndex.find({ product: { $in: productIds } }).select('_id product').lean();
      const indexMap = new Map(updatedIndexes.map(idx => [idx.product.toString(), idx._id]));

      for (const p of products) {
        const indexId = indexMap.get(p._id.toString());
        if (indexId) {
          productLinkOps.push({
            updateOne: {
              filter: { _id: p._id },
              update: { $set: { productIndex: indexId } }
            }
          });
        } else {
          console.warn(`Could not find ProductIndex ID for Product ${p._id} after upsert.`);
        }
      }

      if (productLinkOps.length > 0) {
        console.log(`Executing ${productLinkOps.length} update operations to link ProductIndex back to Product...`);
        const productBulkResult = await Product.bulkWrite(productLinkOps, { ordered: false });
        console.log("Product linking bulkWrite result:", JSON.stringify(productBulkResult));
        console.log(`Product indexes processed: ${processedIndexCount}. Products successfully linked: ${productBulkResult.modifiedCount || 0}`);
      } else {
        console.log("No product linking operations needed.");
      }

    } else {
      console.log("No ProductIndex operations to execute.");
    }

  } catch (error) {
    console.error("Error updating product indexes:", error);
    // Don't exit process if run as part of larger system, just log/throw
    // process.exit(1);
    throw error; // Re-throw error
  }
};

// --- Other update functions (like updateProducts) can be kept or removed ---
// const updateProducts = async () => { ... };
// const updateAllProductsToSingleCategory = async () => { ... };

// --- Main Execution Logic (for standalone run) ---
async function runScript() {
  await connectDB();
  try {
    await updateProductIndex(); // Run the main function
  } catch (e) {
    console.error("Script execution failed.");
  } finally {
    console.log("Disconnecting...");
    await mongoose.disconnect();
    console.log("Script finished.");
    // process.exit(0); // Exit only if run standalone
  }
}

// Uncomment the line below ONLY if you want to run this script directly using `node your_script_name.js`
// runScript();

// Export the function if you intend to call it from elsewhere (e.g., your main app or another script)
module.exports = {
  updateProductIndex,
  // updateProducts, // Export others if needed
  // updateAllProductsToSingleCategory,
};