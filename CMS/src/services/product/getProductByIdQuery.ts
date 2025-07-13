import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product"; 
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { Product } from "@/types/dataTypes";

export const useGetProductByIdQuery = (
  id: string,
  option?: any
): UseQueryResult<Product> => {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => {
      return ProductRepository.getProductById(API_ENDPOINTS.PRODUCT_BY_ID(id));
    },
    ...option,
  });
};
