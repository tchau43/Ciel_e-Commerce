import { useQuery, UseQueryResult } from "@tanstack/react-query";
import productRepository from "@/repositories/product/product";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { Product } from "@/types/dataTypes";

const parseRelevantParams = (paramsString: string): Record<string, string> => {
  const currentParams = new URLSearchParams(paramsString);
  const relevantParams: Record<string, string> = {};
  const relevantKeys = [
    "category",
    "searchText",
    "brand",
    "sort",
    "page",
    "minPrice",
    "maxPrice",
  ];

  relevantKeys.forEach((key) => {
    if (currentParams.has(key)) {
      relevantParams[key] = currentParams.get(key)!;
    }
  });

  const sortedKeys = Object.keys(relevantParams).sort();
  const sortedParams: Record<string, string> = {};
  sortedKeys.forEach((key) => {
    sortedParams[key] = relevantParams[key];
  });
  return sortedParams;
};

export const useGetProductBySearchQuery = (
  paramsString: string
): UseQueryResult<Product[]> => {
  const queryKeyParams = parseRelevantParams(paramsString);

  return useQuery<Product[]>({
    queryKey: ["products", "search", queryKeyParams],
    queryFn: () => {
      if (paramsString) {
        return productRepository.getProductBySearch(
          `${API_ENDPOINTS.PRODUCTS_BY_SEARCH_TERM}?${paramsString}`
        );
      } else {
        return productRepository.getAllProducts(API_ENDPOINTS.PRODUCTS);
      }
    },
    enabled: true,
  });
};
