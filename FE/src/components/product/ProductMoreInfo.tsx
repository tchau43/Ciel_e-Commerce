import { useGetProductByIdQuery } from "@/services/product/getProductByIdQuery";
import { useParams } from "react-router-dom";

const ProductMoreInfo = () => {
  const { id } = useParams();
  // console.log("id12", id);
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id!);

  return <>{product?.moreInfomation}</>;
};
export default ProductMoreInfo;
