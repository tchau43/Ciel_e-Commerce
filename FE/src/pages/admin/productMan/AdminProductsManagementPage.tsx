import { useGetAllProductsQuery } from "@/services/product/getAllProductsQuery";
import ProductsManagementTable from "../../../features/admin/components/ProductsManagementTable";

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
      ks
      <ProductsManagementTable data={productsList} />
    </>
  );
};

export default AdminProductsManagementPage;
