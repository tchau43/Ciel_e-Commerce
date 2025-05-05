// src/features/admin/components/ProductsManagementTable.tsx

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For product images
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// Corrected import: Use Product instead of ProductData
import { Product } from "@/types/dataTypes";
import {
  Pencil,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown, // For sort indicator placeholder
  ArrowUp, // For ascending sort
  ArrowDown, // For descending sort
} from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn utility

interface ProductsManagementTableProps {
  data: Product[]; // Use the correct Product type
  title?: string;
}

// Helper function to format currency (Vietnamese Dong)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductsManagementTable = ({
  data,
  title = "Quản lý Sản phẩm",
}: ProductsManagementTableProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product | "category.name" | "brand.name" | null; // Allow nested keys
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const itemsPerPage = 8; // Adjust as needed

  // Sorting logic
  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        // Handle nested and direct properties for sorting
        if (sortConfig.key === "category.name") {
          aVal = a.category?.name?.toLowerCase() || "";
          bVal = b.category?.name?.toLowerCase() || "";
        } else if (sortConfig.key === "brand.name") {
          aVal = a.brand?.name?.toLowerCase() || "";
          bVal = b.brand?.name?.toLowerCase() || "";
        } else if (sortConfig.key === "base_price") {
          aVal = a.base_price;
          bVal = b.base_price;
        } else if (sortConfig.key === "name") {
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
        } else {
          // Fallback for other direct keys (add more specific cases if needed)
          aVal = a[sortConfig.key as keyof Product];
          bVal = b[sortConfig.key as keyof Product];
        }

        // Comparison logic
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const handleSort = (key: keyof Product | "category.name" | "brand.name") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1); // Reset to first page on sort
  };

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (_id: string) => {
    navigate(`/admin/editProduct/${_id}`);
  };

  // Helper for sort icons
  const SortIcon = ({
    columnKey,
  }: {
    columnKey: keyof Product | "category.name" | "brand.name";
  }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/70" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-2 h-3 w-3" />
    );
  };

  return (
    <Card className="border bg-card rounded-lg overflow-hidden">
      {/* Optional Title outside or via prop */}
      {/* <h2 className="text-xl font-semibold p-4">{title}</h2> */}

      <CardContent className="p-0">
        <Table>
          <TableHeader className="border-b bg-muted/30">
            <TableRow>
              <TableHead className="w-16 pl-6 text-muted-foreground">
                Ảnh
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Tên sản phẩm <SortIcon columnKey="name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors w-[120px]" // Fixed width for price
                onClick={() => handleSort("base_price")}
              >
                <div className="flex items-center">
                  Giá <SortIcon columnKey="base_price" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors w-[150px]" // Fixed width
                onClick={() => handleSort("category.name")}
              >
                <div className="flex items-center">
                  Danh mục <SortIcon columnKey="category.name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors w-[150px]" // Fixed width
                onClick={() => handleSort("brand.name")}
              >
                <div className="flex items-center">
                  Thương hiệu <SortIcon columnKey="brand.name" />
                </div>
              </TableHead>
              {/* Add other sortable columns like quantity if needed */}
              {/* <TableHead className="text-center text-muted-foreground w-[100px]">Tồn kho</TableHead> */}
              {/* <TableHead className="text-center text-muted-foreground w-[100px]">Trạng thái</TableHead> */}
              <TableHead className="text-right w-20 pr-6 text-muted-foreground">
                Sửa
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((product) => (
                <TableRow
                  key={product._id}
                  className="hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors border-b last:border-b-0"
                >
                  <TableCell className="pl-6 py-2">
                    {" "}
                    {/* Adjusted padding */}
                    <Avatar className="h-10 w-10 rounded-md">
                      {" "}
                      {/* Square avatar for products */}
                      <AvatarImage
                        src={product.images?.[0] || "/placeholder-product.png"} // Use first image or placeholder
                        alt={product.name}
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder-product.png"; // Fallback placeholder
                        }}
                      />
                      <AvatarFallback className="rounded-md text-xs">
                        {product.name?.[0]?.toUpperCase() || "P"}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-foreground/90 dark:text-foreground/80 py-2 align-top">
                    {" "}
                    {/* Align top */}
                    {product.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-2 align-top">
                    {formatCurrency(product.base_price)}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-2 align-top">
                    {product.category?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-2 align-top">
                    {product.brand?.name || "N/A"}{" "}
                    {/* Handle potentially missing brand */}
                  </TableCell>
                  {/* Add other cells like quantity, status if needed */}
                  {/* <TableCell className="text-center text-muted-foreground py-2 align-top">{product.variants.reduce((sum, v) => sum + v.stock, 0)}</TableCell> */}
                  {/* <TableCell className="text-center py-2 align-top">
                    <Badge variant={product.status ? "default" : "outline"} className="capitalize text-xs px-2 py-0.5">
                      {product.status ? "Đang bán" : "Ngừng bán"}
                    </Badge>
                  </TableCell> */}
                  <TableCell className="text-right pr-6 py-2 align-top">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleEdit(product._id)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Sửa sản phẩm</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không tìm thấy sản phẩm nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t pt-4 pb-4">
          <div className="text-xs text-muted-foreground">
            Trang {currentPage} / {totalPages} (Tổng: {data.length} sản phẩm)
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Trang sau</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductsManagementTable;
