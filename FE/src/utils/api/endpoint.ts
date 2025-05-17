// src/utils/api/endpoint.ts

const VITE_API_VERSION = import.meta.env.VITE_API_VERSION || "/v1"; // Default to "/v1" - This is CORRECT based on your appConfig.js

export const API_ENDPOINTS = {
  // --- Auth ---
  LOGIN: `${VITE_API_VERSION}/login`, // POST
  REGISTER: `${VITE_API_VERSION}/register`, // POST
  // LOGOUT: `${VITE_API_VERSION}/users/logout`, // No BE route, handled client-side

  // --- User ---
  USER: (id: string) => `${VITE_API_VERSION}/user/${id}`, // GET (Auth required)
  USER_PURCHASES: (userId: string) =>
    `${VITE_API_VERSION}/user/${userId}/purchased-products`, // GET (Auth required)
  USER_DELIVERED_PRODUCTS: (userId: string) =>
    `${VITE_API_VERSION}/user/${userId}/delivered-products`, // GET (Auth required)
  // INFO: `${VITE_API_VERSION}/users/info`, // No specific BE route, use USER

  // --- Products ---
  PRODUCTS: `${VITE_API_VERSION}/products`, // GET
  PRODUCT_BY_ID: (id: string) => `${VITE_API_VERSION}/product/${id}`, // GET
  PRODUCTS_BY_CATEGORY: `${VITE_API_VERSION}/productsByCategory`, // GET (Query params expected)
  PRODUCTS_BY_SEARCH_NAME: `${VITE_API_VERSION}/product/searchName`, // GET (Query param 'name')
  PRODUCTS_BY_SEARCH_TERM: `${VITE_API_VERSION}/productsBySearch`, // GET (Query param 'searchTerm')
  PRODUCTS_BATCH: `${VITE_API_VERSION}/products/batch`, // POST (Auth required, expects { ids: [...] } in body)
  FEATURED_PRODUCTS: `${VITE_API_VERSION}/products/featured`, // GET (Optional query param 'limit')

  // --- Variants ---
  VARIANT_BY_ID: (variantId: string) =>
    `${VITE_API_VERSION}/variants/${variantId}`, // GET

  // --- Categories ---
  CATEGORIES: `${VITE_API_VERSION}/categories`, // GET

  // --- FAQs ---
  FAQS: `${VITE_API_VERSION}/faqs`, // GET
  FAQ_BY_ID: (id: string) => `${VITE_API_VERSION}/faqs/${id}`, // GET
  FAQS_BY_CATEGORY: (category: string) =>
    `${VITE_API_VERSION}/faqs/category/${category}`, // GET - Có thể dùng tên hoặc ID
  FAQS_SEARCH: (query: string) => `${VITE_API_VERSION}/faqs/search/${query}`, // GET
  FAQS_POPULAR: `${VITE_API_VERSION}/faqs/popular`, // GET
  FAQ_RATE: (id: string) => `${VITE_API_VERSION}/faqs/${id}/rate`, // POST

  // --- Reviews ---
  REVIEWS_BY_PRODUCT: (productId: string) =>
    `${VITE_API_VERSION}/products/${productId}/reviews`, // GET
  CREATE_REVIEW: `${VITE_API_VERSION}/reviews`, // POST (Auth required)

  // --- Cart ---
  // Note: Backend uses one endpoint for add/update/remove
  CART_ITEM: `${VITE_API_VERSION}/cart/item`, // POST (Auth required - Replaces ADD_TO_CART & UPDATE_CART)
  CART: (userId: string) => `${VITE_API_VERSION}/cart/${userId}`, // GET (Auth required)
  DELETE_CART: (userId: string) => `${VITE_API_VERSION}/cart/${userId}`, // DELETE (Auth required)

  // --- Invoice / Order ---
  INVOICE: `${VITE_API_VERSION}/invoice`, // POST (Auth required - For creating order)
  GET_INVOICE: (userId: string) => `${VITE_API_VERSION}/invoice/${userId}`, // GET (Auth required)
  INITIATE_STRIPE_PAYMENT: `${VITE_API_VERSION}/invoice/initiate-stripe`, // POST (Auth required)

  // --- Recommendations ---
  RECOMMENDATIONS: `${VITE_API_VERSION}/recommendations`, // GET (Auth required - userId likely from token)

  // --- Homepage ---
  CUSTOMER_HOME_PAGE: `${VITE_API_VERSION}/homepage`, // GET

  // --- Coupons ---
  VALIDATE_COUPON: `${VITE_API_VERSION}/coupons/validate`, // GET (Auth required, query param 'couponCode')

  // --- Email ---
  // Likely internal/webhook, not called directly from FE
  SEND_EMAIL: `${VITE_API_VERSION}/email/payment/notify-success`, // POST (Auth required)

  // --- Chatbot ---
  CHATBOT: `${VITE_API_VERSION}/openai-chat`, // POST (Auth required)

  // --- Admin: User Management ---
  ADMIN_USERS: `${VITE_API_VERSION}/admin/users`, // GET (Admin required)
  ADMIN_UPDATE_USER: (id: string) =>
    `${VITE_API_VERSION}/admin/updateUserById/${id}`, // PUT (Admin required)
  ADMIN_USER_PURCHASES_DETAIL: `${VITE_API_VERSION}/admin/users/purchases`, // GET (Admin required)

  // --- Admin: Product & Variant Management ---
  ADMIN_CREATE_PRODUCT: `${VITE_API_VERSION}/product`, // POST (Admin required)
  ADMIN_UPDATE_PRODUCT: (id: string) => `${VITE_API_VERSION}/product/${id}`, // PUT (Admin required)
  ADMIN_DELETE_PRODUCT: (id: string) => `${VITE_API_VERSION}/product/${id}`, // DELETE (Admin required)
  ADMIN_ADD_VARIANT: (productId: string) =>
    `${VITE_API_VERSION}/products/${productId}/variants`, // POST (Admin required)
  ADMIN_UPDATE_VARIANT: (variantId: string) =>
    `${VITE_API_VERSION}/variants/${variantId}`, // PATCH (Admin required)
  ADMIN_UPDATE_VARIANT_STOCK: (variantId: string) =>
    `${VITE_API_VERSION}/variants/${variantId}/stock`, // PATCH (Admin required)
  ADMIN_DELETE_VARIANT: (variantId: string) =>
    `${VITE_API_VERSION}/variants/${variantId}`, // DELETE (Admin required)

  // --- Admin: Category Management ---
  ADMIN_CREATE_CATEGORY: `${VITE_API_VERSION}/category`, // POST (Admin required)

  // --- Admin: Invoice Management ---
  ADMIN_UPDATE_INVOICE_STATUS: (invoiceId: string) =>
    `${VITE_API_VERSION}/admin/invoices/${invoiceId}/status`, // PATCH (Admin required)
  ADMIN_GET_ALL_INVOICES: `${VITE_API_VERSION}/admin/invoices`, // GET (Admin required, hỗ trợ query params: searchTerm, page, limit, sortBy, sortOrder) // <-- Endpoint mới

  // --- Admin: Homepage Management ---
  ADMIN_UPDATE_BANNER: `${VITE_API_VERSION}/homepage/banner`, // PUT (Admin required)
  ADMIN_UPDATE_VIDEO: `${VITE_API_VERSION}/homepaginvoicee/video`, // PUT (Admin required)
  ADMIN_UPDATE_FEATURE: `${VITE_API_VERSION}/homepage/feature`, // PUT (Admin required)

  // --- Admin: Coupon Management ---
  ADMIN_CREATE_COUPON: `${VITE_API_VERSION}/admin/coupons`, // POST (Admin required)
  ADMIN_GET_ALL_COUPONS: `${VITE_API_VERSION}/admin/coupons`, // GET (Admin required)
  ADMIN_GET_COUPON_BY_ID: (id: string) =>
    `${VITE_API_VERSION}/admin/coupons/${id}`, // GET (Admin required)
  ADMIN_UPDATE_COUPON: (id: string) =>
    `${VITE_API_VERSION}/admin/coupons/${id}`, // PATCH (Admin required)
  ADMIN_DELETE_COUPON: (id: string) =>
    `${VITE_API_VERSION}/admin/coupons/${id}`, // DELETE (Admin required)

  // --- Admin: FAQ Management ---
  ADMIN_CREATE_FAQ: `${VITE_API_VERSION}/admin/faqs`, // POST (Admin required)
  ADMIN_UPDATE_FAQ: (id: string) => `${VITE_API_VERSION}/admin/faqs/${id}`, // PUT (Admin required)
  ADMIN_DELETE_FAQ: (id: string) => `${VITE_API_VERSION}/admin/faqs/${id}`, // DELETE (Admin required)

  // --- Admin: Reviews ---
  // ADMIN_ALL_REVIEWS: `${VITE_API_VERSION}/admin/all-comments`, // Path '/admin/all-comments' not found in api.js
};
