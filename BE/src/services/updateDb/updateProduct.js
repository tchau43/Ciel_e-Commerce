const mongoose = require("mongoose");
const Category = require("../../models/category");
const { Product, ProductIndex } = require("../../models/product"); // Assuming ProductIndex is exported here now
const fs = require("fs").promises; // Using async FS
const path = require("path");

require("dotenv").config();

// --- Connection Function ---
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit if connection fails
  }
}

// --- Function to update products ---
const updateProducts = async () => {
  console.log("Starting product update...");
  try {
    // Consider using cursor for large collections
    const products = await Product.find({});
    let updatedCount = 0;

    for (let product of products) {
      let hasChanged = false; // Flag to save only if changed

      // --- Apply Defaults/Corrections based on Schema ---
      if (!product.name) {
        product.name = "Unnamed Product";
        hasChanged = true;
      } // Ensure name exists
      if (product.base_price === undefined || product.base_price === null) {
        product.base_price = 0;
        hasChanged = true;
      } // Use base_price
      if (
        !Array.isArray(product.description) ||
        product.description.length === 0
      ) {
        product.description = [product.name + " description"];
        hasChanged = true;
      }
      if (!product.category) {
        // Option 1: Skip if required category is missing (prevents validation error)
        // console.warn(`Product ${product._id} has no category, skipping category default.`);
        // Option 2: Assign a default Category ID if you have one
        // const defaultCategoryId = 'YOUR_DEFAULT_CATEGORY_ID';
        // if (defaultCategoryId) { product.category = defaultCategoryId; hasChanged = true; }
        // Option 3: Keep as is (might fail validation if required=true wasn't enforced before)
      }
      if (!product.tags) {
        product.tags = [];
        hasChanged = true;
      } // Initialize tags if needed
      if (product.brand === "") {
        product.brand = null;
        hasChanged = true;
      } // Use null for ObjectId ref
      if (!product.popularity && product.popularity !== 0) {
        product.popularity = 3;
        hasChanged = true;
      } // Default to 3 if falsy (but not 0)

      // --- Image Population Logic ---
      const folderName = product.name.split(" ").join("_"); // Consider more robust sanitization/naming
      const folderPath = path.join(
        __dirname,
        "../../public/images/product",
        folderName
      );

      try {
        await fs.access(folderPath); // Check if folder exists (async)
        const files = await fs.readdir(folderPath); // Read dir (async)
        const imageFiles = files.filter((file) =>
          /\.(jpg|jpeg|png|gif|jfif)$/i.test(file)
        );
        const imagePaths = imageFiles.map(
          (file) => `images/product/${folderName}/${file}`
        ); // Relative path for web server

        // Check if image paths actually changed before assigning
        if (JSON.stringify(product.images) !== JSON.stringify(imagePaths)) {
          product.images = imagePaths;
          hasChanged = true;
        }
      } catch (folderError) {
        // Folder doesn't exist or cannot be read
        if (product.images?.length > 0) {
          // Clear images if folder is gone but field has data
          product.images = [];
          hasChanged = true;
        } else if (!product.images) {
          // Initialize if field doesn't exist
          product.images = [];
          hasChanged = true;
        }
      }

      // --- Save only if modifications occurred ---
      if (hasChanged) {
        await product.save();
        updatedCount++;
      }
    }

    console.log(
      `${updatedCount} products potentially updated (fields defaulted, images synced).`
    );
  } catch (error) {
    console.error("Error updating products:", error);
    process.exit(1); // Exit with error
  }
};

// --- Function to update category format --- (Looks OK)
const updateAllProductsToSingleCategory = async () => {
  console.log("Starting category format update...");
  // ... (keep existing logic) ...
};

// --- Function to update product indexes ---
const updateProductIndex = async () => {
  console.log("Starting product index update...");
  try {
    const products = await Product.find({}).select(
      "name description category base_price"
    ); // Select only needed fields
    const categoryIds = [
      ...new Set(products.map((p) => p.category).filter((id) => id)),
    ];
    const categories = await Category.find({
      _id: { $in: categoryIds },
    }).select("name"); // Select only name
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));
    let updatedIndexCount = 0;
    let linkedProductCount = 0;

    const productUpdateOps = []; // For bulkWrite

    for (const p of products) {
      const cate = categoryMap.get(p.category?.toString());
      if (!cate) {
        console.warn(
          `Category not found for product ${p._id} (${p.name}), skipping index update.`
        );
        continue;
      }

      const processField = (field) =>
        (field || "").toLowerCase().trim().replace(/\s+/g, "_");

      // Process description array correctly
      const descriptionParts = p.description
        .map((d) => processField(d || ""))
        .filter((part) => part);

      const parts = [
        processField(p.name),
        processField(cate.name),
        ...descriptionParts,
      ].filter((part) => part);

      const productIndexStr = parts.join("_");

      // Update or Insert ProductIndex
      const productIndex = await ProductIndex.findOneAndUpdate(
        { product: p._id },
        {
          product: p._id, // Ensure product field is set on upsert
          productIndex: productIndexStr,
          price: p.base_price, // Use base_price
        },
        { upsert: true, new: true } // new: true returns the updated/created doc
      );
      updatedIndexCount++;

      // Prepare Product update to link the index (using bulkWrite later)
      productUpdateOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { productIndex: productIndex._id } },
        },
      });
    }

    // Update products in bulk to link ProductIndex
    if (productUpdateOps.length > 0) {
      const bulkResult = await Product.bulkWrite(productUpdateOps);
      linkedProductCount = bulkResult.modifiedCount;
    }

    console.log(
      `Product indexes updated/created: ${updatedIndexCount}. Products linked: ${linkedProductCount}`
    );
  } catch (error) {
    console.error("Error updating product indexes:", error);
    process.exit(1); // Exit with error
  }
};

// --- Main Execution Logic ---
async function runUpdates() {
  await connectDB(); // Ensure connection first

  // Choose which updates to run:
  // await updateProducts();
  // await updateAllProductsToSingleCategory();
  await updateProductIndex();

  console.log("Update script finished.");
  await mongoose.disconnect(); // Disconnect gracefully
  process.exit(0);
}

// runUpdates(); // Execute the main function

// Export functions if needed elsewhere (optional for standalone script)
module.exports = {
  updateProductIndex,
  updateProducts,
  updateAllProductsToSingleCategory,
};
