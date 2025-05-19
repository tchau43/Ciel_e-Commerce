// src/services/invoice/updateInvoiceStatusMutation.ts

import InvoiceRepository from "@/repositories/invoice/invoice";
import { UpdateInvoiceStatusInput, Invoice } from "@/types/dataTypes"; // Giả sử bạn có type Invoice
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { toast } from "sonner";

interface UpdateInvoiceStatusVariables {
  invoiceId: string;
  variables: UpdateInvoiceStatusInput;
}

// Type cho response thành công từ backend (nếu có, ví dụ trả về invoice đã cập nhật)
type UpdateInvoiceStatusResponse = {
  message: string;
  invoice?: Invoice; // Backend có thể trả về invoice đã cập nhật
};

export const useUpdateInvoiceStatusMutation = () => {
  const queryClient = useQueryClient(); // <-- Lấy queryClient

  return useMutation<
    UpdateInvoiceStatusResponse,
    Error, // Kiểu lỗi
    UpdateInvoiceStatusVariables
  >({
    mutationFn: ({ invoiceId, variables }: UpdateInvoiceStatusVariables) => {
      return InvoiceRepository.updateInvoiceStatus(
        API_ENDPOINTS.ADMIN_UPDATE_INVOICE_STATUS(invoiceId),
        variables
      );
    },
    onSuccess: (data, variables) => {
      // data là response từ API, variables là input của mutation
      toast.success(
        data?.message || "Trạng thái hóa đơn đã được cập nhật thành công!"
      );

      // --- Vô hiệu hóa (invalidate) query lấy danh sách tất cả hóa đơn ---
      // Query key này phải khớp với query key bạn đã dùng trong useGetAllInvoicesQuery
      // Hiện tại queryKey của bạn là ["allInvoicesAdmin", params]
      // Để đơn giản, ta có thể vô hiệu hóa tất cả các query bắt đầu bằng "allInvoicesAdmin"
      // Hoặc nếu bạn muốn chính xác hơn, bạn cần cách để lấy `params` hiện tại của trang list.
      // Tuy nhiên, việc vô hiệu hóa theo prefix key thường là đủ và đơn giản.
      queryClient.invalidateQueries({ queryKey: ["allInvoicesAdmin"] });
      // React Query sẽ tự động fetch lại tất cả các query đang active có key bắt đầu bằng ["allInvoicesAdmin"]

      // (Tùy chọn) Nếu backend trả về chi tiết invoice đã cập nhật và bạn muốn cập nhật cache cho query chi tiết invoice đó:
      // if (data.invoice) {
      //   queryClient.setQueryData(['invoice', data.invoice._id], data.invoice);
      // }

      console.log(
        "Invoice status updated successfully on backend, frontend data will refetch.",
        data
      );
    },
    onError: (error: Error) => {
      // Thêm kiểu cho error
      toast.error(error?.message || "Cập nhật trạng thái hóa đơn thất bại.");
      console.error("Invoice status update failed:", error);
    },
  });
};
