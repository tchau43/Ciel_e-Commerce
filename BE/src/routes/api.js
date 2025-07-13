const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const { verifyToken, verifyAdmin } = require("../middleware/auth");

const {
  createUser,
  userLogin,
  getAllUsers,
  getUserById,
  updateUserbyId,
  getUserPurchased,
  getUsersPurchasedDetail,
  updateUserProfile,
  changePassword,
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
  getVariantById,
  updateVariant,
  deleteVariant,
  addVariantToProduct,
  updateVariantStock,
  getFeaturedProducts,
} = require("../controllers/productController");

const {
  getAllCategories,
  createCategory,
} = require("../controllers/categoryController");

const {
  removeAllProductsFromCart,
  addOrUpdateCartItem,
  getCartInfo,
} = require("../controllers/cartController");

const {
  createInvoice,
  getInvoice,
  updateInvoiceStatus,
  getAllInvoicesAdmin,
  getDeliveredProducts,
} = require("../controllers/invoiceController");

const {
  createReview,
  getReviewsForProduct,
} = require("../controllers/reviewController");

const {
  getUserRecommendations,
} = require("../controllers/recommendationsController");

const {
  getHomePage,
  updateBanner,
  updateVideo,
  updateFeature,
} = require("../controllers/customerHomePageController");

const {
  sendPaymentConfirmationEmail,
} = require("../controllers/emailController");
const {
  initiateStripePayment,
  handleStripeWebhook,
  checkPaymentStatus,
} = require("../controllers/stripeController");

const {
  createFaq,
  getAllFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
  getFaqsByCategory,
  getFaqsByCategorySlug,
  searchFaqs,
  getPopularFaqs,
  rateFaqHelpfulness,
} = require("../controllers/faqController");

const {
  createFaqCategory,
  getAllFaqCategories,
  getFaqCategoryById,
  getFaqCategoryBySlug,
  updateFaqCategory,
  deleteFaqCategory,
} = require("../controllers/faqCategoryController");

const { Product } = require("../models/product");
const {
  validateCouponForUser,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const {
  handleOpenAIChat,
  getChatHistory,
} = require("../controllers/openaiChatController");

const { getDeliveryFee } = require("../controllers/deliveryController");

const routerAPI = express.Router();

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next();
  }
};

// Public
routerAPI.post("/register", createUser);
routerAPI.post("/login", userLogin);

// Stripe webhook endpoint (must be public and raw body)
routerAPI.post("/stripe/webhook", handleStripeWebhook);

// Test endpoint to check payment status
routerAPI.get("/stripe/payment-status/:paymentIntentId", checkPaymentStatus);

routerAPI.get("/products", getAllProducts);
routerAPI.get("/products/featured", getFeaturedProducts);
routerAPI.get("/productsByCategory", getProductsByCategory);
routerAPI.get("/product/search", getProductsByName);
routerAPI.get("/productsBySearch", searchProduct);
routerAPI.get("/product/:id", getProductById);
routerAPI.get("/variants/:variantId", getVariantById);
routerAPI.get("/categories", getAllCategories);
routerAPI.get("/products/:productId/reviews", getReviewsForProduct);
routerAPI.get("/homepage", getHomePage);

routerAPI.get("/faqs", getAllFaqs);
routerAPI.get("/faqs/popular", getPopularFaqs);
routerAPI.get("/faqs/category/:category", getFaqsByCategory);
routerAPI.get("/faqs/category-slug/:slug", getFaqsByCategorySlug);
routerAPI.get("/faqs/search/:query", searchFaqs);
routerAPI.get("/faqs/:id", getFaqById);
routerAPI.post("/faqs/:id/rate", rateFaqHelpfulness);

routerAPI.get("/faq-categories", getAllFaqCategories);
routerAPI.get("/faq-categories/:id", getFaqCategoryById);
routerAPI.get("/faq-categories/slug/:slug", getFaqCategoryBySlug);

routerAPI.post("/delivery/calculate", getDeliveryFee);

routerAPI.post("/openai-chat", optionalAuth, handleOpenAIChat);
routerAPI.get("/chat/history/:threadId", optionalAuth, getChatHistory);

// User
routerAPI.use(verifyToken);

routerAPI.put("/user/profile", updateUserProfile);
routerAPI.put("/user/change-password", changePassword);
routerAPI.get("/user/:id", getUserById);
routerAPI.get("/user/:userId/purchased-products", getUserPurchased);
routerAPI.get("/user/:userId/delivered-products", getDeliveredProducts);
routerAPI.post("/invoice", createInvoice);
routerAPI.get("/invoice/:userId", getInvoice);
routerAPI.post("/invoice/initiate-stripe", initiateStripePayment);
routerAPI.post("/reviews", createReview);

routerAPI.post("/cart/item", addOrUpdateCartItem);
routerAPI.get("/cart/:userId", getCartInfo);
routerAPI.delete("/cart/:userId", removeAllProductsFromCart);

routerAPI.get("/recommendations", getUserRecommendations);

routerAPI.post("/email/payment/notify-success", sendPaymentConfirmationEmail);

routerAPI.get("/coupons/validate", validateCouponForUser);

routerAPI.post("/products/batch", async (req, res) => {
  try {
    const productIds = req.body.ids;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        message: "Request body must contain an array of product IDs.",
      });
    }

    const validIds = productIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    const products = await Product.find({ _id: { $in: validIds } })
      .populate("category", "name")
      .populate("brand", "name")
      .lean();

    res.status(200).json(products || []);
  } catch (error) {
    console.error("Error in /products/batch:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin
routerAPI.use(verifyAdmin);

routerAPI.get("/admin/users", getAllUsers);
routerAPI.put("/admin/updateUserById/:id", updateUserbyId);
routerAPI.get("/admin/users/purchases", getUsersPurchasedDetail);

routerAPI.post("/product", createProduct);
routerAPI.put("/product/:id", updateProduct);
routerAPI.delete("/product/:id", deleteProduct);
routerAPI.post("/products/:productId/variants", addVariantToProduct);
routerAPI.patch("/variants/:variantId", updateVariant);
routerAPI.patch("/variants/:variantId/stock", updateVariantStock);
routerAPI.delete("/variants/:variantId", deleteVariant);

routerAPI.post("/category", createCategory);

routerAPI.patch("/admin/invoices/:invoiceId/status", updateInvoiceStatus);
routerAPI.get("/admin/invoices", getAllInvoicesAdmin);

routerAPI.put("/homepage/banner", updateBanner);
routerAPI.put("/homepage/video", updateVideo);
routerAPI.put("/homepage/feature", updateFeature);

routerAPI.post("/admin/coupons", createCoupon);
routerAPI.get("/admin/coupons", getAllCoupons);
routerAPI.get("/admin/coupons/:id", getCouponById);
routerAPI.patch("/admin/coupons/:id", updateCoupon);
routerAPI.delete("/admin/coupons/:id", deleteCoupon);

routerAPI.post("/admin/faqs", createFaq);
routerAPI.put("/admin/faqs/:id", updateFaq);
routerAPI.delete("/admin/faqs/:id", deleteFaq);

routerAPI.post("/admin/faq-categories", createFaqCategory);
routerAPI.put("/admin/faq-categories/:id", updateFaqCategory);
routerAPI.delete("/admin/faq-categories/:id", deleteFaqCategory);

module.exports = routerAPI;
