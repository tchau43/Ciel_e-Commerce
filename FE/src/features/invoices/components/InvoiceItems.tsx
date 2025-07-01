import {
  Invoice,
  InvoiceItem,
  PaymentStatus,
  OrderStatus,
} from "@/types/dataTypes";
import ProductInvoice from "./ProductInvoice";
import moment from "moment";
import {
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Ban,
  Truck,
  Package,
} from "lucide-react";

interface InvoiceItemsProps {
  invoiceItem: Invoice;
}

const InvoiceItems = ({ invoiceItem }: InvoiceItemsProps) => {
  const formattedDate = moment(invoiceItem.createdAt).format(
    "D MMMM YYYY, h:mm A"
  );
  const productList = invoiceItem.items;

  const getPaymentStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case PaymentStatus.PENDING:
        return <Clock className="h-5 w-5 text-amber-500" />;
      case PaymentStatus.FAILED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case PaymentStatus.REFUNDED:
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case PaymentStatus.CANCELLED:
        return <Ban className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPaymentStatusClass = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "bg-green-100 text-green-800 border-green-200";
      case PaymentStatus.PENDING:
        return "bg-amber-100 text-amber-800 border-amber-200";
      case PaymentStatus.FAILED:
        return "bg-red-100 text-red-800 border-red-200";
      case PaymentStatus.REFUNDED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case PaymentStatus.CANCELLED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOrderStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case OrderStatus.SHIPPED:
        return <Truck className="h-5 w-5 text-blue-500" />;
      case OrderStatus.PROCESSING:
        return <Package className="h-5 w-5 text-amber-500" />;
      case OrderStatus.CANCELLED:
        return <Ban className="h-5 w-5 text-gray-500" />;
      case OrderStatus.RETURNED:
        return <RefreshCw className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getOrderStatusClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800 border-green-200";
      case OrderStatus.SHIPPED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case OrderStatus.PROCESSING:
        return "bg-amber-100 text-amber-800 border-amber-200";
      case OrderStatus.CANCELLED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case OrderStatus.RETURNED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "ĐÃ THANH TOÁN";
      case PaymentStatus.PENDING:
        return "CHỜ THANH TOÁN";
      case PaymentStatus.FAILED:
        return "THANH TOÁN THẤT BẠI";
      case PaymentStatus.REFUNDED:
        return "ĐÃ HOÀN TIỀN";
      case PaymentStatus.CANCELLED:
        return "ĐÃ HỦY";
      default:
        return "KHÔNG XÁC ĐỊNH";
    }
  };

  const getOrderStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return "ĐÃ GIAO HÀNG";
      case OrderStatus.SHIPPED:
        return "ĐANG VẬN CHUYỂN";
      case OrderStatus.PROCESSING:
        return "ĐANG XỬ LÝ";
      case OrderStatus.CANCELLED:
        return "ĐÃ HỦY";
      case OrderStatus.RETURNED:
        return "ĐÃ HOÀN TRẢ";
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="border-b border-gray-100 bg-gray-50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-gray-900">
              Đơn hàng #{invoiceItem._id}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formattedDate}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getPaymentStatusClass(
                invoiceItem.paymentStatus as PaymentStatus
              )}`}
            >
              {getPaymentStatusIcon(invoiceItem.paymentStatus as PaymentStatus)}
              {getPaymentStatusText(invoiceItem.paymentStatus as PaymentStatus)}
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getOrderStatusClass(
                invoiceItem.orderStatus as OrderStatus
              )}`}
            >
              {getOrderStatusIcon(invoiceItem.orderStatus as OrderStatus)}
              {getOrderStatusText(invoiceItem.orderStatus as OrderStatus)}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
              {invoiceItem.paymentMethod === "CARD"
                ? "THẺ"
                : invoiceItem.paymentMethod === "CASH"
                ? "TIỀN MẶT"
                : invoiceItem.paymentMethod === "BANK_TRANSFER"
                ? "CHUYỂN KHOẢN"
                : invoiceItem.paymentMethod}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-12 px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 border-b">
        <div className="col-span-5">Sản phẩm</div>
        <div className="col-span-2 text-center">Giá</div>
        <div className="col-span-2 text-center">Số lượng</div>
        <div className="col-span-3 text-right">Thành tiền</div>
      </div>

      <div className="divide-y divide-gray-100">
        {productList.map((product: InvoiceItem, index: number) => (
          <ProductInvoice key={index} product={product} />
        ))}
      </div>

      <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-6">
        <div className="flex flex-col items-end space-y-2">
          <div className="flex w-full max-w-xs justify-between text-sm text-gray-500">
            <span>Tạm tính:</span>
            <span>
              {Number(invoiceItem.subtotal || 0).toLocaleString("vi-VN")} VND
            </span>
          </div>

          {invoiceItem.discountAmount && invoiceItem.discountAmount > 0 && (
            <div className="flex w-full max-w-xs justify-between text-sm text-gray-500">
              <span>Giảm giá:</span>
              <span>
                -{Number(invoiceItem.discountAmount).toLocaleString("vi-VN")}{" "}
                VND
              </span>
            </div>
          )}

          {invoiceItem.deliveryFee && invoiceItem.deliveryFee > 0 && (
            <div className="flex w-full max-w-xs justify-between text-sm text-gray-500">
              <span>Phí vận chuyển:</span>
              <span>
                {Number(invoiceItem.deliveryFee).toLocaleString("vi-VN")} VND
              </span>
            </div>
          )}

          <div className="flex w-full max-w-xs justify-between text-base font-semibold text-gray-900">
            <span>Tổng cộng:</span>
            <span>
              {Number(invoiceItem.totalAmount).toLocaleString("vi-VN")} VND
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItems;
