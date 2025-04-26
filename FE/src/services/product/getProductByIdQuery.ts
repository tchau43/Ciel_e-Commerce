import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product"; // Renamed 'Product' import to avoid conflict with type
import { API_ENDPOINTS } from "@/utils/api/endpoint";
// import { ProductData } from "@/types/dataTypes"; // <-- Incorrect type
import { Product } from "@/types/dataTypes"; // <-- Correct type from dataTypes.ts

export const useGetProductByIdQuery = (
  id: string,
  option?: any
  // ): UseQueryResult<ProductData> => { // <-- Incorrect return type
): UseQueryResult<Product> => {
  // <-- Correct return type
  return useQuery<Product>({
    // <-- Specify the query data type here too
    queryKey: ["product", id],
    queryFn: () => {
      // Use the repository instance (assuming default export is the instance)
      return ProductRepository.getProductById(API_ENDPOINTS.PRODUCT_BY_ID(id));
    },
    ...option,
  });
};
