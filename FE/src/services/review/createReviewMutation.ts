import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Review from "@/repositories/review/review";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

interface CreateReviewRequest {
  productId: string;
  variantId: string;
  invoiceId: string;
  rating: number;
  comment?: string;
}

interface CreateReviewResponse {
  message: string;
  review: {
    _id: string;
    user: string;
    product: string;
    variant: string;
    invoice: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const useCreateReviewMutation = (
  options?: any
): UseMutationResult<CreateReviewResponse, AxiosError, CreateReviewRequest> => {
  return useMutation({
    mutationFn: (reviewData: CreateReviewRequest) => {
      return Review.createReview(API_ENDPOINTS.CREATE_REVIEW, reviewData);
    },
    ...options,
  });
};
