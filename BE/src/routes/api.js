// routes/api.js
// Main application router after refactoring to separate Variant collection

const express = require("express");
const path = require("path"); // Keep if needed elsewhere, not directly used here
const upload = require("../middleware/multer"); // Multer for file uploads

// --- Middleware ---
const { verifyToken, verifyAdmin } = require("../middleware/auth"); // Auth middleware

// --- Controllers ---
const {
  createUser,
  userLogin,
  getAllUsers,
  getUserById,
  updateUserbyId,
  getUserPurchased,
  getUsersPurchasedDetail,
} = require("../controllers/userController");

const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByName,
  updateProduct, // Updates core Product fields ONLY
  deleteProduct, // Deletes Product AND its Variants
  getProductsByCategory,
  searchProduct,
  // Variant specific controllers:
  getVariantById,
  updateVariant,
  deleteVariant,
  addVariantToProduct,
  updateVariantStock,
} = require("../controllers/productController"); // Includes variant controllers now

const {
  getAllCategories,
  createCategory,
} = require("../controllers/categoryController");

const {
  removeAllProductsFromCart,
  addOrUpdateCartItem,
  getCartInfo,
} = require("../controllers/cartController"); // Review cart logic post-refactor if needed

const {
  createInvoice,
  getInvoice,
  updateInvoiceStatus,
} = require("../controllers/invoiceController");

const {
  createReview,
  getReviewsForProduct
} = require("../controllers/reviewController");

const {
  getUserRecommendations,
} = require("../controllers/recommendationsController");

const {
  getHomePage,
  updateBanner,
  updateVideo,
  updateFeature,
} = require("../controllers/customerHomePageController"); // Assuming admin protected?

const { sendPaymentConfirmationEmail } = require("../controllers/emailController");
const { initiateStripePayment } = require("../controllers/stripeController");

// Import models only if directly used (like in /products/batch)
const { Product } = require("../models/product");
const { validateCouponForUser, createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon } = require("../controllers/couponController");
const { handleChatbotQuery } = require("../controllers/chatbotController");


// --- Router Definition ---
const routerAPI = express.Router();


// === PUBLIC ROUTES (No Token Required) ===
routerAPI.post("/register", createUser);
routerAPI.post("/login", userLogin);
// Publicly accessible read routes for products/categories/reviews
routerAPI.get("/products", getAllProducts);
routerAPI.get("/productsByCategory", getProductsByCategory);
routerAPI.get("/product/search", getProductsByName); // Consider renaming route for clarity?
routerAPI.get("/productsBySearch", searchProduct);
routerAPI.get("/product/:id", getProductById); // Gets product with populated variants
routerAPI.get("/variants/:variantId", getVariantById); // Gets specific variant details
routerAPI.get("/categories", getAllCategories);
routerAPI.get("/products/:productId/reviews", getReviewsForProduct); // Get reviews for a product
routerAPI.get("/homepage", getHomePage); // Get public homepage config


// === AUTHENTICATED ROUTES (Token Required for all routes below) ===
routerAPI.use(verifyToken);

// ... AUTHENTICATED ROUTES ...
routerAPI.post("/chatbot/query", handleChatbotQuery);

// --- User Routes (Authenticated) ---
routerAPI.get("/user/:id", getUserById); // Get own or other user's public profile? Check service logic
routerAPI.get("/user/:userId/purchased-products", getUserPurchased); // Likely needs userId check against req.user.id
routerAPI.post("/invoice", createInvoice); // User creates their own invoice
routerAPI.get("/invoice/:userId", getInvoice); // User gets their own invoices (needs userId check)
routerAPI.post("/invoice/initiate-stripe", initiateStripePayment); // User initiates payment
routerAPI.post("/reviews", createReview); // User creates a review

// --- Cart Routes (Authenticated) ---
routerAPI.post("/cart/item", addOrUpdateCartItem);   // Single endpoint for add/update/remove
routerAPI.get("/cart/:userId", getCartInfo);        // User gets their own cart
routerAPI.delete("/cart/:userId", removeAllProductsFromCart);

// --- Recommendation Route (Authenticated) ---
routerAPI.get("/recommendations", getUserRecommendations); // Needs user context from req.user

// --- Email Route (Potentially internal/webhook, or needs specific auth) ---
routerAPI.post("/email/payment/notify-success", sendPaymentConfirmationEmail);

// Add route for user to validate a coupon code before applying at checkout
routerAPI.get("/coupons/validate", validateCouponForUser);

// --- Batch Product Route (Authenticated - useful for Cart/Wishlist hydration) ---
// Use POST for sending a list of IDs in the body
routerAPI.post("/products/batch", async (req, res) => {
  try {
    const productIds = req.body.ids;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Request body must contain an array of product IDs." });
    }
    // Validate IDs?
    const validIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const products = await Product.find({ _id: { $in: validIds } })
      .populate('category', 'name')
      .populate('brand', 'name')
      .lean(); // Fetch necessary fields

    res.status(200).json(products || []); // Return empty array if no matches
  } catch (error) {
    console.error("Error in /products/batch:", error);
    res.status(500).json({ message: error.message });
  }
});


// === ADMIN ROUTES (Token and Admin Role Required) ===
routerAPI.use(verifyAdmin); // Apply Admin check for all routes below

// --- Admin: User Management ---
routerAPI.get("/admin/users", getAllUsers);
routerAPI.put("/admin/updateUserById/:id", updateUserbyId);
routerAPI.get("/admin/users/purchases", getUsersPurchasedDetail);

// --- Admin: Product & Variant Management ---
routerAPI.post("/product", createProduct); // Renamed from /admin/product for consistency?
routerAPI.put("/product/:id", updateProduct); // Updates only core product fields
routerAPI.delete("/product/:id", deleteProduct);
routerAPI.post("/products/:productId/variants", addVariantToProduct); // Add new variant to existing product
routerAPI.patch("/variants/:variantId", updateVariant); // Update variant details (price, types, stock)
routerAPI.patch("/variants/:variantId/stock", updateVariantStock); // Specific stock update
routerAPI.delete("/variants/:variantId", deleteVariant);

// --- Admin: Category Management ---
routerAPI.post("/category", createCategory); // Was public, should likely be admin

// --- Admin: Invoice Management ---
routerAPI.patch("/admin/invoices/:invoiceId/status", updateInvoiceStatus); // Corrected Path
// Could add routes for admin to view all invoices etc.

// --- Admin: Homepage Management ---
// Assuming these need admin rights
routerAPI.put("/homepage/banner", updateBanner);
routerAPI.put("/homepage/video", updateVideo);
routerAPI.put("/homepage/feature", updateFeature);

// --- Admin: Coupon Management ---
routerAPI.post("/admin/coupons", createCoupon);
routerAPI.get("/admin/coupons", getAllCoupons);
routerAPI.get("/admin/coupons/:id", getCouponById);
routerAPI.patch("/admin/coupons/:id", updateCoupon); // Use PATCH for partial updates
routerAPI.delete("/admin/coupons/:id", deleteCoupon);
// --- END ADMIN ROUTES ---


module.exports = routerAPI;