const { default: mongoose } = require("mongoose");
const { createProductService, getAllProductsService, getProductByIdService, getProductsByNameService, updateProductService, deleteProductService, getProductsByCategoryService, searchProductService, getVariantByIdService, updateVariantService, deleteVariantService, updateVariantStockService, addVariantToProductService, getFeaturedProductsService } = require("../services/productService");

const createProduct = async (req, res) => {

  const productData = req.body;
  try {

    if (!productData.name || productData.base_price === undefined || productData.base_price < 0) {
      return res.status(400).json({ message: "Product name and valid base_price are required." });
    }

    const data = await createProductService(productData);

    res.status(201).json(data);
  } catch (error) {
    console.error("Error in createProduct controller:", error);
    res.status(400).json({ message: error.message || "Failed to create product." });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { sort } = req.query;

    let sortParam = sort;
    if (sort === 'popular') {
      sortParam = 'purchasedQuantity:desc';
    }
    const data = await getAllProductsService(sortParam);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getAllProducts controller:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve products." });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getProductByIdService(id);
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error in getProductById controller for ID ${req.params.id}:`, error);
    if (error.message === "Product not found" || error.message === "Invalid product ID format") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to retrieve product." });
    }
  }
};

const getProductsByName = async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ message: "Search 'name' query parameter is required." });
  }
  try {
    const data = await getProductsByNameService(name);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getProductsByName controller:", error);
    res.status(500).json({ message: error.message || "Failed to search products by name." });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const productData = req.body;
  try {

    if (productData.variants !== undefined) {
      return res.status(400).json({ message: "Cannot update variants via this endpoint. Use specific /variants/:variantId routes." });
    }

    if (productData.averageRating !== undefined || productData.numberOfReviews !== undefined) {
      return res.status(400).json({ message: "Cannot update rating fields directly." });
    }

    const data = await updateProductService(id, productData);
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error in updateProduct controller for ID ${req.params.id}:`, error);
    if (error.message.includes("not found") || error.message.startsWith("Category") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message || "Failed to update product." });
    }
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProductService(id);
    res.status(204).send();
  } catch (error) {
    console.error(`Error in deleteProduct controller for ID ${req.params.id}:`, error);
    if (error.message.includes("not found") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message || "Failed to delete product." });
    }
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ message: "Category query parameter is required." });
    }
    const categoryIds = Array.isArray(category) ? category : category.split(",");
    const data = await getProductsByCategoryService(categoryIds);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getProductsByCategory controller:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve products by category." });
  }
};

const searchProduct = async (req, res) => {
  const { searchText, category } = req.query;
  const categories = category ? (Array.isArray(category) ? category : category.split(",")) : [];
  try {
    if (!searchText && categories.length === 0) {
      return res.status(400).json({ message: "Please provide search text or select categories" });
    }
    const data = await searchProductService(searchText, categories);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in searchProduct controller:", error);
    res.status(500).json({ message: error.message || "Failed to search products." });
  }
};

const getVariantById = async (req, res) => {
  try {
    const { variantId } = req.params;
    const variant = await getVariantByIdService(variantId);
    res.status(200).json(variant);
  } catch (error) {
    console.error(`Error in getVariantById controller for ID ${req.params.variantId}:`, error);
    if (error.message.includes("not found") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to get variant." });
    }
  }
};

const updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const updateData = req.body;

    if (updateData.product !== undefined) {
      return res.status(400).json({ message: "Cannot change the parent product of a variant." });
    }

    const updatedVariant = await updateVariantService(variantId, updateData);
    res.status(200).json(updatedVariant);
  } catch (error) {
    console.error(`Error in updateVariant controller for ID ${req.params.variantId}:`, error);
    if (error.message.includes("not found") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message || "Failed to update variant." });
    }
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    await deleteVariantService(variantId);
    res.status(204).send();
  } catch (error) {
    console.error(`Error in deleteVariant controller for ID ${req.params.variantId}:`, error);
    if (error.message.includes("not found") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message || "Failed to delete variant." });
    }
  }
};

const updateVariantStock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { change } = req.body;

    if (change === undefined || typeof change !== 'number') {
      return res.status(400).json({ message: "Stock 'change' amount (number) is required in body." });
    }

    const updatedVariant = await updateVariantStockService(variantId, change);
    res.status(200).json(updatedVariant);

  } catch (error) {
    console.error(`Error in updateVariantStock controller for ID ${req.params.variantId}:`, error);
    if (error.message.includes("not found") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes("Stock cannot be negative")) {
      res.status(400).json({ message: error.message });
    }
    else {
      res.status(500).json({ message: error.message || "Failed to update variant stock." });
    }
  }
};

const addVariantToProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const variantData = req.body;

    if (!variantData.types || variantData.price === undefined || variantData.stock === undefined) {
      return res.status(400).json({ message: "Variant types, price, and stock are required." });
    }
    if (typeof variantData.price !== 'number' || variantData.price < 0) {
      return res.status(400).json({ message: "Variant price must be a non-negative number." });
    }
    if (typeof variantData.stock !== 'number' || variantData.stock < 0) {
      return res.status(400).json({ message: "Variant stock must be a non-negative number." });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID format." });
    }

    const newVariant = await addVariantToProductService(productId, variantData);

    res.status(201).json(newVariant);

  } catch (error) {
    console.error(`Error in addVariantToProduct controller for Product ${req.params.productId}:`, error);
    if (error.message.includes("not found") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message });
    } else if (error.name === 'ValidationError' || error.message.includes("required")) {
      res.status(400).json({ message: error.message });
    }
    else {
      res.status(500).json({ message: error.message || "Failed to add variant to product." });
    }
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const limit = req.query.limit;
    const featuredProducts = await getFeaturedProductsService(limit);
    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error("Error in getFeaturedProducts controller:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByName,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProduct,
  getVariantById,
  updateVariant,
  deleteVariant,
  updateVariantStock,
  addVariantToProduct,
  getFeaturedProducts,
};