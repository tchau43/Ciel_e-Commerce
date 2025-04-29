// src/services/updateDb/updateProduct.js (Phần sửa đổi)

const mongoose = require("mongoose");
const Category = require("../../models/category"); // Adjust path if needed
const Brand = require("../../models/brand");       // Adjust path if needed
const Variant = require("../../models/variant");   // Adjust path if needed
const { Product, ProductIndex } = require("../../models/product"); // Adjust path if needed
require("dotenv").config();

// --- Connection Function (Giữ nguyên) ---
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit if connection fails
  }
}

// --- Helper to process text for indexing (Giữ nguyên) ---
const processIndexField = (field) => {
  if (!field) return null;
  const values = Array.isArray(field) ? field : [field];
  return values
    .map(val => String(val || "").toLowerCase().trim().replace(/\s+/g, "_"))
    .filter(val => val);
}

// --- Function to update product indexes (Sửa đổi logic Price) ---
const updateProductIndex = async () => {
  console.log("Starting product index update (Refactored)...");
  try {
    // 1. Fetch all Products (Giữ nguyên)
    const products = await Product.find({}).select(
      "name description category brand tags base_price" // Added brand, tags
    ).lean();

    if (!products || products.length === 0) {
      console.log("No products found to index.");
      return;
    }
    console.log(`Found ${products.length} products to process.`);

    // 2. Collect all unique IDs needed for related data (Giữ nguyên)
    const productIds = products.map(p => p._id);
    const categoryIds = [...new Set(products.map(p => p.category).filter(id => id))];
    const brandIds = [...new Set(products.map(p => p.brand).filter(id => id))];

    // 3. Fetch related data in bulk (Giữ nguyên)
    const [categories, brands, variants] = await Promise.all([
      Category.find({ _id: { $in: categoryIds } }).select("name").lean(),
      Brand.find({ _id: { $in: brandIds } }).select("name").lean(),
      Variant.find({ product: { $in: productIds } }).select("product types price").lean()
    ]);

    // 4. Create lookup maps/groups for efficient access (Giữ nguyên)
    const categoryMap = new Map(categories.map(c => [c._id.toString(), c.name]));
    const brandMap = new Map(brands.map(b => [b._id.toString(), b.name]));
    const variantsByProduct = variants.reduce((acc, variant) => {
      const productIdStr = variant.product.toString();
      if (!acc[productIdStr]) {
        acc[productIdStr] = [];
      }
      acc[productIdStr].push(variant);
      return acc;
    }, {});
    console.log(`Workspaceed related data: ${categories.length} categories, ${brands.length} brands, ${variants.length} variants.`);

    // 5. Prepare bulk operations (Giữ nguyên)
    const productIndexOps = [];
    const productLinkOps = [];

    let processedIndexCount = 0;

    // 6. Process each product (Sửa đổi logic Price)
    for (const p of products) {
      const productIdStr = p._id.toString();
      const categoryName = categoryMap.get(p.category?.toString());
      const brandName = brandMap.get(p.brand?.toString());
      const productVariants = variantsByProduct[productIdStr] || [];

      // Prepare parts for the index string (Giữ nguyên)
      const nameParts = processIndexField(p.name);
      const categoryParts = processIndexField(categoryName);
      const brandParts = processIndexField(brandName);
      const tagParts = processIndexField(p.tags);
      const descriptionParts = processIndexField(p.description);
      const variantTypeParts = productVariants.flatMap(v => processIndexField(v.types));

      const uniqueParts = new Set([
        ...nameParts,
        ...(categoryParts || []),
        ...(brandParts || []),
        ...(tagParts || []),
        ...(descriptionParts || []),
        ...(variantTypeParts || [])
      ]);
      const productIndexStr = [...uniqueParts].join("_");

      // ******** SỬA ĐỔI LOGIC PRICE *********
      let finalPriceArray = []; // Mảng để lưu giá cuối cùng
      const variantPrices = productVariants
        .map(v => v.price)
        .filter(price => typeof price === 'number' && price >= 0); // Lấy giá hợp lệ từ variants

      if (variantPrices.length > 0) {
        // Nếu có giá variant, tìm giá rẻ nhất
        const cheapestPrice = Math.min(...variantPrices);
        finalPriceArray = [cheapestPrice]; // Lưu giá rẻ nhất vào mảng
      } else if (typeof p.base_price === 'number' && p.base_price >= 0) {
        // Nếu không có variant, sử dụng base_price nếu hợp lệ
        finalPriceArray = [p.base_price];
      }
      // Nếu không có variant và không có base_price hợp lệ, finalPriceArray sẽ là [] (rỗng)
      // ******** KẾT THÚC SỬA ĐỔI LOGIC PRICE *********

      // Prepare upsert operation for ProductIndex
      productIndexOps.push({
        updateOne: {
          filter: { product: p._id },
          update: {
            $set: {
              product: p._id,
              productIndex: productIndexStr,
              price: finalPriceArray, // <-- Sử dụng mảng giá đã xử lý
            }
          },
          upsert: true
        }
      });
      processedIndexCount++;

    } // End product loop

    // 7. Execute bulk operations (Giữ nguyên logic fetch/link)
    if (productIndexOps.length > 0) {
      console.log(`Executing ${productIndexOps.length} upsert operations on ProductIndex...`);
      const indexBulkResult = await ProductIndex.bulkWrite(productIndexOps, { ordered: false });
      console.log("ProductIndex bulkWrite result:", JSON.stringify(indexBulkResult));

      // Fetch updated/matched indexes to link back to Product
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
    throw error;
  }
};

// --- Main Execution Logic (Giữ nguyên) ---
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
    // process.exit(0); // Chỉ thoát nếu chạy độc lập
  }
}

// Uncomment để chạy script trực tiếp: node src/services/updateDb/updateProduct.js
// runScript();

// Export hàm nếu cần gọi từ nơi khác
module.exports = {
  updateProductIndex,
};