import { ProductData } from "@/types/dataTypes";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import Product from "@/repositories/product/product";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetAllProductsQuery = (
  option?: any
): UseQueryResult<ProductData[]> => {
  return useQuery<ProductData[]>({
    queryKey: ["products"],
    queryFn: () => {
      const productsList = Product.getAllProducts(API_ENDPOINTS.PRODUCTS);
      console.log("productsList", productsList);
      return productsList;
    },
    ...option,
  });
};
