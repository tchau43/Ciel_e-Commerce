import {
  CreateInvoiceInput,
  Address as ShippingAddress,
  InvoiceItemInput,
  UpdateInvoiceStatusInput,
  Invoice,
} from "@/types/dataTypes";
import Base from "../base";
import { AdminInvoiceQueryResult } from "@/services/invoice/getAllInvoicesQuery";

type InitiatePaymentVariables = {
  userId: string;
  productsList: InvoiceItemInput[];
  shippingAddress: ShippingAddress;
};

class InvoiceRepository extends Base {
  createInvoice = async (url: string, variables: CreateInvoiceInput) => {
    return this.http<any>(url, "post", variables);
  };

  getInvoicesForUser = async (url: string) => {
    return this.http<Invoice[]>(url, "get");
  };

  getAllInvoices = async (url: string, params?: Record<string, any>) => {
    return this.http<AdminInvoiceQueryResult>(url, "get", undefined, {
      params,
    });
  };

  initiateStripePayment = async (
    url: string,
    variables: InitiatePaymentVariables
  ) => {
    return this.http(url, "post", variables);
  };

  updateInvoiceStatus = async (
    url: string,
    variables: UpdateInvoiceStatusInput
  ) => {
    return this.http<any>(url, "patch", variables);
  };
}

export default new InvoiceRepository();
