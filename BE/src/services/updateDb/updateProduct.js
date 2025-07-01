const mongoose = require("mongoose");
const Category = require("../../models/category");
const Brand = require("../../models/brand");
const Variant = require("../../models/variant");
const { Product, ProductIndex } = require("../../models/product");
require("dotenv").config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

const processIndexField = (field) => {
  if (!field) return null;
  const values = Array.isArray(field) ? field : [field];
  return values
    .map(val => String(val || "").toLowerCase().trim().replace(/\s+/g, "_"))
    .filter(val => val);
}

const updateProductIndex = async () => {
  console.log("Starting product index update (Refactored)...");
  try {
    const products = await Product.find({}).select(
      "name description category brand tags base_price"
    ).lean();

    if (!products || products.length === 0) {
      console.log("No products found to index.");
      return;
    }
    console.log(`Found ${products.length} products to process.`);

    const productIds = products.map(p => p._id);
    const categoryIds = [...new Set(products.map(p => p.category).filter(id => id))];
    const brandIds = [...new Set(products.map(p => p.brand).filter(id => id))];

    const [categories, brands, variants] = await Promise.all([
      Category.find({ _id: { $in: categoryIds } }).select("name").lean(),
      Brand.find({ _id: { $in: brandIds } }).select("name").lean(),
      Variant.find({ product: { $in: productIds } }).select("product types price").lean()
    ]);

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

    const productIndexOps = [];
    const productLinkOps = [];
    let processedIndexCount = 0;

    for (const p of products) {
      const productIdStr = p._id.toString();
      const categoryName = categoryMap.get(p.category?.toString());
      const brandName = brandMap.get(p.brand?.toString());
      const productVariants = variantsByProduct[productIdStr] || [];

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

      let finalPriceArray = [];
      const variantPrices = productVariants
        .map(v => v.price)
        .filter(price => typeof price === 'number' && price >= 0);

      if (variantPrices.length > 0) {
        const cheapestPrice = Math.min(...variantPrices);
        finalPriceArray = [cheapestPrice];
      } else if (typeof p.base_price === 'number' && p.base_price >= 0) {
        finalPriceArray = [p.base_price];
      }

      productIndexOps.push({
        updateOne: {
          filter: { product: p._id },
          update: {
            $set: {
              product: p._id,
              productIndex: productIndexStr,
              price: finalPriceArray,
            }
          },
          upsert: true
        }
      });
      processedIndexCount++;
    }

    if (productIndexOps.length > 0) {
      console.log(`Executing ${productIndexOps.length} upsert operations on ProductIndex...`);
      const indexBulkResult = await ProductIndex.bulkWrite(productIndexOps, { ordered: false });
      console.log("ProductIndex bulkWrite result:", JSON.stringify(indexBulkResult));

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

async function runScript() {
  await connectDB();
  try {
    await updateProductIndex();
  } catch (e) {
    console.error("Script execution failed.");
  } finally {
    console.log("Disconnecting...");
    await mongoose.disconnect();
    console.log("Script finished.");
  }
}

module.exports = {
  updateProductIndex,
};