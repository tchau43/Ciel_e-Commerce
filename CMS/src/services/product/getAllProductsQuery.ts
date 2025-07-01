import { Product } from "@/types/dataTypes";
import { useQuery } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product"; 
import { API_ENDPOINTS } from "@/utils/api/endpoint";

interface ProductQueryOptions {
  limit?: number;
  enabled?: boolean;
  [key: string]: any;
}

export const useGetAllProductsQuery = (options?: ProductQueryOptions) => {
  return useQuery<Product[], Error>({
    queryKey: ["products", options?.limit],
    queryFn: () => {
      const url = options?.limit
        ? `${API_ENDPOINTS.PRODUCTS}?limit=${options.limit}`
        : API_ENDPOINTS.PRODUCTS;
      return ProductRepository.getAllProducts(url);
    },
    ...options,
  });
};
