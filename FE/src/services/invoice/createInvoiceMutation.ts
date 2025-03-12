import Invoice from "@/repositories/invoice/invoice";
import { InvoiceRequest } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variables }: { variables: InvoiceRequest }) => {
      return Invoice.createInvoice(API_ENDPOINTS.INVOICE, variables);
    },
    onSuccess: () => {
      // Invalidate the cart query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
    },
  });
};
