import { TiDeleteOutline } from "react-icons/ti";

const ProductInvoice = () => {
  return (
    <div className="px-4 w-full max-w-7xl h-20 flex items-center">
      <div className="w-36">
        <img
          className="size-16 object-cover"
          src="https://placehold.co/300x400"
        ></img>
      </div>
      <div className="flex-3">name</div>
      <div className="flex-1">price</div>
      <div className="flex-1">quantity</div>
    </div>
    // <div>sdfsdf</div>
  );
};

export default ProductInvoice;
