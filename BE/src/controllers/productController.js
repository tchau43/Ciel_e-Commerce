const {
  createProductService,
  deleteProductService,
  getAllProductsService,
  getProductByIdService,
  getProductsByNameService,
  updateProductService,
} = require("../services/productService");

const createProduct = async (req, res) => {
  const productData = req.body;
  const data = await createProductService(productData);
  res.status(200).json(data);
};

const getAllProducts = async (req, res) => {
  const data = await getAllProductsService();
  res.status(200).json(data);
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  const data = await getProductByIdService(id);
  res.status(200).json(data);
};

const getProductsByName = async (req, res) => {
  const { name } = req.query; // Assuming the search term is passed as a query parameter
  if (!name) {
    return res.status(400).json({ message: "Keyword is required for search" });
  }

  try {
    const data = await getProductsByNameService(name);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const productData = req.body;
  const data = await updateProductService(id, productData);
  res.status(200).json(data);
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const data = await deleteProductService(id);
  res.status(200).json(data);
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByName,
  updateProduct,
  deleteProduct,
};
