// src/pages/admin/AdminProductsManagementPage.tsx (or wherever it resides)

import { useGetAllProductsQuery } from "@/services/product/getAllProductsQuery";
// Correct the import path if necessary
import ProductsManagementTable from "@/features/admin/components/ProductsManagementTable";
import { AlertCircle } from "lucide-react"; // Icon for error
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Alert component

const AdminProductsManagementPage = () => {
  const {
    data: productsList = [], // Default to empty array
    isLoading,
    isError,
  } = useGetAllProductsQuery(); // Removed options object for simplicity, add back if needed

  if (isLoading) {
    return (
      // Simple loading indicator (you can replace with a spinner component)
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground animate-pulse">
          Đang tải dữ liệu sản phẩm...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>
          Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.
          {/* Optional: Display error details for debugging */}
          {/* <pre className="mt-2 text-xs">{error?.message || JSON.stringify(error)}</pre> */}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* You can add a page title and maybe a "Create Product" button here */}
      <h1 className="text-2xl font-semibold">Quản lý Sản phẩm</h1>
      {/* Removed the stray 'ks' text */}
      <ProductsManagementTable data={productsList} />
    </div>
  );
};

export default AdminProductsManagementPage;
