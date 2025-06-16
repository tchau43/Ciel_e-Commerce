import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { Product } from "@/types/dataTypes";

export const useGetVariantByIdQuery = (
  variantId: string,
  options?: any
): UseQueryResult<Product> => {
  return useQuery<Product>({
    queryKey: ["variant", variantId],
    queryFn: () =>
      ProductRepository.getVariantById(API_ENDPOINTS.VARIANT_BY_ID(variantId)),
    ...options,
  });
};
