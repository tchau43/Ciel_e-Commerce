// src/services/invoice/initiateStripePaymentMutation.ts (Should look like this)
import Invoice from "@/repositories/invoice/invoice";
import { ShippingAddress, InvoiceProductInputData } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";

type InitiatePaymentVariables = {
  userId: string;
  productsList: InvoiceProductInputData[];
  shippingAddress: ShippingAddress;
};

type InitiatePaymentResponse = {
  clientSecret: string;
  invoiceId: string;
  totalAmount: number;
};

export const useInitiateStripePaymentMutation = () => {
  return useMutation<
    InitiatePaymentResponse,
    Error,
    { variables: InitiatePaymentVariables }
  >({
    mutationFn: ({ variables }: { variables: InitiatePaymentVariables }) => {
      // Make sure Invoice.initiateStripePayment calls the correct backend endpoint
      // e.g., POST /invoice/initiate-stripe with the variables payload
      return Invoice.initiateStripePayment(
        API_ENDPOINTS.INITIATE_STRIPE_PAYMENT,
        variables
      );
    },
    onSuccess: (data) => {
      console.log("Stripe payment initiated successfully:", data);
    },
    onError: (error) => {
      console.error("Stripe payment initiation failed:", error);
    },
  });
};
