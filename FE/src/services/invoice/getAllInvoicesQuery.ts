// src/services/invoice/getAllInvoicesQuery.ts

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import InvoiceRepository from "@/repositories/invoice/invoice";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { Invoice } from "@/types/dataTypes"; // Import the Invoice type

// Define a new endpoint for getting all invoices if it doesn't exist in API_ENDPOINTS
// For now, let's assume there's an endpoint like '/admin/invoices'
// If not, you'll need to add it to endpoint.ts and your backend
const ADMIN_ALL_INVOICES_ENDPOINT = "/v1/admin/invoices"; // Placeholder - ADJUST THIS

export const useGetAllInvoicesQuery = (
  options?: any // Allow passing React Query options
): UseQueryResult<Invoice[], Error> => {
  // Return type is an array of Invoices
  return useQuery<Invoice[], Error>({
    // Use a distinct query key for admin fetching all invoices
    queryKey: ["allInvoices"],
    queryFn: () => {
      // Call the repository method to get all invoices
      // IMPORTANT: Ensure your backend has an endpoint like ADMIN_ALL_INVOICES_ENDPOINT
      // and that API_ENDPOINTS.ADMIN_ALL_INVOICES points to it.
      // If using the existing GET /invoice/:userId endpoint requires admin rights
      // and omitting userId fetches all, adjust accordingly.
      // For now, assuming a dedicated endpoint:
      return InvoiceRepository.getAllInvoices(ADMIN_ALL_INVOICES_ENDPOINT);
    },
    ...options, // Spread any additional options
  });
};
