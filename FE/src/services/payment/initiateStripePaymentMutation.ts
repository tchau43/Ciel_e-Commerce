import Invoice from "@/repositories/invoice/invoice";
import { Address, InvoiceItemInput } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";

type InitiatePaymentVariables = {
  userId: string;
  productsList: InvoiceItemInput[];
  shippingAddress: Address;
  couponCode: string | null;
  deliveryFee: number;
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
