// src/repositories/invoice/invoice.ts

import {
  // Corrected Imports based on dataTypes.ts provided earlier
  CreateInvoiceInput, // Was InvoiceRequest
  Address as ShippingAddress, // Was ShippingAddress, using Address type
  InvoiceItemInput, // Was InvoiceProductInputData
  UpdateInvoiceStatusInput,
  Invoice,
} from "@/types/dataTypes";
import Base from "../base";

type InitiatePaymentVariables = {
  userId: string;
  productsList: InvoiceItemInput[]; // Use corrected type
  shippingAddress: ShippingAddress; // Use corrected type
};

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
    return this.http<Invoice[]>(url, "get", undefined, { params }); // Truyền params vào config axios
  };

  // Existing method for Stripe Initiation
  initiateStripePayment = (
    url: string,
    variables: InitiatePaymentVariables
  ) => {
    // Corrected: Removed the incorrect generic here.
    // The http method's generic defines the type of 'variables',
    // the return type is inferred from the underlying axios call.
    // We expect the backend to return InitiatePaymentResponse for this endpoint.
    return this.http(url, "post", variables);
  };

  // Method for updating invoice status (Admin)
  updateInvoiceStatus = (url: string, variables: UpdateInvoiceStatusInput) => {
    // Adjust <any> if a specific response type is known for status updates
    return this.http<any>(url, "patch", variables);
  };
}

export default new InvoiceRepository();
