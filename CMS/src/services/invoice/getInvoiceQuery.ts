import { useQuery, UseQueryResult } from "@tanstack/react-query";
import InvoiceRepository from "@/repositories/invoice/invoice"; // Đổi tên import nếu cần
import { API_ENDPOINTS } from "@/utils/api/endpoint";
// SỬA LỖI: Import đúng type 'Invoice' từ dataTypes.ts
import { Invoice } from "@/types/dataTypes";

export const useGetInvoiceQuery = (
  variables: string, // Đây là userId
  options?: any
  // SỬA LỖI: Sử dụng đúng kiểu trả về là Invoice[]
): UseQueryResult<Invoice[]> => {
  // SỬA LỖI: Sử dụng đúng kiểu dữ liệu query là Invoice[]
  return useQuery<Invoice[], Error>({
    // Thêm Error type cho rõ ràng
    // Query key nên bao gồm userId để đảm bảo tính duy nhất khi userId thay đổi
    queryKey: ["invoices", variables],
    queryFn: () => {
      // Gọi phương thức repository với endpoint đúng
      return InvoiceRepository.getInvoicesForUser(
        API_ENDPOINTS.GET_INVOICE(variables)
      );
    },
    enabled: !!variables, // Chỉ chạy query khi có userId (variables)
    ...options,
  });
};
