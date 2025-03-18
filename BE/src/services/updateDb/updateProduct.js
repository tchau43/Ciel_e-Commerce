const mongoose = require("mongoose");
const Category = require("../../models/category");
const { ProductIndex, Product } = require("../../models/product");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log('Connected to MongoDB');
    // updateProducts();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Function to update products
const updateProducts = async () => {
  try {
    // Fetch all products to update
    const products = await Product.find({});

    // Loop through each product to update
    for (let product of products) {
      // Set default values for the new fields
      product.name = product.name || "name";
      product.price = product.price || 0;
      product.shortDescription =
        product.shortDescription || product.name + " shortDescription";
      product.description =
        product.description || product.name + " description";
      product.category = product.category || null; // You can replace null with a default category if needed
      product.tags = product.tags || []; // Initialize tags as an empty array if not set
      product.brand = product.brand || ""; // Default to empty string if no brand
      product.status = product.status || "active"; // Set default status if not present
      product.quantity_in_stock = product.quantity_in_stock || 0; // Default stock quantity
      product.moreInfomation =
        product.moreInfomation || product.name + " moreInfomation"; // Default to empty string if not present
      product.popularity = product.popularity || 3;
      const folderName = product.name.split(" ").join("_");
      //   console.log(">>>>>>>>>__dirname", __dirname);
      // Construct the absolute path to the folder where images are stored
      // e.g. /path/to/your/project/src/public/images/product/iphone_16_promax
      const folderPath = path.join(
        __dirname,
        "../../public/images/product",
        folderName
      );
      //   console.log(">>>>>>>>>folderPath", folderPath);

      // Check if the folder exists
      if (fs.existsSync(folderPath)) {
        // Read all files in that folder
        const files = fs.readdirSync(folderPath);

        // Filter for common image extensions (add/remove extensions as needed)
        const imageFiles = files.filter((file) =>
          /\.(jpg|jpeg|png|gif|jfif)$/i.test(file)
        );
        console.log(">>>>>>>imageFiles", imageFiles);

        // Map each file to a relative path that Express can serve
        // e.g. "images/product/iphone_16_promax/image1.jfif"
        const imagePaths = imageFiles.map((file) => {
          return `images/product/${folderName}/${file}`;
        });
        console.log(">>>>>>>imagePaths", imagePaths);

        // Assign these image paths to the product's images field
        product.images = imagePaths;
      } else {
        // If folder doesn't exist, you can set images to empty or a default
        product.images = [];
      }

      // Save the updated product
      await product.save();
    }

    console.log("All products have been updated successfully!");
    // process.exit(0); // Exit the script after completion
  } catch (error) {
    console.error("Error updating products:", error);
    process.exit(1); // Exit with error
  }
};

const updateAllProductsToSingleCategory = async () => {
  try {
    const result = await Product.updateMany(
      { category: { $type: "array" } }, // Only update products where category is an array
      [
        {
          $set: {
            // Replace the array with its first element
            category: { $arrayElemAt: ["$category", 0] },
          },
        },
      ]
    );

    console.log(`${result.modifiedCount} products updated`);
    process.exit(0); // Exit after update completes
  } catch (err) {
    console.error("Error updating products:", err);
    process.exit(1); // Exit with error
  }
};

const updateProductIndex = async () => {
  try {
    // Normalize input to an array
    // const ids = Array.isArray(productIds) ? productIds : productIds ? productIds.split(",") : [];
    const products = await Product.find({});
    // console.log("ids", ids)
    // console.log("products", products)

    for (const p of products) {
      const cate = await Category.findOne({ _id: p.category });
      if (!cate) {
        console.error(`Category not found for product ${p._id}`);
        continue;
      }

      const processField = (field) =>
        (field || "").toLowerCase().trim().replace(/\s+/g, "_");

      const parts = [
        processField(p.name),
        processField(cate.name),
        processField(p.description),
        processField(p.shortDescription),
        processField(p.moreInfomation),
      ].filter((part) => part);

      const productIndexStr = parts.join("_");

      const productIndex = await ProductIndex.findOneAndUpdate(
        { product: p._id },
        {
          productIndex: productIndexStr,
          price: p.price,
        },
        { upsert: true, new: true }
      );

      p.productIndex = productIndex._id;
      await p.save();
    }
    console.log("Product indexes updated successfully");
  } catch (error) {
    console.error("Error updating product indexes:", error);
  }
};

module.exports = { updateProductIndex, updateProducts };
