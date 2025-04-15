// src/services/recommendations/getRecommendationProductQuery.ts

import ProductRepository from "@/repositories/product/product";
import { ProductData } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery } from "@tanstack/react-query";

export const useGetRecommendationProductQuery = (
  userId: string | undefined
) => {
  return useQuery<ProductData[], Error>({
    // Specify return type and error type
    queryKey: ["recommendations", userId], // Unique key for this query
    queryFn: () => {
      if (!userId) {
        // Should not happen if 'enabled' is used correctly, but good practice
        return Promise.reject(new Error("User ID is required"));
      }
      const url = API_ENDPOINTS.RECOMMENDATIONS(userId);
      return ProductRepository.getRecommendations(url);
    },
    enabled: !!userId, // Only run the query if userId is truthy
    staleTime: 1000 * 60 * 5, // Optional: Cache data for 5 minutes
    // Add other react-query options as needed
  });
};
