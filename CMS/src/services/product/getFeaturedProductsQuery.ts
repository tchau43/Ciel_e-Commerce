import { Product } from "@/types/dataTypes";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetFeaturedProductsQuery = (
  options?: { limit?: number; enabled?: boolean; [key: string]: any }
): UseQueryResult<Product[]> => {
  return useQuery<Product[], Error>({
    queryKey: ["featuredProducts", options?.limit],
    queryFn: async () => {
      let url = API_ENDPOINTS.FEATURED_PRODUCTS;
      if (options?.limit) {
        url += `?limit=${options.limit}`;
      }
      const featuredProducts = await ProductRepository.getFeaturedProducts(url);
      return featuredProducts;
    },
    ...options,
  });
};
