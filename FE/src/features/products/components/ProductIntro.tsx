import { Product } from "@/types/dataTypes";
import { useNavigate } from "react-router-dom";

interface ProductIntroProps {
  data: Product;
}

const ProductIntro = ({ data }: ProductIntroProps) => {
  const navigate = useNavigate();

  const handleClickProduct = (id: string) => {
    navigate(`/product/${id}`, {});
  };

  // console.log("----------------------data.images[0]", data);

  return (
    <div
      className="w-48 hover:cursor-pointer flex flex-col"
      onClick={() => handleClickProduct(data._id)}
    >
      <img className="aspect-[3/4] w-48" src={data.images[0]} alt={data.name} />
      <p className="my-1 text-sm font-bold line-clamp-2 min-h-[2.5em] leading-tight">
        {data.name}
      </p>
      <p className="text-sm font-semibold text-red-300 line-clamp-1 min-h-[1.25em] leading-tight">
        {Number(data.base_price).toLocaleString("vi-VN")} VND
      </p>
    </div>
  );
};

export default ProductIntro;
