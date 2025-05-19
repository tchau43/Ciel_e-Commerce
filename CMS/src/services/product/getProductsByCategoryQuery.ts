import product from "@/repositories/product/product";
import { Product } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useGetProductsByCategoryQuery = (
  params: string,
  option?: any
): UseQueryResult<Product[]> => {
  return useQuery<Product[]>({
    // Use queryKey based on params, so the query is re-triggered when params change
    queryKey: ["products", params], // queryKey should change with params
    queryFn: () => {
      console.log("Fetching products with params:", params);
      if (params) {
        // If params are set, fetch products by category
        return product.getProductByCategory(
          `${API_ENDPOINTS.PRODUCTS_BY_CATEGORY}?${params}`
        );
      } else {
        // Otherwise, fetch all products
        return product.getAllProducts(API_ENDPOINTS.PRODUCTS);
      }
    },
    enabled: true, // Only fetch if params are available (non-empty string)
    ...option,
  });
};
