import Invoice from "@/repositories/invoice/invoice";
import { InvoiceRequest, InvoiceResponse } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateInvoiceApiResponse = {
  message: string;
  invoice: InvoiceResponse; // Use the detailed InvoiceResponse type
};

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    CreateInvoiceApiResponse,
    Error,
    { variables: InvoiceRequest }
  >({
    mutationFn: ({ variables }: { variables: InvoiceRequest }) => {
      return Invoice.createInvoice(API_ENDPOINTS.INVOICE, variables);
    },
    onSuccess: (data) => {
      console.log("Invoice created successfully:", data.message, data.invoice);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      console.error("Invoice creation mutation failed:", error);
    },
  });
};
