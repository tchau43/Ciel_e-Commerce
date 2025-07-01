const mongoose = require("mongoose");
const Category = require("../models/category");
const Brand = require("../models/brand");
const { Product, ProductIndex } = require("../models/product");
const Variant = require("../models/variant");
const { generateCombinations } = require("../utils/helper");
const { createCategoryService } = require("./categoryService");
const { updateProductIndex } = require("./updateDb/updateProduct");
const logger = require("../config/logger");


const createProductService = async (productData) => {
  try {
    const { variants, ...mainProductData } = productData;

    const categoryInput = mainProductData.category;
    let category = null;
    if (categoryInput) {

      if (mongoose.Types.ObjectId.isValid(categoryInput)) {
        category = await Category.findById(categoryInput).lean();
      }
      if (!category && typeof categoryInput === "string") {

        category = await Category.findOne({ name: categoryInput }).lean();
      }

      if (!category && typeof categoryInput === "string") {
        console.warn(`Auto-creating category: ${categoryInput}`);

        category = await createCategoryService({ name: categoryInput });
      }
    }
    if (!category) {

      throw new Error(
        "Valid category (ID or Name) is required and must exist or be creatable."
      );
    }

    const brandInput = mainProductData.brand;
    let resolvedBrandId = null;
    if (brandInput) {

      let brand = null;

      if (mongoose.Types.ObjectId.isValid(brandInput)) {
        brand = await Brand.findById(brandInput).lean();
      }

      if (!brand && typeof brandInput === "string") {
        brand = await Brand.findOne({ name: brandInput }).lean();
      }








      if (brand && brand._id) {
        resolvedBrandId = brand._id;
      } else if (typeof brandInput === "string") {

        throw new Error(
          `Brand '${brandInput}' not found. Please create it first or provide a valid Brand ID.`
        );
      } else {

        throw new Error(`Invalid brand identifier provided: ${brandInput}`);
      }
    }


    const newProduct = new Product({
      ...mainProductData,
      category: category._id,
      brand: resolvedBrandId,
      variants: [],
    });
    await newProduct.save();

    let createdVariantIds = [];
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const variantsToCreate = variants.map((variantData) => ({
        ...variantData,
        product: newProduct._id,
      }));
      try {
        const createdVariants = await Variant.insertMany(variantsToCreate);
        createdVariantIds = createdVariants.map((v) => v._id);
      } catch (variantError) {
        await Product.findByIdAndDelete(newProduct._id);
        throw new Error(`Failed to create variants: ${variantError.message}`);
      }

      newProduct.variants = createdVariantIds;
      await newProduct.save();
    }

    await updateProductIndex();

    const populatedProduct = await Product.findById(newProduct._id)
      .populate("category", "name")
      .populate("brand", "name")
      .lean();
    return populatedProduct;
  } catch (error) {
    console.error("Error in createProductService:", error);

    if (error.name === "ValidationError") {
      throw new Error(`Product validation failed: ${error.message}`);
    }
    throw new Error(error.message || "Error creating product");
  }
};

const getAllProductsService = async (sort) => {
  try {
    let sortOption = {};
    if (sort && typeof sort === "string") {
      const [field, order] = sort.split(":");
      if (field && order && ["asc", "desc"].includes(order.toLowerCase())) {
        sortOption[field] = order.toLowerCase() === "desc" ? -1 : 1;
      } else {
        console.warn(`Invalid sort parameter: ${sort}. Using default.`);
        sortOption = { purchasedQuantity: -1, createdAt: -1 };
      }
    } else {
      sortOption = { purchasedQuantity: -1, createdAt: -1 };
    }
    const products = await Product.find({})
      .sort(sortOption)
      .populate("category", "name")
      .populate("brand", "name")
      .lean();
    return products;
  } catch (error) {
    console.error("Error in getAllProductsService:", error);
    throw new Error("Error getting products: " + error.message);
  }
};

const getProductByIdService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }
    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("brand", "name")
      .populate({

        path: "variants",
        model: "Variant",

      })
      .lean();
    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  } catch (error) {
    console.error(`Error in getProductByIdService for ID ${id}:`, error);
    throw new Error(error.message || "Error getting product by ID");
  }
};

const getProductsByNameService = async (name) => {
  try {
    const products = await Product.find({
      name: { $regex: name, $options: "i" },
    })
      .populate("category", "name")
      .populate("brand", "name")
      .lean();
    return products;
  } catch (error) {
    console.error(`Error in getProductsByNameService for name ${name}:`, error);
    throw new Error("Error fetching products by name: " + error.message);
  }
};


const updateProductService = async (id, productData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }

    let resolvedCategoryId;
    const categoryInput = productData.category;
    if (categoryInput !== undefined) {

      if (
        typeof categoryInput === "object" &&
        categoryInput !== null &&
        categoryInput._id
      ) {
        resolvedCategoryId = categoryInput._id;
      } else if (typeof categoryInput === "string") {
        let foundCategory = null;
        if (mongoose.Types.ObjectId.isValid(categoryInput)) {
          foundCategory = await Category.findById(categoryInput).lean();
        }
        if (!foundCategory) {
          foundCategory = await Category.findOne({
            name: categoryInput,
          }).lean();
        }
        if (!foundCategory)
          throw new Error(`Category '${categoryInput}' not found`);
        resolvedCategoryId = foundCategory._id;
      } else if (categoryInput === null) {
        resolvedCategoryId = null;
      }
    }

    const updateData = { ...productData };
    delete updateData.variants;
    delete updateData.averageRating;
    delete updateData.numberOfReviews;

    if (categoryInput !== undefined) {
      updateData.category = resolvedCategoryId;
    } else {
      delete updateData.category;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("brand", "name");
    if (!updatedProduct) {
      throw new Error("Product not found for update");
    }

    await updateProductIndex();

    return updatedProduct.toObject();
  } catch (error) {
    console.error(`Error in updateProductService for ID ${id}:`, error);
    throw new Error(error.message || "Error updating product core details");
  }
};

const deleteProductService = async (id) => {
  let session;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const deletedProduct = await Product.findByIdAndDelete(id, { session });
    if (!deletedProduct) {

      await session.abortTransaction();
      session.endSession();
      throw new Error("Product not found for deletion");
    }

    const deleteVariantsResult = await Variant.deleteMany(
      { product: id },
      { session }
    );
    console.log(
      `Deleted ${deleteVariantsResult.deletedCount} variants for product ${id}`
    );

    await ProductIndex.deleteOne({ product: id }, { session });
    console.log(`Deleted ProductIndex entry for product ${id}`);

    await session.commitTransaction();
    session.endSession();
    return deletedProduct.toObject();
  } catch (error) {

    if (session && session.inTransaction()) {

      await session.abortTransaction();
    }
    console.error(`Error in deleteProductService for ID ${id}:`, error);
    throw new Error(error.message || "Error deleting product");
  } finally {

    if (session) {
      session.endSession();
    }
  }
};
const addVariantToProductService = async (productId, variantData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid Product ID format.");
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new Error("Parent product not found.");
    }

    const newVariant = new Variant({
      ...variantData,
      product: productId,
    });
    await newVariant.save({ session });

    await Product.findByIdAndUpdate(
      productId,
      {
        $push: { variants: newVariant._id },
      },
      { session }
    );

    await session.commitTransaction();
    console.log(`Added Variant ${newVariant._id} to Product ${productId}`);

    return newVariant.toObject();
  } catch (error) {

    await session.abortTransaction();
    console.error(`Error adding variant to product ${productId}:`, error);
    throw error;
  } finally {

    session.endSession();
  }
};

const getProductsByCategoryService = async (categoryIds) => {
  try {
    const validCategoryIds = categoryIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    if (validCategoryIds.length === 0) return [];
    const products = await Product.find({ category: { $in: validCategoryIds } })
      .populate("category", "name")
      .populate("brand", "name")
      .lean();
    return products;
  } catch (error) {
    console.error("Error in getProductsByCategoryService:", error);
    throw new Error("Error finding products by category: " + error.message);
  }
};

const searchProductService = async (searchText, categories = []) => {

  try {

    let productQuery = {};
    const validCategoryIds = categories
      .map((cat) => (typeof cat === "string" ? cat.trim() : cat))
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validCategoryIds.length > 0)
      productQuery.category = { $in: validCategoryIds };
    let finalProductIds = [];
    if (
      searchText &&
      typeof searchText === "string" &&
      searchText.trim().length > 0
    ) {
      const keywords = searchText.toLowerCase().trim().split(/\s+/);
      const seenIds = new Set();
      for (let groupSize = keywords.length; groupSize >= 1; groupSize--) {
        const combinations = generateCombinations(keywords, groupSize);
        const groupConditions = combinations.map((combo) => ({
          $and: combo.map((keyword) => ({
            productIndex: {
              $regex: `(^|[^a-zA-Z0-9])${keyword.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}([^a-zA-Z0-9]|$)`,
              $options: "i",
            },
          })),
        }));
        if (groupConditions.length > 0) {
          const indexResults = await ProductIndex.find(
            { $or: groupConditions },
            { product: 1 }
          ).lean();
          indexResults.forEach((result) => {
            const idStr = result.product.toString();
            if (!seenIds.has(idStr)) {
              seenIds.add(idStr);
              finalProductIds.push(result.product);
            }
          });
        }
      }
      if (finalProductIds.length === 0 && validCategoryIds.length === 0)
        return [];
      if (finalProductIds.length > 0)
        productQuery._id = { $in: finalProductIds };
    }
    let products = [];

    if (validCategoryIds.length > 0 || finalProductIds.length > 0) {
      products = await Product.find(productQuery)
        .populate("category", "name")
        .populate("brand", "name")
        .lean();
    } else if (!searchText || searchText.trim().length === 0) {

      return [];
    }

    if (finalProductIds.length > 0 && products.length > 0) {
      const idOrderMap = new Map();
      finalProductIds.forEach((id, index) =>
        idOrderMap.set(id.toString(), index)
      );
      products.sort((a, b) => {
        const aIndex = idOrderMap.get(a._id.toString());
        const bIndex = idOrderMap.get(b._id.toString());
        if (aIndex === undefined && bIndex === undefined) return 0;
        if (aIndex === undefined) return 1;
        if (bIndex === undefined) return -1;
        return aIndex - bIndex;
      });
    }
    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("Error searching products: " + error.message);
  }
};


const getVariantByIdService = async (variantId) => {
  if (!mongoose.Types.ObjectId.isValid(variantId)) {
    throw new Error("Invalid Variant ID format");
  }
  const variant = await Variant.findById(variantId)
    .populate("product", "name")
    .lean();
  if (!variant) {
    throw new Error("Variant not found.");
  }
  return variant;
};

const updateVariantService = async (variantId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(variantId)) {
    throw new Error("Invalid Variant ID format");
  }
  delete updateData.product;

  const updatedVariant = await Variant.findByIdAndUpdate(
    variantId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).lean();
  if (!updatedVariant) {
    throw new Error("Variant not found for update.");
  }


  return updatedVariant;
};

const deleteVariantService = async (variantId) => {
  if (!mongoose.Types.ObjectId.isValid(variantId)) {
    throw new Error("Invalid Variant ID format");
  }

  const variantToDelete = await Variant.findByIdAndDelete(variantId);
  if (!variantToDelete) {
    throw new Error("Variant not found for deletion.");
  }

  await Product.findByIdAndUpdate(variantToDelete.product, {
    $pull: { variants: variantId },
  });
  console.log(
    `Removed variant ref ${variantId} from product ${variantToDelete.product}`
  );


  return variantToDelete;
};

const updateVariantStockService = async (variantId, stockChange) => {
  if (!mongoose.Types.ObjectId.isValid(variantId)) {
    throw new Error("Invalid Variant ID format");
  }
  if (typeof stockChange !== "number") {
    throw new Error("Stock change must be a number");
  }

  const updatedVariant = await Variant.findByIdAndUpdate(
    variantId,
    { $inc: { stock: stockChange } },
    { new: true, runValidators: true }
  );
  if (!updatedVariant) throw new Error("Variant not found for stock update.");

  if (updatedVariant.stock < 0) {

    await Variant.findByIdAndUpdate(variantId, {
      $inc: { stock: -stockChange },
    });
    throw new Error("Stock cannot be negative. Update reverted.");

  }
  return updatedVariant;
};

const countProductsByCategoryService = async (categoryName) => {
  try {
    if (
      !categoryName ||
      typeof categoryName !== "string" ||
      categoryName.trim() === ""
    ) {
      logger.warn(`Invalid categoryName provided for count: ${categoryName}`);
      return 0;
    }

    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName.trim()}$`, "i") },
    }).lean();
    if (!category) {

      logger.info(`Category not found for count by name: "${categoryName}"`);
      return 0;
    }

    const count = await Product.countDocuments({
      category: category._id,
    });
    logger.info(
      `Counted ${count} products in category "${categoryName}" (ID: ${category._id})`
    );
    return count;
  } catch (error) {
    logger.error(
      `Error in countProductsByCategoryService for name "${categoryName}": ${error.message}`,
      error
    );
    throw new Error("Error counting products by category: " + error.message);
  }
};

const listProductsByCategoryService = async (categoryName, limit = 5) => {
  try {
    if (
      !categoryName ||
      typeof categoryName !== "string" ||
      categoryName.trim() === ""
    ) {
      logger.warn(`Invalid categoryName provided for list: ${categoryName}`);
      return [];
    }

    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName.trim()}$`, "i") },
    }).lean();
    if (!category) {

      logger.info(`Category not found for list by name: "${categoryName}"`);
      return [];
    }

    const productLimit =
      limit && Number.isInteger(limit) && limit > 0 ? limit : 5;
    const products = await Product.find({
      category: category._id,
    })
      .limit(productLimit)
      .populate("category", "name")
      .populate("brand", "name")
      .lean();

    const summarizedProducts = products.map((p) => ({
      id: p._id,
      name: p.name,
      base_price: p.base_price,
      category: p.category?.name,
      brand: p.brand?.name,

    }));
    logger.info(
      `Found ${summarizedProducts.length} products for category "${categoryName}" (ID: ${category._id}) with limit ${limit}`
    );
    return summarizedProducts;
  } catch (error) {
    logger.error(
      `Error in listProductsByCategoryService for name "${categoryName}": ${error.message}`,
      error
    );

    throw new Error("Error finding products by category: " + error.message);
  }
};

const getProductsByPriceRangeService = async (minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER) => {
  try {
    const query = { base_price: { $gte: minPrice } };
    if (maxPrice !== Number.MAX_SAFE_INTEGER && maxPrice !== undefined) {
      query.base_price.$lte = maxPrice;
    }
    const products = await Product.find(query)
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ base_price: 1 })
      .lean();
    return products;
  } catch (error) {
    logger.error(`Error in getProductsByPriceRangeService: ${error.message}`);
    throw error;
  }
};

const searchProductsByPriceAndNeedsService = async (minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER, keywords) => {
  try {
    // Vì description là array nên cần dùng $elemMatch
    const textQuery = keywords ?
      {
        $or: [
          { name: { $regex: keywords, $options: 'i' } },
          { description: { $elemMatch: { $regex: keywords, $options: 'i' } } },
          { tags: { $elemMatch: { $regex: keywords, $options: 'i' } } }
        ]
      } : {};

    const priceQuery = { base_price: { $gte: minPrice } };
    if (maxPrice !== Number.MAX_SAFE_INTEGER && maxPrice !== undefined) {
      priceQuery.base_price.$lte = maxPrice;
    }

    const query = {
      ...textQuery,
      ...priceQuery
    };
    const products = await Product.find(query)
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ base_price: 1 })
      .lean();
    return products;
  } catch (error) {
    logger.error(`Error in searchProductsByPriceAndNeedsService: ${error.message}`);
    throw error;
  }
};

const getFeaturedProductsService = async (limit = 3) => {
  try {
    const limitNum = parseInt(limit, 10) || 3;

    const featuredProducts = await Product.find({})
      .sort({
        purchasedQuantity: -1,
        averageRating: -1,
        numberOfReviews: -1
      })
      .limit(limitNum)
      .populate("category", "name")
      .populate("brand", "name")
      .lean();
    return featuredProducts;
  } catch (error) {
    console.error("Error in getFeaturedProductsService:", error);
    throw new Error("Error getting featured products: " + error.message);
  }
};

module.exports = {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  getProductsByNameService,
  updateProductService,
  deleteProductService,
  getProductsByCategoryService,
  searchProductService,
  getVariantByIdService,
  addVariantToProductService,
  updateVariantService,
  deleteVariantService,
  updateVariantStockService,
  listProductsByCategoryService,
  countProductsByCategoryService,
  getProductsByPriceRangeService,
  searchProductsByPriceAndNeedsService,
  getFeaturedProductsService,
};
