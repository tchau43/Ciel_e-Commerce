import { ProductData } from "@/types/dataTypes";

interface ProductIntroProps {
  data: ProductData;
}

const ProductIntro = ({ data }: ProductIntroProps) => {
  return (
    <>
      <div className="w-48 ">
        <img
          className="aspect-[3/4] w-48"
          // src={data.images}
          src="https://placehold.co/300x400"
          alt={data.name}
        ></img>
        <p className="text-sm text-center line-clamp-2 min-h-[2.5em] leading-tight">
          {data.name}
        </p>
      </div>
    </>
  );
};

export default ProductIntro;
