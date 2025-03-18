import stripe from "@/repositories/invoice/stripe";
import { StripeData } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateStripePaymentMutation = () => {
  return useMutation({
    mutationFn: ({ variables }: { variables: StripeData }) => {
      return stripe.createStripe(API_ENDPOINTS.STRIPE, variables);
    },
    onSuccess: () => {
      // Invalidate the cart query to trigger a refetch
    },
  });
};
