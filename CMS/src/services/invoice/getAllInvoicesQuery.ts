// src/services/invoice/getAllInvoicesQuery.ts

import InvoiceRepository from "@/repositories/invoice/invoice";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
// Import thêm keepPreviousData từ thư viện
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Invoice } from "@/types/dataTypes";

export interface AdminInvoiceFilterParams {
  searchTerm?: string;
  orderStatus?: string;
  paymentStatus?: string;
  fromDate?: string;
  toDate?: string;
  userId?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AdminInvoiceQueryResult {
  invoices: Invoice[];
  currentPage: number;
  totalPages: number;
  totalInvoices: number;
  limit: number;
}

const fetchAllInvoicesAdmin = async (
  params?: AdminInvoiceFilterParams
): Promise<AdminInvoiceQueryResult> => {
  return await InvoiceRepository.getAllInvoices(
    API_ENDPOINTS.ADMIN_GET_ALL_INVOICES,
    params
  );
};

export const useGetAllInvoicesQuery = (params?: AdminInvoiceFilterParams) => {
  return useQuery<AdminInvoiceQueryResult, Error>({
    queryKey: ["allInvoicesAdmin", params],
    queryFn: () => fetchAllInvoicesAdmin(params),
    placeholderData: keepPreviousData,
  });
};
