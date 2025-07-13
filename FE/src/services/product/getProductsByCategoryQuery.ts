import product from "@/repositories/product/product";
import { Product } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useGetProductsByCategoryQuery = (
  params: string,
  option?: any
): UseQueryResult<Product[]> => {
  return useQuery<Product[]>({
    queryKey: ["products", params],
    queryFn: () => {
      console.log("Fetching products with params:", params);
      if (params) {
        return product.getProductByCategory(
          `${API_ENDPOINTS.PRODUCTS_BY_CATEGORY}?${params}`
        );
      } else {
        return product.getAllProducts(API_ENDPOINTS.PRODUCTS);
      }
    },
    enabled: true,
    ...option,
  });
};
