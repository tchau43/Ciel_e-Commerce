// src/services/product/getAllProductsQuery.ts

// << SỬA LỖI: Sử dụng đúng type Product từ dataTypes.ts
import { Product } from "@/types/dataTypes";
import {
  useQuery,
  UseQueryResult,
  UseQueryOptions,
} from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product"; // Đổi tên import để tránh trùng lặp
import { API_ENDPOINTS } from "@/utils/api/endpoint";

// Define a type for the query options
interface ProductQueryOptions
  extends Partial<UseQueryOptions<Product[], Error>> {
  limit?: number;
  enabled?: boolean;
}

export const useGetAllProductsQuery = (
  options?: ProductQueryOptions
): UseQueryResult<Product[]> => {
  // << SỬA LỖI: Sử dụng đúng type Product[]
  return useQuery<Product[], Error>({
    queryKey: ["products", options?.limit], // Thêm limit vào queryKey nếu có
    queryFn: () => {
      // Xây dựng URL với query params nếu có (ví dụ: limit)
      let url = API_ENDPOINTS.PRODUCTS;
      if (options?.limit) {
        url += `?limit=${options.limit}`;
      }
      // Gọi repository với URL đã xây dựng
      const productsList = ProductRepository.getAllProducts(url);
      // console.log("productsList", productsList); // Bỏ console.log nếu không cần thiết
      return productsList;
    },
    // Truyền toàn bộ object option vào useQuery
    ...options,
  });
};
