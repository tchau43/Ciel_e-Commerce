// src/repositories/invoice/invoice.ts

import {
  // Corrected Imports based on dataTypes.ts provided earlier
  CreateInvoiceInput, // Was InvoiceRequest
  UpdateInvoiceStatusInput,
  Invoice,
  InitiatePaymentResponse,
  InitiatePaymentVariables,
} from "@/types/dataTypes";
import { AdminInvoiceQueryResult } from "@/services/invoice/getAllInvoicesQuery";
import Base from "../base";

class InvoiceRepository extends Base {
  // Existing method for COD/Manual invoice creation
  createInvoice = (url: string, variables: CreateInvoiceInput) => {
    // Use corrected type
    // Adjust <any> to the actual expected response type
    return this.http<any>(url, "post", variables);
  };

  // Existing method to get invoices for a SPECIFIC user
  getInvoicesForUser = (url: string) => {
    return this.http<Invoice[]>(url, "get");
  };

  // Method for getting ALL invoices (Admin) - ĐÃ CÓ SẴN
  getAllInvoices = (url: string, params?: Record<string, any>) => {
    // Thêm params tùy chọn
    // params sẽ chứa các query như searchTerm, page, limit...
    return this.http<AdminInvoiceQueryResult>(url, "get", undefined, {
      params,
    }); // Truyền params vào config axios
  };

  // Stripe payment initiation
  initiateStripePayment = (
    url: string,
    variables: InitiatePaymentVariables
  ) => {
    return this.http<InitiatePaymentResponse>(url, "post", variables);
  };

  // Method for updating invoice status (Admin)
  updateInvoiceStatus = (url: string, variables: UpdateInvoiceStatusInput) => {
    // Adjust <any> if a specific response type is known for status updates
    return this.http<any>(url, "patch", variables);
  };
}

export default new InvoiceRepository();
