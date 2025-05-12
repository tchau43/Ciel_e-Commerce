// controllers/productController.js
// Handles CRUD for Products AND individual Variants after schema refactor

const { default: mongoose } = require("mongoose");
const { createProductService, getAllProductsService, getProductByIdService, getProductsByNameService, updateProductService, deleteProductService, getProductsByCategoryService, searchProductService, getVariantByIdService, updateVariantService, deleteVariantService, updateVariantStockService, addVariantToProductService, getFeaturedProductsService } = require("../services/productService");

// Import all service functions under a namespace for clarity

// --- PRODUCT CONTROLLERS ---

const createProduct = async (req, res) => {
  // Service now handles creating Product then associated Variants
  const productData = req.body; // Expects optional 'variants' array [{types, price, stock}]
  try {
    // Basic validation
    if (!productData.name || productData.base_price === undefined || productData.base_price < 0) {
      return res.status(400).json({ message: "Product name and valid base_price are required." });
    }
    // TODO: Add validation for the structure of productData.variants if present

    const data = await createProductService(productData);
    // Service returns the created product document (with variants as an array of ObjectIds)
    res.status(201).json(data);
  } catch (error) {
    console.error("Error in createProduct controller:", error);
    res.status(400).json({ message: error.message || "Failed to create product." });
  }
};

const getAllProducts = async (req, res) => {
  // Service returns products without populated variants
  try {
    const { sort } = req.query;
    const data = await getAllProductsService(sort);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getAllProducts controller:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve products." });
  }
};

const getProductById = async (req, res) => {
  // Service now fetches product AND populates its variants array
  try {
    const { id } = req.params;
    const data = await getProductByIdService(id); // Returns { ...product, variants: [...] }
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
  // Service returns products without populated variants
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
  // IMPORTANT: This endpoint ONLY updates core Product fields (name, desc, category, etc.)
  // It specifically ignores/rejects 'variants' array in the body.
  const { id } = req.params;
  const productData = req.body;
  try {
    // Validation: Prevent accidental variant updates via this route
    if (productData.variants !== undefined) {
      return res.status(400).json({ message: "Cannot update variants via this endpoint. Use specific /variants/:variantId routes." });
    }
    // Validation: Prevent direct rating updates
    if (productData.averageRating !== undefined || productData.numberOfReviews !== undefined) {
      return res.status(400).json({ message: "Cannot update rating fields directly." });
    }

    const data = await updateProductService(id, productData);
    res.status(200).json(data); // Returns updated product (without populated variants)
  } catch (error) {
    console.error(`Error in updateProduct controller for ID ${req.params.id}:`, error);
    if (error.message.includes("not found") || error.message.startsWith("Category") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message }); // 404 or 400 depending on error type
    } else {
      res.status(500).json({ message: error.message || "Failed to update product." });
    }
  }
};

const deleteProduct = async (req, res) => {
  // Service now deletes the product AND its associated variants
  try {
    const { id } = req.params;
    await deleteProductService(id);
    res.status(204).send(); // No Content indicates successful deletion
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
  // Service returns products without populated variants
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
  // Service returns products without populated variants
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


// --- VARIANT-SPECIFIC CONTROLLERS ---

// GET /variants/:variantId
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

// PATCH /variants/:variantId
const updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const updateData = req.body; // Contains fields like types, price, stock to update

    // Add basic validation as needed (e.g., check price/stock format)
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

// DELETE /variants/:variantId
const deleteVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    await deleteVariantService(variantId); // Service handles removing ref from Product too
    res.status(204).send(); // No content on successful delete
  } catch (error) {
    console.error(`Error in deleteVariant controller for ID ${req.params.variantId}:`, error);
    if (error.message.includes("not found") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message || "Failed to delete variant." });
    }
  }
};

// PATCH /variants/:variantId/stock - Example for specific field update
const updateVariantStock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { change } = req.body; // Expecting body like { "change": -2 } or { "change": 10 }

    if (change === undefined || typeof change !== 'number') {
      return res.status(400).json({ message: "Stock 'change' amount (number) is required in body." });
    }

    const updatedVariant = await updateVariantStockService(variantId, change);
    res.status(200).json(updatedVariant); // Return updated variant with new stock

  } catch (error) {
    console.error(`Error in updateVariantStock controller for ID ${req.params.variantId}:`, error);
    if (error.message.includes("not found") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes("Stock cannot be negative")) {
      res.status(400).json({ message: error.message }); // Bad request if update leads to invalid state
    }
    else {
      res.status(500).json({ message: error.message || "Failed to update variant stock." });
    }
  }
};

// --- ADD Controller to Add a Variant to an Existing Product ---
// POST /products/:productId/variants
const addVariantToProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const variantData = req.body; // Should contain types, price, stock

    // --- Basic Validation ---
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
    // --- End Validation ---

    // --- Call the Service Function ---
    const newVariant = await addVariantToProductService(productId, variantData);
    // --- Service handles DB operations ---

    res.status(201).json(newVariant); // Return the newly created variant

  } catch (error) {
    console.error(`Error in addVariantToProduct controller for Product ${req.params.productId}:`, error);
    if (error.message.includes("not found") || error.message.includes("Invalid")) {
      res.status(404).json({ message: error.message }); // Use 404 if product not found
    } else if (error.name === 'ValidationError' || error.message.includes("required")) {
      res.status(400).json({ message: error.message }); // Use 400 for validation errors
    }
    else {
      res.status(500).json({ message: error.message || "Failed to add variant to product." });
    }
  }
};

// --- GET FEATURED PRODUCTS ---
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = req.query.limit; // Lấy tham số limit từ query string
    const featuredProducts = await getFeaturedProductsService(limit);
    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error("Error in getFeaturedProducts controller:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  // Product specific
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByName,
  updateProduct, // Updates Product ONLY
  deleteProduct, // Deletes Product AND its Variants
  getProductsByCategory,
  searchProduct,
  // Variant specific
  getVariantById,
  updateVariant,
  deleteVariant,
  updateVariantStock,
  addVariantToProduct, // Added controller for adding variant
  getFeaturedProducts, // Thêm vào exports
};