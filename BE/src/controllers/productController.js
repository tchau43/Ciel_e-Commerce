const {
  createProductService,
  deleteProductService,
  getAllProductsService,
  getProductByIdService,
  getProductsByNameService,
  updateProductService,
  getProductsByCategoryService,
  searchProductService,
} = require("../services/productService");

const createProduct = async (req, res) => {
  const productData = req.body;
  const data = await createProductService(productData);
  res.status(200).json(data);
};

const getAllProducts = async (req, res) => {
  const { sort } = req.query;
  const data = await getAllProductsService(sort);
  res.status(200).json(data);
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  // console.log("id", id)
  const data = await getProductByIdService(id);
  res.status(200).json(data);
};

const getProductsByName = async (req, res) => {
  // console.log("req", req)
  const { name } = req.query;
  // console.log("name", name)
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
  // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>req.body1", req)
  const { id } = req.params;
  try {
    // const productData = {
    //   ...req.body,
    //   // Handle image path from Multer
    //   ...(req.file && {
    //     images: [...JSON.parse(req.body.images || "[]"), req.file.path],
    //   }),
    // };
    const productData = req.body;

    // console.log(">>>>>>>>>>>>>> productData", productData);

    const data = await updateProductService(id, productData);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const productData = {
      ...req.body,
      // Handle image path from Multer
      ...(req.file && {
        images: [...JSON.parse(req.body.images || "[]"), req.file.path],
      }),
    };

    const data = await updateProductService(id, productData);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductsByCategory = async (req, res) => {
  // console.log("req", req)
  const { category } = req.query; // Categories will come as an array of category IDs
  console.log("category", category);
  if (!category) {
    return res.status(400).json({ message: "No categories selected." });
  }
  const categoryIds = Array.isArray(category) ? category : category.split(",");
  const data = await getProductsByCategoryService(categoryIds);
  // console.log("data", data)
  res.status(200).json(data);
};

// const searchProduct = async (req, res) => {
//   const { searchText } = req.query;
//   console.log("searchText", searchText)
//   const data = await searchProductService(searchText);
//   res.status(200).json(data);
// };

const searchProduct = async (req, res) => {
  const { searchText, category } = req.query;

  // Convert category to array if present
  const categories = category
    ? Array.isArray(category)
      ? category
      : category.split(",")
    : [];

  try {
    // Handle case where both searchText and category are empty
    if (!searchText && categories.length === 0) {
      return res.status(400).json({
        message: "Please provide search text or select categories",
      });
    }

    const data = await searchProductService(searchText, categories);
    res.status(200).json(data);
  } catch (error) {
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
};
