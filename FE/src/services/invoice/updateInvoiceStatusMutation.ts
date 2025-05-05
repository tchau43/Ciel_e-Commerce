// src/services/invoice/updateInvoiceStatusMutation.ts

import InvoiceRepository from "@/repositories/invoice/invoice";
import { UpdateInvoiceStatusInput } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming you use sonner for notifications

interface UpdateInvoiceStatusVariables {
  invoiceId: string;
  variables: UpdateInvoiceStatusInput;
}

// Type for the expected successful response (adjust if backend sends specific data)
type UpdateInvoiceStatusResponse = {
  message: string;
  // Potentially the updated invoice object
  // invoice: Invoice;
};

export const useUpdateInvoiceStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateInvoiceStatusResponse, // Type of data returned on success
    Error, // Type of error
    UpdateInvoiceStatusVariables // Type of variables passed to mutationFn
  >({
    mutationFn: ({ invoiceId, variables }: UpdateInvoiceStatusVariables) => {
      // Call the repository method with the correct endpoint and payload
      return InvoiceRepository.updateInvoiceStatus(
        API_ENDPOINTS.ADMIN_UPDATE_INVOICE_STATUS(invoiceId), // Use the specific admin endpoint
        variables
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate the query for all invoices to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ["allInvoices"] });
      // Optionally invalidate the specific invoice query if you have one
      // queryClient.invalidateQueries({ queryKey: ["invoice", variables.invoiceId] });

      console.log("Invoice status updated successfully:", data);
      toast.success(data?.message || "Trạng thái hóa đơn đã được cập nhật!"); // Success notification
    },
    onError: (error) => {
      console.error("Invoice status update failed:", error);
      toast.error(error?.message || "Cập nhật trạng thái hóa đơn thất bại."); // Error notification
    },
  });
};
