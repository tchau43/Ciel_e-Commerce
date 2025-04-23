import InvoiceItems from "@/features/invoices/components/InvoiceItems";
import { useGetInvoiceQuery } from "@/services/invoice/getInvoiceQuery";
import { getAuthCredentials } from "@/utils/authUtil";

const InvoicePage = () => {
  const { userInfo } = getAuthCredentials();
  const {
    data: invoices = [],
    isError,
    isLoading,
  } = useGetInvoiceQuery(userInfo._id);

  console.log("userInfo._id", userInfo._id);
  console.log("invoices", invoices);

  return (
    <>
      {invoices.map((i) => (
        <InvoiceItems invoiceItem={i} />
      ))}
    </>
  );
};

export default InvoicePage;
