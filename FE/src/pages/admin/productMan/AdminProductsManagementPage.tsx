import { useGetAllProductsQuery } from "@/services/product/getAllProductsQuery";
import ProductsManagementTable from "../../../components/admin/mangement/ProductsManagementTable";

const AdminProductsManagementPage = () => {
  const {
    data: productsList = [],
    isLoading,
    isError,
  } = useGetAllProductsQuery();

  if (isLoading)
    return (
      <p className="text-center text-gray-600">Loading products data...</p>
    );

  return (
    <>
      <ProductsManagementTable data={productsList} />
    </>
  );
};

export default AdminProductsManagementPage;
