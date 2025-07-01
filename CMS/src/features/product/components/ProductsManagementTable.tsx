

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
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

import { Product } from "@/types/dataTypes";
import {
  Pencil,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
} from "lucide-react";

interface ProductsManagementTableProps {
  data: Product[]; 
  title?: string;
}


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
    key: keyof Product | "category.name" | "brand.name" | null; 
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const itemsPerPage = 8; 

  
  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        
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
          
          aVal = a[sortConfig.key as keyof Product];
          bVal = b[sortConfig.key as keyof Product];
        }

        
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
    setCurrentPage(1); 
  };

  
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

  
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  return (
    <Card className="border border-border/10 dark:border-border/20 bg-card/95 dark:bg-card/90 backdrop-blur-sm">
      
      

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
