import { useGetProductByIdQuery } from "@/services/product/getProductByIdQuery";
import { useParams } from "react-router-dom";

const ProductDescription = () => {
  const { id } = useParams();
  // console.log("id1", id);
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id!);
  return <>{product?.description}</>;
};
export default ProductDescription;
