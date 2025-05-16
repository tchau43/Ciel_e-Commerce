// src/services/recommendation/getRecommendationProductQuery.ts

import ProductRepository from "@/repositories/product/product";
// << SỬA LỖI: Sử dụng đúng type Product từ dataTypes.ts
import { Product } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery } from "@tanstack/react-query";
import { getAuthCredentials } from "@/utils/authUtil";

export const useGetRecommendationProductQuery = (
  userId: string | undefined
) => {
  const { token } = getAuthCredentials();

  return useQuery<Product[], Error>({
    queryKey: ["recommendations", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required for recommendations");
      }
      if (!token) {
        throw new Error("Authentication token is required for recommendations");
      }
      try {
        const recommendations = await ProductRepository.getRecommendations(
          API_ENDPOINTS.RECOMMENDATIONS,
          userId
        );
        if (!recommendations || !Array.isArray(recommendations)) {
          throw new Error("Invalid recommendations response format");
        }
        return recommendations;
      } catch (error: any) {
        console.error("Recommendation error:", error);
        throw new Error(error.message || "Failed to fetch recommendations");
      }
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
