import { useQuery, UseQueryResult } from "@tanstack/react-query";
import productRepository from "@/repositories/product/product";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { Product } from "@/types/dataTypes";

// Helper function to parse relevant params into an object for the query key
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
    "maxPrice" /* add other relevant keys */,
  ];

  relevantKeys.forEach((key) => {
    if (currentParams.has(key)) {
      relevantParams[key] = currentParams.get(key)!;
    }
  });
  // Sort keys for consistent query key serialization
  const sortedKeys = Object.keys(relevantParams).sort();
  const sortedParams: Record<string, string> = {};
  sortedKeys.forEach((key) => {
    sortedParams[key] = relevantParams[key];
  });
  return sortedParams;
};

export const useGetProductBySearchQuery = (
  paramsString: string // Expect the relevant query string "category=X&searchText=Y"
): UseQueryResult<Product[]> => {
  // Parse the string into an object for a stable and descriptive query key
  const queryKeyParams = parseRelevantParams(paramsString);

  return useQuery<Product[]>({
    // Use the parsed object in the query key
    queryKey: ["products", "search", queryKeyParams],
    queryFn: () => {
      // Only proceed if there are actual parameters
      if (paramsString) {
        return productRepository.getProductBySearch(
          `${API_ENDPOINTS.PRODUCTS_BY_SEARCH_TERM}?${paramsString}`
        );
      } else {
        // Fetch all products if no search params are present
        // Alternatively, return Promise.resolve([]) or disable the query
        return productRepository.getAllProducts(API_ENDPOINTS.PRODUCTS);
      }
    },
    // Keep query enabled only if there are params,
    // or adjust if you want to show all products when params are empty
    enabled: true, // Or adjust based on whether empty params should fetch all
    // keepPreviousData: true, // Optional: useful for smoother UX during filter changes
  });
};
