import { InvoiceRequest } from "@/types/dataTypes";
import Base from "../base";

class Invoice extends Base {
  createInvoice = (url: string, variables: InvoiceRequest) => {
    return this.http(url, "post", variables);
  };
  getInvoice = (url: string) => {
    return this.http(url, "get");
  };
}

export default new Invoice();
