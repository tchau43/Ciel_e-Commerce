const Category = require("../models/category");
const Product = require("../models/product");
const { createCategoryService } = require("./categoryService");

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
      category: category._id, // Use the category's ObjectId
    });
    await newProduct.save();
    return newProduct;
  } catch (error) {
    throw new Error("Error creating product: " + error.message);
  }
};

const getAllProductsService = async () => {
  try {
    const allProducts = await Product.find({}).populate("category");
    return allProducts;
  } catch (error) {
    throw new Error("Error creating product: " + error.message);
  }
};

const getProductByIdService = async (id) => {
  try {
    const product = await Product.findById(id).populate("category");
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
      name: { $regex: name, $options: "i" }, // 'i' makes it case-insensitive
    });

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

const searchProductService = async (searchText) => {
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: searchText, $options: "i" } }, // Search by name (case-insensitive)
        { price: { $regex: searchText, $options: "i" } }, // Search by name (case-insensitive)
        { description: { $regex: searchText, $options: "i" } }, // Search by description (case-insensitive)
        { "category.name": { $regex: searchText, $options: "i" } }, // Search by category name (case-insensitive)
      ],
    }).populate("category"); // Populate category for related information

    if (products.length === 0) {
      throw new Error("No products found matching the search criteria");
    }

    return products;
  } catch (error) {
    console.error(error);
    throw new Error("Error founding product by category: " + error.message);
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
