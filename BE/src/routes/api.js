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
} = require("../controllers/productController");
// const delay = require("../middleware/delay");
const verifyToken = require("../middleware/auth");
const {
  getAllCategories,
  createCategory,
} = require("../controllers/categoryController");
const {
  updateProductToCart,
  getCartInfor,
  addProductToCart,
} = require("../controllers/cartController");
const { createInvoice } = require("../controllers/invoiceController");
const {
  stripePayment,
  createPaymentIntent,
} = require("../controllers/stripeController");

const routerAPI = express.Router();

routerAPI.all("*", verifyToken);

// routerAPI.get("/", (req, res) => {
//     return res.status(200).json("Hello API");
// })

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
routerAPI.post("/product", createProduct);
routerAPI.put("/product/:id", updateProduct);
routerAPI.delete("/product/:id", deleteProduct);

//cart
routerAPI.post("/cart/updateCart", updateProductToCart);
routerAPI.post("/cart/addToCart", addProductToCart);
routerAPI.get("/cart/:userId", getCartInfor);

//invoice
routerAPI.post("/invoice/create", createInvoice);
routerAPI.post("/invoice/stripe", createPaymentIntent);

module.exports = routerAPI;
