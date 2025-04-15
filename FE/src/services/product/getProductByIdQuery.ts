import { useQuery, UseQueryResult } from "@tanstack/react-query";
import Product from "@/repositories/product/product";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { ProductData } from "@/types/dataTypes";

export const useGetProductByIdQuery = (
  id: string,
  option?: any
): UseQueryResult<ProductData> => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      return Product.getProductById(API_ENDPOINTS.PRODUCT_BY_ID(id));
    },
    ...option,
  });
};
