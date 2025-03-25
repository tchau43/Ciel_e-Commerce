const Category = require("../models/category");
const { Product, ProductIndex } = require("../models/product");
const { generateCombinations } = require("../utils/helper");
const { createCategoryService } = require("./categoryService");
const { updateProductIndex, updateProducts } = require("./updateDb/updateProduct");
const mongoose = require("mongoose");

const createProductService = async (productData) => {
  try {
    const categoryName = productData.category;
    let category = await Category.findOne({ name: categoryName });

    if (!category) {
      category = await createCategoryService({
        name: categoryName,
        description: "Default description for " + categoryName,
      });
    }

    const newProduct = new Product({
      ...productData,
      category: category._id,
    });
    await newProduct.save();
    return newProduct.populate("category");
  } catch (error) {
    throw new Error("Error creating product: " + error.message);
  }
};

const getAllProductsService = async (sort) => {
  try {
    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(":");
      sortOption[field] = order === "desc" ? -1 : 1;
    }
    const products = await Product.find({})
      .sort(sortOption)
      .populate("category");
    // console.log("ids", ids)
    updateProducts();
    updateProductIndex();
    return products;
  } catch (error) {
    throw new Error("Error getting products: " + error.message);
  }
};

const getProductByIdService = async (id) => {
  try {
    const product = await Product.findById(id).populate("category");
    console.log(">>>>>>>>>>>>product", product);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw new Error("Error creating product: " + error.message);
  }
};

const getProductsByNameService = async (name) => {
  try {
    const products = await Product.find({
      name: { $regex: name, $options: "i" },
    });
    console.log(">>>>>>>>>>>>products", products);

    if (products.length === 0) {
      throw new Error("No products found with that name");
    }

    return products;
  } catch (error) {
    throw new Error("Error fetching products by name: " + error.message);
  }
};

const updateProductService = async (id, productData) => {
  try {
    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    }).populate("category");
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw new Error("Error creating product: " + error.message);
  }
};

const deleteProductService = async (id) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      throw new Error("Product not found");
    }
    return deletedProduct;
  } catch (error) {
    throw new Error("Error deleting product: " + error.message);
  }
};

const getProductsByCategoryService = async (categories) => {
  try {
    // Find products where the category matches any of the categoryIds
    // const products = await Product.find({ category: { $in: categories } });
    const products = await Product.find({
      category: { $in: categories },
    }).populate("category");

    if (products.length === 0) {
      return [];
    }

    return products;
  } catch (error) {
    console.error(error);
    throw new Error("Error founding product by category: " + error.message);
  }
};

const searchProductService = async (searchText, categories = []) => {
  try {
    let query = {};

    // Handle category filter
    if (categories.length > 0) {
      query.category = { $in: categories };
    }

    // Split search text into keywords
    const keywords = searchText ? searchText.toLowerCase().split(/\s+/) : [];

    const seenIds = new Set();
    const productIds = [];

    if (keywords.length > 0) {
      // Process combinations from largest to smallest
      for (let groupSize = keywords.length; groupSize >= 1; groupSize--) {
        const combinations = generateCombinations(keywords, groupSize);

        const groupConditions = combinations.map((combo) => ({
          $and: combo.map((keyword) => ({
            productIndex: {
              $regex: `(^|_)${keyword.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}($|_)`,
              $options: "i",
            },
          })),
        }));
        // console.log(">>>>>>>> groupConditions", groupConditions);
        // console.log(">>>>>>>> query", query);

        if (groupConditions.length === 0) continue;

        const results = await ProductIndex.find({ $or: groupConditions });

        // Add new unique IDs in order of discovery
        results.forEach((result) => {
          const idStr = result.product.toString();
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            productIds.push(idStr);
          }
        });
      }
    }
    if (productIds.length > 0) {
      query._id = { $in: productIds };
    }
    console.log(">>>>>>>> query", query);

    // Get final products and sort by priority
    let products = [];
    if (productIds.length > 0 || categories.length > 0) {
      products = await Product.find(query).populate("category");
      // Get all matching products
      // products = await Product.find({
      //   _id: { $in: productIds }
      // }).populate("category");

      // Create a map for efficient lookups
      const idMap = new Map();
      productIds.forEach((id, index) => idMap.set(id, index));
      // console.log(">>>>>>>> idMap", idMap);

      // Sort products based on their position in productIds array
      products.sort((a, b) => {
        const aIndex = idMap.get(a._id.toString());
        const bIndex = idMap.get(b._id.toString());
        return aIndex - bIndex;
      });
    }

    return products;
  } catch (error) {
    console.error(error);
    throw new Error("Error searching products: " + error.message);
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
};
