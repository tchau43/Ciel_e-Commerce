import { InvoiceResponse } from "@/types/dataTypes";
import ProductInvoice from "./ProductInvoice";

interface InvoiceItemsProps {
  invoiceItem: InvoiceResponse;
}

const InvoiceItems = ({ invoiceItem }: InvoiceItemsProps) => {
  return (
    <>
      {invoiceItem.items.map((i) => (
        <ProductInvoice />
      ))}
      <div></div>
    </>
  );
};

export default InvoiceItems;
