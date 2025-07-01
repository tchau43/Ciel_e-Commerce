import { useQuery, UseQueryResult } from "@tanstack/react-query";
import Review from "@/repositories/review/review";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

interface ReviewData {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  product: string;
  variant?: {
    _id: string;
    types: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export const useGetProductReviewsQuery = (
  productId: string,
  options?: any
): UseQueryResult<ReviewData[], Error> => {
  return useQuery({
    queryKey: ["productReviews", productId],
    queryFn: () => {
      return Review.getReviewsByProduct(
        API_ENDPOINTS.REVIEWS_BY_PRODUCT(productId)
      );
    },
    enabled: !!productId,
    ...options,
  });
};
