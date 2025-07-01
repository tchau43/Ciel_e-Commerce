import { InvoiceItem } from "@/types/dataTypes";

interface ProductInvoiceProps {
  product: InvoiceItem;
}

const ProductInvoice = ({ product }: ProductInvoiceProps) => {
  const subtotal = product.quantity * product.priceAtPurchase;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 sm:px-6 sm:py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center col-span-1 sm:hidden mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{product.product.name}</h4>
          <p className="text-sm text-gray-500">
            {product.variant?.types || "Standard"}
          </p>
        </div>
        <div className="text-right">
          <span className="font-medium text-gray-900">
            {Number(subtotal).toLocaleString("vi-VN")} VND
          </span>
        </div>
      </div>

      <div className="hidden sm:flex col-span-5 items-center space-x-4">
        <div className="flex-shrink-0 h-16 w-16 rounded-md border border-gray-200 overflow-hidden bg-gray-100">
          {product.product.images && product.product.images.length > 0 ? (
            <img
              src={product.product.images[0]}
              alt={product.product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/300x400?text=No+Image";
              }}
            />
          ) : (
            <img
              src="https://placehold.co/300x400?text=No+Image"
              alt="Placeholder"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{product.product.name}</h4>
          <p className="text-sm text-gray-500">
            {product.variant?.types || "Standard"}
          </p>
          {product.product.brand && (
            <p className="text-xs text-gray-500">
              {product.product.brand.name}
            </p>
          )}
        </div>
      </div>

      <div className="sm:col-span-2 flex flex-col sm:items-center sm:justify-center">
        <span className="sm:hidden text-xs text-gray-500">Đơn giá:</span>
        <span className="font-medium text-gray-700">
          {Number(product.priceAtPurchase).toLocaleString("vi-VN")} VND
        </span>
      </div>

      <div className="sm:col-span-2 flex flex-col sm:items-center sm:justify-center">
        <span className="sm:hidden text-xs text-gray-500">Số lượng:</span>
        <span className="font-medium text-gray-700">{product.quantity}</span>
      </div>

      <div className="sm:col-span-3 flex flex-col sm:items-end sm:justify-center">
        <span className="sm:hidden text-xs text-gray-500">Thành tiền:</span>
        <span className="font-semibold text-gray-900">
          {Number(subtotal).toLocaleString("vi-VN")} VND
        </span>
      </div>
    </div>
  );
};

export default ProductInvoice;
