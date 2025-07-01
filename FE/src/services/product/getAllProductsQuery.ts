import { Product } from "@/types/dataTypes";
import {
  useQuery,
  UseQueryResult,
  UseQueryOptions,
} from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

interface ProductQueryOptions
  extends Partial<UseQueryOptions<Product[], Error>> {
  limit?: number;
  enabled?: boolean;
}

export const useGetAllProductsQuery = (
  options?: ProductQueryOptions
): UseQueryResult<Product[]> => {
  return useQuery<Product[], Error>({
    queryKey: ["products", options?.limit],
    queryFn: () => {
      let url = API_ENDPOINTS.PRODUCTS;
      if (options?.limit) {
        url += `?limit=${options.limit}`;
      }

      const productsList = ProductRepository.getAllProducts(url);

      return productsList;
    },

    ...options,
  });
};
