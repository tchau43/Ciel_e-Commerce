import { useQuery, UseQueryResult } from "@tanstack/react-query";
import Invoice from "@/repositories/invoice/invoice";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { InvoiceResponse } from "@/types/dataTypes";

export const useGetInvoiceQuery = (
  variables: string,
  options?: any
): UseQueryResult<InvoiceResponse[]> => {
  return useQuery<InvoiceResponse[]>({
    queryKey: ["invoices", variables],
    queryFn: () => {
      return Invoice.getInvoice(API_ENDPOINTS.GET_INVOICE, {
        userId: variables,
      });
    },
    ...options,
  });
};
