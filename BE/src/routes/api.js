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
const { getAllCategories } = require("../controllers/categoryController");

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

//product
routerAPI.get("/products", getAllProducts);
routerAPI.get("/productsByCategory", getProductsByCategory);
routerAPI.get("/product/:id", getProductById);
routerAPI.get("/product", getProductsByName);
routerAPI.post("/product", createProduct);
routerAPI.put("/product/:id", updateProduct);
routerAPI.delete("/product/:id", deleteProduct);

module.exports = routerAPI;
