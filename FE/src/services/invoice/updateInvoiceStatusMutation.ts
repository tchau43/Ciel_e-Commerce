import InvoiceRepository from "@/repositories/invoice/invoice";
import { UpdateInvoiceStatusInput, Invoice } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateInvoiceStatusVariables {
  invoiceId: string;
  variables: UpdateInvoiceStatusInput;
}

type UpdateInvoiceStatusResponse = {
  message: string;
  invoice?: Invoice;
};

export const useUpdateInvoiceStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateInvoiceStatusResponse,
    Error,
    UpdateInvoiceStatusVariables
  >({
    mutationFn: ({ invoiceId, variables }: UpdateInvoiceStatusVariables) => {
      return InvoiceRepository.updateInvoiceStatus(
        API_ENDPOINTS.ADMIN_UPDATE_INVOICE_STATUS(invoiceId),
        variables
      );
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || "Trạng thái hóa đơn đã được cập nhật thành công!"
      );
      queryClient.invalidateQueries({ queryKey: ["allInvoicesAdmin"] });
      console.log(
        "Invoice status updated successfully on backend, frontend data will refetch.",
        data
      );
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Cập nhật trạng thái hóa đơn thất bại.");
      console.error("Invoice status update failed:", error);
    },
  });
};
