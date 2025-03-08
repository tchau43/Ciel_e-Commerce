// ProductWrapper.tsx
import { useParams } from "react-router-dom";
import Product from "./Product";

const ProductWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <Product key={id} />;
};

export default ProductWrapper;
