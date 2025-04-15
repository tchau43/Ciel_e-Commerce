// src/repositories/invoice/invoice.ts  (or wherever this file is located)

import {
  InvoiceRequest,
  ShippingAddress, // <-- Import ShippingAddress
  InvoiceProductInputData, // <-- Import InvoiceProductInputData
} from "@/types/dataTypes"; // Make sure path to types is correct
import Base from "../base";

// --- Define the specific types needed for the new method ---
// Type for the variables the new method expects as input
type InitiatePaymentVariables = {
  userId: string;
  productsList: InvoiceProductInputData[];
  shippingAddress: ShippingAddress;
};

// Type for the expected successful response from the new backend endpoint
type InitiatePaymentResponse = {
  clientSecret: string;
  invoiceId: string;
  totalAmount: number; // Backend confirms the total
};
// --- End type definitions ---

class Invoice extends Base {
  // Existing method for COD/Manual invoice creation
  createInvoice = (url: string, variables: InvoiceRequest) => {
    // Expects { message: string, invoice: InvoiceResponse } based on previous hook typing
    // Adjust <any> to the actual expected response type for better type safety
    return this.http(url, "post", variables);
  };

  // Existing method to get invoices
  getInvoice = (url: string) => {
    // Expects an array of InvoiceResponse objects
    // Adjust <any[]> to the actual expected response type (e.g., InvoiceResponse[])
    return this.http<any[]>(url, "get");
  };

  // --- ADD THIS METHOD for Stripe Initiation ---
  initiateStripePayment = (
    url: string,
    variables: InitiatePaymentVariables
  ) => {
    // Calls the new POST /invoice/initiate-stripe endpoint
    // Expects InitiatePaymentResponse back from the backend
    return this.http(url, "post", variables);
  };
  // --- END ADD ---
}

export default new Invoice();
