import { useParams } from "react-router-dom";
import UserUpdateForm from "@/components/admin/form/UserUpdateForm";
import { useGetProductByIdQuery } from "@/services/product/getProductByIdQuery";
import ProductUpdateForm from "../form/ProductUpdateForm";

const EditProduct: React.FC = () => {
  const { id } = useParams(); // Get user ID from URL
  console.log("id", id);
  const { data: product, error, isLoading } = useGetProductByIdQuery(id!);
  //   console.log("data", user);
  if (isLoading)
    return <p className="text-center text-gray-600">Loading product data...</p>;

  if (error) {
    console.error("Error fetching user:", error);
    return (
      <p className="text-center text-red-600">
        Error loading product. Please try again.
      </p>
    );
  }

  if (!product) {
    return <p className="text-center text-gray-600">product not found.</p>;
  }

  return (
    <>
      <ProductUpdateForm product={product!} />
    </>
  );
};

export default EditProduct;
