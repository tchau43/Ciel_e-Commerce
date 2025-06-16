import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { clearAuthCredentials } from "../authUtil"; // <-- Import the function to clear credentials
// Remove: import { useNavigate } from "react-router-dom";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string, // Ensure it's a string
  timeout: 120000, // Request timeout in milliseconds
  headers: {
    Accept: "application/json",
  },
});

// Remove: const navigate = useNavigate(); // <-- Cannot call hook here

// Add a request interceptor
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
instance.interceptors.response.use(
  (response: AxiosResponse) => response?.data ?? response,
  (error) => {
    // Check if the error is due to token expiration (e.g., 401 Unauthorized)
    if (error?.response?.status === 401) {
      console.log("Token expired, logging out...");
      // Clear stored authentication tokens and user info
      clearAuthCredentials(); //

      // Redirect to login page using standard browser API
      window.location.href = "/login"; // <-- Use this for redirection

      // It's usually better to stop processing here and let the redirect happen
      // return Promise.reject(new Error("Session expired. Please login again."));
    }

    // For other errors, reject the promise with error details
    const errorMessage =
      error?.response?.data?.message || error?.message || "An error occurred";
    return Promise.reject(new Error(errorMessage));
  }
);

export default instance;
