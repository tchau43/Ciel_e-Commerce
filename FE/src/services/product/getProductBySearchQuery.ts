import { useQuery } from "@tanstack/react-query";
import product from "@/repositories/product/product";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetProductBySearchQuery = (params: string) => {
  return useQuery({
    queryKey: ["product", params],
    queryFn: () => {
      if (params) {
        // If params are set, fetch products by category
        return product.getProductBySearch(
          `${API_ENDPOINTS.SEARCH_PRODUCT}?${params}`
        );
      } else {
        // Otherwise, fetch all products
        return product.getAllProducts(API_ENDPOINTS.PRODUCTS);
      }
    },
  });
};
