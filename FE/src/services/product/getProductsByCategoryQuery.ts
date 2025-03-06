import product from "@/repositories/product/product";
import { ProductData } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useGetProductsByCategoryQuery = (
  params: string,
  option?: any
): UseQueryResult<ProductData[]> => {
  return useQuery<ProductData[]>({
    queryKey: ["product"],
    queryFn: () => {
      return product.getProductByCategory(
        API_ENDPOINTS.PRODUCTS_BY_CATEGORY,
        params
      );
    },
    enabled: params.length > 0, // Don't fetch products unless there are selected categories
    ...option,
  });
};
