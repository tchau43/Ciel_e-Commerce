const express = require("express");
const {
  createUser,
  userLogin,
  getAllUsers,
  getUserById,
  updateUserbyId,
} = require("../controllers/userController");
// const multer = require('multer');
const path = require("path");
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByName,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProduct,
} = require("../controllers/productController");
const { verifyToken, apiKeyAuth } = require("../middleware/auth");
const {
  getAllCategories,
  createCategory,
} = require("../controllers/categoryController");
const {
  updateProductToCart,
  getCartInfor,
  addProductToCart,
  removeAllProductsFromCart,
} = require("../controllers/cartController");
const {
  createInvoice,
  getInvoice,
} = require("../controllers/invoiceController");
const { createPaymentIntent } = require("../controllers/stripeController");
const {
  getUserRecommendations,
} = require("../controllers/recommendationsController");
const { getInvoiceService } = require("../services/invoiceService");
const User = require("../models/user");
const Invoice = require("../models/invoice");
const Product = require("../models/product");
const { uploadImageService } = require("../services/utilsService");
const upload = require("../middleware/multer");

// Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log(">>>>>>>>>> __dirname", __dirname)
//     const uploadPath = path.join(__dirname, '../public/images/product')
//     console.log(">>>>>>>>>> __dirname", path.join(__dirname, '../public/images/product'))
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({ storage });

const routerAPI = express.Router();

routerAPI.all("*", verifyToken);

//route for register - login
routerAPI.post("/register", createUser);
routerAPI.post("/login", userLogin);

//route for admin
routerAPI.get("/admin/users", getAllUsers);
routerAPI.put("/admin/updateUserById/:id", updateUserbyId);

//route for user
routerAPI.get("/user/:id", getUserById);

//category
routerAPI.get("/categories", getAllCategories);
routerAPI.post("/category", createCategory);

//product
routerAPI.get("/products", getAllProducts);
routerAPI.get("/productsByCategory", getProductsByCategory);
routerAPI.get("/product/:id", getProductById);
routerAPI.get("/product", getProductsByName);
routerAPI.get("/productsBySearch", searchProduct);
routerAPI.post("/product", createProduct);
routerAPI.put(
  "/product/:id",
  (req, res, next) => {
    console.log("Request received:", req.headers);
    next();
  },
  upload.single("image"),
  updateProduct
);
// routerAPI.put("/product/:id", upload.single("image"), updateProduct);
routerAPI.delete("/product/:id", deleteProduct);

//cart
routerAPI.post("/cart/updateCart", updateProductToCart);
routerAPI.post("/cart/addToCart", addProductToCart);
routerAPI.get("/cart/:userId", getCartInfor);
routerAPI.delete("/cart/:userId", removeAllProductsFromCart);

//invoice
routerAPI.post("/invoice", createInvoice);
routerAPI.get("/invoice/:userId", getInvoice);
routerAPI.post("/invoice/stripe", createPaymentIntent); // routes/api.js
routerAPI.get("/user/:userId/purchased-products", async (req, res) => {
  try {
    const invoices = await getInvoiceService(req.params.userId);
    const purchasedProducts = [];

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        purchasedProducts.push({
          productId: item.product._id,
          categoryId: item.product.category._id,
        });
      });
    });

    res.status(200).json(purchasedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// New route for recommendations
routerAPI.get("/recommendations", getUserRecommendations);
// routerAPI.get("/recommendations", apiKeyAuth, getUserRecommendations);
// Get all user purchases (for collaborative filtering)
routerAPI.get("/admin/users/purchases", async (req, res) => {
  try {
    // console.log("===1")

    const users = await User.find().lean();
    const purchases = {};
    // console.log("===2")

    for (const user of users) {
      const invoices = await Invoice.find({ user: user._id }).populate(
        "items.product"
      );

      purchases[user._id] = {};
      invoices.forEach((invoice) => {
        invoice.items.forEach((item) => {
          const productId = item.product._id.toString();
          purchases[user._id][productId] = purchases[user._id][productId]
            ? purchases[user._id][productId] + 1
            : 1;
        });
      });
    }
    // console.log("===purchases", purchases)

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Batch product details endpoint
routerAPI.post("/products/batch", async (req, res) => {
  try {
    const productIds = req.body.ids;
    const products = await Product.find({
      _id: { $in: productIds },
    });
    console.log("===products", products);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add upload endpoint
// routerAPI.post('/upload', upload.single('image'), uploadImageService);

module.exports = routerAPI;
