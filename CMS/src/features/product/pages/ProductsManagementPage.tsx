// src/pages/admin/ProductsManagementPage.tsx (or wherever it resides)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllProductsQuery } from "@/services/product/getAllProductsQuery";
// Correct the import path if necessary
import ProductsManagementTable from "@/features/product/components/ProductsManagementTable";
import { AlertCircle, Search, Plus } from "lucide-react"; // Icon for error and search, added Plus icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Alert component
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Added Button import

const ProductsManagementPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: productsList = [], // Default to empty array
    isLoading,
    isError,
  } = useGetAllProductsQuery(); // Removed options object for simplicity, add back if needed

  // Filter products based on search term
  const filteredProducts = productsList.filter((product) =>
    Object.values({
      name: product.name,
      category: product.category?.name || "",
      brand: product.brand?.name || "",
      price: product.base_price.toString(),
    }).some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      // Simple loading indicator (you can replace with a spinner component)
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground/70 dark:text-muted-foreground/60 animate-pulse">
          Đang tải dữ liệu sản phẩm...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant="destructive"
        className="mt-4 bg-destructive/10 dark:bg-destructive/20 border-destructive/20 dark:border-destructive/30"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-destructive-foreground/90 dark:text-destructive-foreground/80">
          Lỗi
        </AlertTitle>
        <AlertDescription className="text-destructive-foreground/80 dark:text-destructive-foreground/70">
          Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.
          {/* Optional: Display error details for debugging */}
          {/* <pre className="mt-2 text-xs">{error?.message || JSON.stringify(error)}</pre> */}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background/50 dark:bg-background/30">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground/90 dark:text-foreground/80">
          Quản lý Sản phẩm
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 dark:text-muted-foreground/60" />
            <Input
              placeholder="Tìm kiếm theo tên, danh mục, thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40"
            />
          </div>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => navigate("/products/create")}
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-foreground/90 dark:text-foreground/80">
            Danh sách sản phẩm
          </h2>
          <p className="text-sm text-muted-foreground/70 dark:text-muted-foreground/60">
            Tổng cộng: {filteredProducts.length} sản phẩm
            {searchTerm && ` (đang lọc theo: "${searchTerm}")`}
          </p>
        </div>
      </div>
      <ProductsManagementTable data={filteredProducts} />
    </div>
  );
};

export default ProductsManagementPage;
