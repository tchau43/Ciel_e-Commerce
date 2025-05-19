// src/services/product/getAllProductsQuery.ts

// << SỬA LỖI: Sử dụng đúng type Product từ dataTypes.ts
import { Product } from "@/types/dataTypes";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product"; // Đổi tên import để tránh trùng lặp
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetAllProductsQuery = (
  // option có thể chứa limit, enabled, etc.
  option?: { limit?: number; enabled?: boolean; [key: string]: any }
  // << SỬA LỖI: Sử dụng đúng type Product[]
): UseQueryResult<Product[]> => {
  // << SỬA LỖI: Sử dụng đúng type Product[]
  return useQuery<Product[], Error>({
    queryKey: ["products", option?.limit], // Thêm limit vào queryKey nếu có
    queryFn: () => {
      // Xây dựng URL với query params nếu có (ví dụ: limit)
      let url = API_ENDPOINTS.PRODUCTS;
      if (option?.limit) {
        url += `?limit=${option.limit}`;
      }
      // Gọi repository với URL đã xây dựng
      const productsList = ProductRepository.getAllProducts(url);
      // console.log("productsList", productsList); // Bỏ console.log nếu không cần thiết
      return productsList;
    },
    // Truyền toàn bộ object option vào useQuery
    ...option,
  });
};
