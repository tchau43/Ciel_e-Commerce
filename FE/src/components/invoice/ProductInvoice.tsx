import { InvoiceItems } from "@/types/dataTypes";

interface ProductInvoiceProps {
  product: InvoiceItems;
}

const ProductInvoice = ({ product }: ProductInvoiceProps) => {
  return (
    <div className="px-4 w-full max-w-7xl h-20 flex items-center">
      <div className="w-36">
        <img
          className="size-16 object-cover"
          src="https://placehold.co/300x400"
        ></img>
      </div>
      <div className="flex-3">{product?.product.name}</div>
      <div className="flex-2 text-center">{product?.quantity}</div>
      <div className="flex-2 text-center">{product?.priceAtPurchase}</div>
    </div>
    // <div>sdfsdf</div>
  );
};

export default ProductInvoice;
