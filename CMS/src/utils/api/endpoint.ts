const VITE_API_VERSION = import.meta.env.VITE_API_VERSION || "/v1";

export const API_ENDPOINTS = {
  LOGIN: `${VITE_API_VERSION}/login`,
  REGISTER: `${VITE_API_VERSION}/register`,

  USER: (id: string) => `${VITE_API_VERSION}/user/${id}`,
  UPDATE_USER: (id: string) => `${VITE_API_VERSION}/admin/updateUserById/${id}`,
  USER_PURCHASES: (userId: string) =>
    `${VITE_API_VERSION}/user/${userId}/purchased-products`,
  USER_DELIVERED_PRODUCTS: (userId: string) =>
    `${VITE_API_VERSION}/user/${userId}/delivered-products`,

  PRODUCTS: `${VITE_API_VERSION}/products`,
  PRODUCT_BY_ID: (id: string) => `${VITE_API_VERSION}/product/${id}`,
  PRODUCTS_BY_CATEGORY: `${VITE_API_VERSION}/productsByCategory`,
  PRODUCTS_BY_SEARCH_NAME: `${VITE_API_VERSION}/product/search`,
  PRODUCTS_BY_SEARCH_TERM: `${VITE_API_VERSION}/productsBySearch`,
  PRODUCTS_BATCH: `${VITE_API_VERSION}/products/batch`,
  FEATURED_PRODUCTS: `${VITE_API_VERSION}/products/featured`,

  VARIANT_BY_ID: (variantId: string) =>
    `${VITE_API_VERSION}/variants/${variantId}`,

  CATEGORIES: `${VITE_API_VERSION}/categories`,

  FAQS: `${VITE_API_VERSION}/faqs`,
  FAQ_BY_ID: (id: string) => `${VITE_API_VERSION}/faqs/${id}`,
  FAQS_BY_CATEGORY: (category: string) =>
    `${VITE_API_VERSION}/faqs/category/${category}`,
  FAQS_SEARCH: (query: string) => `${VITE_API_VERSION}/faqs/search/${query}`,
  FAQS_POPULAR: `${VITE_API_VERSION}/faqs/popular`,
  FAQ_RATE: (id: string) => `${VITE_API_VERSION}/faqs/${id}/rate`,

  REVIEWS_BY_PRODUCT: (productId: string) =>
    `${VITE_API_VERSION}/products/${productId}/reviews`,
  CREATE_REVIEW: `${VITE_API_VERSION}/reviews`,

  CART_ITEM: `${VITE_API_VERSION}/cart/item`,
  CART: (userId: string) => `${VITE_API_VERSION}/cart/${userId}`,
  DELETE_CART: (userId: string) => `${VITE_API_VERSION}/cart/${userId}`,

  INVOICE: `${VITE_API_VERSION}/invoice`,
  GET_INVOICE: (userId: string) => `${VITE_API_VERSION}/invoice/${userId}`,
  INITIATE_STRIPE_PAYMENT: `${VITE_API_VERSION}/invoice/initiate-stripe`,

  RECOMMENDATIONS: `${VITE_API_VERSION}/recommendations`,

  CUSTOMER_HOME_PAGE: `${VITE_API_VERSION}/homepage`,

  VALIDATE_COUPON: `${VITE_API_VERSION}/coupons/validate`,

  SEND_EMAIL: `${VITE_API_VERSION}/email/payment/notify-success`,

  CHATBOT: `${VITE_API_VERSION}/openai-chat`,

  ADMIN_USERS: `${VITE_API_VERSION}/admin/users`,
  ADMIN_USER_PURCHASES_DETAIL: `${VITE_API_VERSION}/admin/users/purchases`,

  ADMIN_CREATE_PRODUCT: `${VITE_API_VERSION}/product`,
  ADMIN_UPDATE_PRODUCT: (id: string) => `${VITE_API_VERSION}/product/${id}`,
  ADMIN_DELETE_PRODUCT: (id: string) => `${VITE_API_VERSION}/product/${id}`,
  ADMIN_ADD_VARIANT: (productId: string) =>
    `${VITE_API_VERSION}/products/${productId}/variants`,
  ADMIN_UPDATE_VARIANT: (variantId: string) =>
    `${VITE_API_VERSION}/variants/${variantId}`,
  ADMIN_UPDATE_VARIANT_STOCK: (variantId: string) =>
    `${VITE_API_VERSION}/variants/${variantId}/stock`,
  ADMIN_DELETE_VARIANT: (variantId: string) =>
    `${VITE_API_VERSION}/variants/${variantId}`,

  ADMIN_CREATE_CATEGORY: `${VITE_API_VERSION}/category`,

  ADMIN_UPDATE_INVOICE_STATUS: (invoiceId: string) =>
    `${VITE_API_VERSION}/admin/invoices/${invoiceId}/status`,
  ADMIN_GET_ALL_INVOICES: `${VITE_API_VERSION}/admin/invoices`,

  ADMIN_UPDATE_BANNER: `${VITE_API_VERSION}/homepage/banner`,
  ADMIN_UPDATE_VIDEO: `${VITE_API_VERSION}/homepaginvoicee/video`,
  ADMIN_UPDATE_FEATURE: `${VITE_API_VERSION}/homepage/feature`,

  ADMIN_CREATE_COUPON: `${VITE_API_VERSION}/admin/coupons`,
  ADMIN_GET_ALL_COUPONS: `${VITE_API_VERSION}/admin/coupons`,
  ADMIN_GET_COUPON_BY_ID: (id: string) =>
    `${VITE_API_VERSION}/admin/coupons/${id}`,
  ADMIN_UPDATE_COUPON: (id: string) =>
    `${VITE_API_VERSION}/admin/coupons/${id}`,
  ADMIN_DELETE_COUPON: (id: string) =>
    `${VITE_API_VERSION}/admin/coupons/${id}`,

  ADMIN_CREATE_FAQ: `${VITE_API_VERSION}/admin/faqs`,
  ADMIN_UPDATE_FAQ: (id: string) => `${VITE_API_VERSION}/admin/faqs/${id}`,
  ADMIN_DELETE_FAQ: (id: string) => `${VITE_API_VERSION}/admin/faqs/${id}`,
};
