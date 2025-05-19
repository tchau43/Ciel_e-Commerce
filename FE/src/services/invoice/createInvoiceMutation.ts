import Invoice from "@/repositories/invoice/invoice";
import { CreateInvoiceInput, Invoice as InvoiceType } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateInvoiceApiResponse = {
  message: string;
  invoice: InvoiceType;
};

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    CreateInvoiceApiResponse,
    Error,
    { variables: CreateInvoiceInput }
  >({
    mutationFn: ({ variables }: { variables: CreateInvoiceInput }) => {
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
