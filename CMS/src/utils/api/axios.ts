import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { clearAuthCredentials } from "../authUtil";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string,
  timeout: 120000,
  headers: {
    Accept: "application/json",
  },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response: AxiosResponse) => response?.data ?? response,
  (error) => {
    if (error?.response?.status === 401) {
      console.log("Token expired, logging out...");
      clearAuthCredentials();
      window.location.href = "/login";
    }

    const errorMessage =
      error?.response?.data?.message || error?.message || "An error occurred";
    return Promise.reject(new Error(errorMessage));
  }
);

export default instance;
