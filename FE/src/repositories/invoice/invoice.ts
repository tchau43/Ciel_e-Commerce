import { InvoiceInputData } from "@/types/dataTypes";
import Base from "../base";

class Invoice extends Base {
  createInvoice = (url: string, variables: InvoiceInputData) => {
    return this.http(url, "post", variables);
  };
}

export default new Invoice();
