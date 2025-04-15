const express = require("express");
const {
  createUser,
  userLogin,
  getAllUsers,
  getUserById,
  updateUserbyId,
  getUserPurchased,
  getUsersPurchasedDetail,
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
const {
  getUserRecommendations,
} = require("../controllers/recommendationsController");
const { Product } = require("../models/product");
const upload = require("../middleware/multer");
const {
  getHomePage,
  updateBanner,
  updateVideo,
  updateFeature,
} = require("../controllers/customerHomePageController");
const { getChatbotResponse } = require("../controllers/chatController");
const {
  sendPaymentConfirmationEmail,
} = require("../controllers/emailController");
const { initiateStripePayment } = require("../controllers/stripeController"); // <-- Import the new function


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
routerAPI.put("/product/:id", upload.single("image"), updateProduct);
routerAPI.delete("/product/:id", deleteProduct);

//cart
routerAPI.post("/cart/updateCart", updateProductToCart);
routerAPI.post("/cart/addToCart", addProductToCart);
routerAPI.get("/cart/:userId", getCartInfor);
routerAPI.delete("/cart/:userId", removeAllProductsFromCart);

//invoice
routerAPI.post("/invoice", createInvoice);
routerAPI.get("/invoice/:userId", getInvoice);
routerAPI.post("/invoice/initiate-stripe", initiateStripePayment); // <-- DEFINE NEW ROUTE
routerAPI.get("/user/:userId/purchased-products", getUserPurchased);

// New route for recommendations
routerAPI.get("/recommendations", getUserRecommendations);
// routerAPI.get("/recommendations", apiKeyAuth, getUserRecommendations);
// Get all user purchases (for collaborative filtering)
routerAPI.get("/admin/users/purchases", getUsersPurchasedDetail);

// Batch product details endpoint
routerAPI.post("/products/batch", async (req, res) => { // <--- Defined as GET
  try {
    const productIds = req.body.ids; // <--- Tries to read from request BODY
    const products = await Product.find({
      _id: { $in: productIds },
    });
    // Check if products were found (optional but good practice)
    if (!products) {
      return res.status(404).json({ message: "No products found for the given IDs" });
    }
    res.status(200).json(products);
  } catch (error) {
    // Log the error for debugging
    console.error("Error in /products/batch:", error);
    res.status(500).json({ message: error.message });
  }
});

// Routes for homepage configuration
routerAPI.get("/homepage", getHomePage); // Get homepage
routerAPI.put("/homepage/banner", updateBanner); // Update Banner
routerAPI.put("/homepage/video", updateVideo); // Update Video
routerAPI.put("/homepage/feature", updateFeature); // Update Feature

//chatgpt api integrate
routerAPI.post("/chat", getChatbotResponse);

// Email Trigger Route
routerAPI.post("/email/payment/notify-success", sendPaymentConfirmationEmail); // Add this route

module.exports = routerAPI;
