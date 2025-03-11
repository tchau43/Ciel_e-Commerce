const VITE_API_VERSION = import.meta.env.VITE_API_VERSION || "/v1"; // Default to "/v1" if not set

export const API_ENDPOINTS = {
  LOGIN: `${VITE_API_VERSION}/login`,
  REGISTER: `${VITE_API_VERSION}/register`,
  INFO: `${VITE_API_VERSION}/users/info`,
  CATEGORIES: `${VITE_API_VERSION}/categories`,
  PRODUCTS: `${VITE_API_VERSION}/products`,
  PRODUCT_BY_ID: (id: string) => `${VITE_API_VERSION}/product/${id}`,
  PRODUCTS_BY_CATEGORY: `${VITE_API_VERSION}/productsByCategory`,
  UPDATE_CART: `${VITE_API_VERSION}/cart/updateCart`,
  ADD_TO_CART: `${VITE_API_VERSION}/cart/addToCart`,
  CART: (id: string) => `${VITE_API_VERSION}/cart/${id}`,
  CREATE_INVOICE: `${VITE_API_VERSION}/invoice/create`,
  STRIPE: `${VITE_API_VERSION}/invoice/stripe`,
  USERSURVEY: `${VITE_API_VERSION}/user-survey`,
  COMMENT: `${VITE_API_VERSION}/comments`,
  USER_COMMENTS: `${VITE_API_VERSION}/user-comments`,
  USERS: `${VITE_API_VERSION}/admin/users`,
  ALL_REVIEWS: `${VITE_API_VERSION}/admin/all-comments`,
  LOGOUT: `${VITE_API_VERSION}/users/logout`,
  USER: (id: string) => `${VITE_API_VERSION}/user/${id}`, // Convert to function
  UPDATE_USER: (id: string) => `${VITE_API_VERSION}/admin/updateUserById/${id}`, // ✅ New update function
};
