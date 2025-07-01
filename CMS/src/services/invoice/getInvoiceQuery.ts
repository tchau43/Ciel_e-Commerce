import { useQuery, UseQueryResult } from "@tanstack/react-query";
import InvoiceRepository from "@/repositories/invoice/invoice";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { Invoice } from "@/types/dataTypes";

export const useGetInvoiceQuery = (
  variables: string,
  options?: any
): UseQueryResult<Invoice[]> => {
  return useQuery<Invoice[], Error>({
    queryKey: ["invoices", variables],
    queryFn: () => {
      return InvoiceRepository.getInvoicesForUser(
        API_ENDPOINTS.GET_INVOICE(variables)
      );
    },
    enabled: !!variables,
    ...options,
  });
};
