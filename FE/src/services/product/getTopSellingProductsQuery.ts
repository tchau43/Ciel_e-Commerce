import { Product } from "@/types/dataTypes";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetTopSellingProductsQuery = (options?: {
  limit?: number;
  enabled?: boolean;
  [key: string]: any;
}): UseQueryResult<Product[]> => {
  return useQuery<Product[]>({
    queryKey: ["topSellingProducts", options?.limit],
    queryFn: async () => {
      let url = `${API_ENDPOINTS.PRODUCTS}?sort=purchasedQuantity:desc`;
      if (options?.limit) {
        url += `&limit=${options.limit}`;
      }
      return ProductRepository.getAllProducts(url);
    },
    ...options,
  });
};
