

import {
  
  CreateInvoiceInput, 
  UpdateInvoiceStatusInput,
  Invoice,
  InitiatePaymentResponse,
  InitiatePaymentVariables,
} from "@/types/dataTypes";
import { AdminInvoiceQueryResult } from "@/services/invoice/getAllInvoicesQuery";
import Base from "../base";

class InvoiceRepository extends Base {
  
  createInvoice = (url: string, variables: CreateInvoiceInput) => {
    
    
    return this.http<any>(url, "post", variables);
  };

  
  getInvoicesForUser = (url: string) => {
    return this.http<Invoice[]>(url, "get");
  };

  
  getAllInvoices = (url: string, params?: Record<string, any>) => {
    
    
    return this.http<AdminInvoiceQueryResult>(url, "get", undefined, {
      params,
    }); 
  };

  
  initiateStripePayment = (
    url: string,
    variables: InitiatePaymentVariables
  ) => {
    return this.http<InitiatePaymentResponse>(url, "post", variables);
  };

  
  updateInvoiceStatus = (url: string, variables: UpdateInvoiceStatusInput) => {
    
    return this.http<any>(url, "patch", variables);
  };
}

export default new InvoiceRepository();
