import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string, // Ensure it's a string
  timeout: 120000, // Request timeout in milliseconds
  headers: {
    Accept: "application/json",
    // "Content-Type": "application/json, multipart/form-data",
  },
});

// Add a request interceptor
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ Fix: Use InternalAxiosRequestConfig
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
instance.interceptors.response.use(
  (response: AxiosResponse) => response?.data ?? response,
  (error) => Promise.reject(error?.response?.data ?? error)
);

export default instance;
