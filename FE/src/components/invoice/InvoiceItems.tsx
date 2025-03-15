import { InvoiceResponse, ProductData } from "@/types/dataTypes";
import ProductInvoice from "./ProductInvoice";
import moment from "moment";

interface InvoiceItemsProps {
  invoiceItem: InvoiceResponse;
}

const InvoiceItems = ({ invoiceItem }: InvoiceItemsProps) => {
  //   const formattedDate = new Date(invoiceItem.createdAt).toLocaleString(
  //     "en-US",
  //     {
  //       weekday: "long", // Display day of the week (e.g., "Monday")
  //       year: "numeric", // Display year (e.g., "2025")
  //       month: "long", // Display month name (e.g., "March")
  //       day: "numeric", // Display day (e.g., "9")
  //       hour: "2-digit", // Display hour (e.g., "14")
  //       minute: "2-digit", // Display minute (e.g., "27")
  //       second: "2-digit", // Display second (e.g., "15")
  //     }
  //   );

  const formattedDate = moment(invoiceItem.createdAt).format(
    "MMMM Do YYYY, h:mm:ss A"
  );
  const productList = invoiceItem.items;
  console.log("invoiceItem", invoiceItem);
  return (
    <div className="border rounded-md mb-4">
      <div className="ml-4 my-2 flex justify-between items-center">
        <span>Ngày mua hàng / Purchase date: {formattedDate}</span>
        <span className="mr-24">{invoiceItem.paymentStatus.toUpperCase()}</span>
      </div>

      <div className="px-4 w-full max-w-7xl h-20 flex items-center">
        <div className="w-36"></div>
        <div className="flex-3 ">Tên sản phẩm / Name</div>
        <div className="flex-2 text-center">Số lượng / Amount</div>
        <div className="flex-2 text-center">Giá / Price</div>
      </div>
      {productList.map((product) => (
        <ProductInvoice product={product} />
      ))}
      <div className="text-right my-4 font-bold mr-24">
        Tổng / Total: {Number(invoiceItem.totalAmount).toLocaleString("vi-VN")}{" "}
        VND
      </div>
    </div>
  );
};

export default InvoiceItems;
