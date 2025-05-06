// src/services/invoice/getAllInvoicesQuery.ts

import InvoiceRepository from "@/repositories/invoice/invoice";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
// Import thêm keepPreviousData từ thư viện
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Invoice,
  AdminInvoicePaginatedResponse,
  BaseAdminQueryParams,
} from "@/types/dataTypes";

// Hàm query function, sử dụng các kiểu đã import
const fetchAllInvoicesAdmin = async (
  params?: BaseAdminQueryParams
): Promise<AdminInvoicePaginatedResponse> => {
  // Gọi repository với endpoint và params
  // InvoiceRepository.getAllInvoices đã được sửa để nhận params
  return await InvoiceRepository.getAllInvoices(
    API_ENDPOINTS.ADMIN_GET_ALL_INVOICES,
    params
  );
};

// Hook useGetAllInvoicesQuery, sử dụng các kiểu đã import
export const useGetAllInvoicesQuery = (params?: BaseAdminQueryParams) => {
  return useQuery<AdminInvoicePaginatedResponse, Error>({
    queryKey: ["allInvoicesAdmin", params],
    queryFn: () => fetchAllInvoicesAdmin(params),
    // Thay thế keepPreviousData: true bằng placeholderData: keepPreviousData
    placeholderData: keepPreviousData, // <-- Sửa ở đây
  });
};
