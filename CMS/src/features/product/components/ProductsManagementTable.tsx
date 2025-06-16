// src/features/admin/components/ProductsManagementTable.tsx

import { useState, useMemo, useEffect } from "react";
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

const ProductsManagementTable = ({ data }: ProductsManagementTableProps) => {
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
    navigate(`/editProduct/${_id}`);
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

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  return (
    <Card className="border border-border/10 dark:border-border/20 bg-card/95 dark:bg-card/90 backdrop-blur-sm">
      {/* Optional Title outside or via prop */}
      {/* <h2 className="text-xl font-semibold p-4">{title}</h2> */}

      <CardContent className="p-0">
        <Table>
          <TableHeader className="border-b border-border/10 dark:border-border/20 bg-muted/30 dark:bg-muted/20">
            <TableRow>
              <TableHead className="w-16 pl-6 text-muted-foreground/70 dark:text-muted-foreground/60">
                Ảnh
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Tên sản phẩm <SortIcon columnKey="name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors w-[120px]"
                onClick={() => handleSort("base_price")}
              >
                <div className="flex items-center">
                  Giá <SortIcon columnKey="base_price" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors w-[150px]"
                onClick={() => handleSort("category.name")}
              >
                <div className="flex items-center">
                  Danh mục <SortIcon columnKey="category.name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors w-[150px]"
                onClick={() => handleSort("brand.name")}
              >
                <div className="flex items-center">
                  Thương hiệu <SortIcon columnKey="brand.name" />
                </div>
              </TableHead>
              {/* Add other sortable columns like quantity if needed */}
              {/* <TableHead className="text-center text-muted-foreground w-[100px]">Tồn kho</TableHead> */}
              {/* <TableHead className="text-center text-muted-foreground w-[100px]">Trạng thái</TableHead> */}
              <TableHead className="text-right w-20 pr-6 text-muted-foreground/70 dark:text-muted-foreground/60">
                Sửa
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((product) => (
                <TableRow
                  key={product._id}
                  className="hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors border-b border-border/10 dark:border-border/20 last:border-b-0"
                >
                  <TableCell className="pl-6 py-2">
                    <Avatar className="h-10 w-10 rounded-md ring-1 ring-border/10 dark:ring-border/20">
                      <AvatarImage
                        src={product.images?.[0] || "/placeholder-product.png"}
                        alt={product.name}
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder-product.png";
                        }}
                      />
                      <AvatarFallback className="rounded-md text-xs bg-muted/40 dark:bg-muted/30">
                        {product.name?.[0]?.toUpperCase() || "SP"}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-foreground/90 dark:text-foreground/80 py-2 align-top">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground/70 dark:text-muted-foreground/60 py-2 align-top">
                    {formatCurrency(product.base_price)}
                  </TableCell>
                  <TableCell className="text-muted-foreground/70 dark:text-muted-foreground/60 py-2 align-top">
                    {product.category?.name || "Chưa phân loại"}
                  </TableCell>
                  <TableCell className="text-muted-foreground/70 dark:text-muted-foreground/60 py-2 align-top">
                    {product.brand?.name || "Chưa phân loại"}
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
                      className="h-8 w-8 text-muted-foreground/70 hover:text-primary/90 dark:text-muted-foreground/60 dark:hover:text-primary/80"
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
                  className="h-24 text-center text-muted-foreground/70 dark:text-muted-foreground/60"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-base">Không tìm thấy sản phẩm nào.</p>
                    <p className="text-sm text-muted-foreground/60 dark:text-muted-foreground/50">
                      Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t border-border/10 dark:border-border/20 pt-4 pb-4">
          <div className="text-xs text-muted-foreground/70 dark:text-muted-foreground/60">
            Trang {currentPage} / {totalPages} (Tổng: {data.length} sản phẩm)
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-border/20 dark:border-border/10 hover:bg-muted/30 dark:hover:bg-muted/20"
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 border-border/20 dark:border-border/10 hover:bg-muted/30 dark:hover:bg-muted/20"
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
