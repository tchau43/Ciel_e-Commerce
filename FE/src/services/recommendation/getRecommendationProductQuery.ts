// src/services/recommendation/getRecommendationProductQuery.ts

import ProductRepository from "@/repositories/product/product";
// << SỬA LỖI: Sử dụng đúng type Product từ dataTypes.ts
import { Product } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery } from "@tanstack/react-query";

export const useGetRecommendationProductQuery = (
  userId: string | undefined
  // << SỬA LỖI: Option được truyền vào useQuery, không phải hook này
) => {
  // << SỬA LỖI: Sử dụng đúng type Product[]
  return useQuery<Product[], Error>({
    // Specify return type and error type
    queryKey: ["recommendations", userId], // Unique key for this query
    queryFn: () => {
      if (!userId) {
        // Should not happen if 'enabled' is used correctly, but good practice
        return Promise.reject(
          new Error("User ID is required for recommendations")
        );
      }
      // << SỬA LỖI: RECOMMENDATIONS là string, không phải function
      const url = API_ENDPOINTS.RECOMMENDATIONS;
      // Giả sử getRecommendations nhận url làm tham số duy nhất
      return ProductRepository.getRecommendations(url);
    },
    enabled: !!userId, // Only run the query if userId is truthy
    staleTime: 1000 * 60 * 5, // Optional: Cache data for 5 minutes
    // Add other react-query options as needed
  });
};
