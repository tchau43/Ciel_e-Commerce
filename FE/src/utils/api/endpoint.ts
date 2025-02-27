const VITE_API_VERSION = import.meta.env.VITE_API_VERSION || "/v1"; // Default to "/v1" if not set

export const API_ENDPOINTS = {
  LOGIN: `${VITE_API_VERSION}/login`,
  REGISTER: `${VITE_API_VERSION}/register`,
  INFO: `${VITE_API_VERSION}/users/info`,
  DISHES: `${VITE_API_VERSION}/dishes`,
  DISHES_SIMILAR: `${VITE_API_VERSION}/similar_dishes`,
  INGREDIENTS: `${VITE_API_VERSION}/ingredients`,
  FAVOURITE: `${VITE_API_VERSION}/favourite-dishes`,
  FAVOUR: `${VITE_API_VERSION}/favourite`,
  USERSURVEY: `${VITE_API_VERSION}/user-survey`,
  COMMENT: `${VITE_API_VERSION}/comments`,
  USER_COMMENTS: `${VITE_API_VERSION}/user-comments`,
  USERS: `${VITE_API_VERSION}/admin/users`,
  ALL_REVIEWS: `${VITE_API_VERSION}/admin/all-comments`,
  LOGOUT: `${VITE_API_VERSION}/users/logout`, 
};
