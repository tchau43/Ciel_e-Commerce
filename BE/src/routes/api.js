const express = require("express");
const {
  createUser,
  userLogin,
  getAllUsers,
  getUserById,
  updateUserbyId,
} = require("../controllers/userController");

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
const verifyToken = require("../middleware/auth");
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
routerAPI.put("/product/:id", updateProduct);
routerAPI.delete("/product/:id", deleteProduct);

//cart
routerAPI.post("/cart/updateCart", updateProductToCart);
routerAPI.post("/cart/addToCart", addProductToCart);
routerAPI.get("/cart/:userId", getCartInfor);
routerAPI.delete("/cart/:userId", removeAllProductsFromCart);

//invoice
routerAPI.post("/invoice", createInvoice);
routerAPI.get("/invoice/:userId", getInvoice);
routerAPI.post("/invoice/stripe", createPaymentIntent);

module.exports = routerAPI;
