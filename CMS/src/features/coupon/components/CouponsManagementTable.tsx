import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteCouponMutation } from "@/services/coupon/deleteCouponMutation";
import EditCoupon from "@/features/coupon/components/EditCoupon";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CouponData {
  _id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minPurchaseAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface CouponsManagementTableProps {
  data: CouponData[];
}

const CouponsManagementTable = ({ data }: CouponsManagementTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CouponData | null;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });

  const deleteCouponMutation = useDeleteCouponMutation();
  const itemsPerPage = 8;

  // Sorting logic
  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal: any = a[sortConfig.key!];
        let bVal: any = b[sortConfig.key!];

        if (sortConfig.key === "createdAt" || sortConfig.key === "expiresAt") {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (key: keyof CouponData) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const showEditModal = (id: string) => {
    setSelectedCoupon(id);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedCoupon(null);
  };

  const showDeleteDialog = (id: string) => {
    setSelectedCoupon(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    try {
      await deleteCouponMutation.mutateAsync(selectedCoupon);
      setIsDeleteDialogOpen(false);
      setSelectedCoupon(null);
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Helper for sort icons
  const SortIcon = ({ columnKey }: { columnKey: keyof CouponData }) => {
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
      <CardContent className="p-0">
        <Table>
          <TableHeader className="border-b border-border/10 dark:border-border/20 bg-muted/30 dark:bg-muted/20">
            <TableRow>
              <TableHead
                className="cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors pl-6"
                onClick={() => handleSort("code")}
              >
                <div className="flex items-center">
                  Mã giảm giá <SortIcon columnKey="code" />
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground/70 dark:text-muted-foreground/60">
                Mô tả
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors"
                onClick={() => handleSort("discountValue")}
              >
                <div className="flex items-center">
                  Giá trị <SortIcon columnKey="discountValue" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors"
                onClick={() => handleSort("minPurchaseAmount")}
              >
                <div className="flex items-center">
                  Đơn tối thiểu <SortIcon columnKey="minPurchaseAmount" />
                </div>
              </TableHead>
              <TableHead className="text-center text-muted-foreground/70 dark:text-muted-foreground/60">
                Lượt dùng
              </TableHead>
              <TableHead
                className="cursor-pointer text-center text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors"
                onClick={() => handleSort("expiresAt")}
              >
                <div className="flex items-center justify-center">
                  Hết hạn <SortIcon columnKey="expiresAt" />
                </div>
              </TableHead>
              <TableHead className="text-center text-muted-foreground/70 dark:text-muted-foreground/60">
                Trạng thái
              </TableHead>
              <TableHead className="text-right pr-6 text-muted-foreground/70 dark:text-muted-foreground/60">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((coupon) => (
                <TableRow
                  key={coupon._id}
                  className="hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors border-b border-border/10 dark:border-border/20 last:border-b-0"
                >
                  <TableCell className="font-medium text-foreground/90 dark:text-foreground/80 pl-6">
                    {coupon.code}
                  </TableCell>
                  <TableCell className="text-muted-foreground/70 dark:text-muted-foreground/60">
                    {coupon.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground/70 dark:text-muted-foreground/60">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : formatCurrency(coupon.discountValue)}
                  </TableCell>
                  <TableCell className="text-muted-foreground/70 dark:text-muted-foreground/60">
                    {formatCurrency(coupon.minPurchaseAmount)}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground/70 dark:text-muted-foreground/60">
                    {coupon.usedCount}/{coupon.maxUses}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground/70 dark:text-muted-foreground/60">
                    {new Date(coupon.expiresAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={coupon.isActive ? "default" : "destructive"}
                      className={`capitalize text-xs px-2 py-0.5 ${
                        coupon.isActive
                          ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/30 dark:hover:bg-emerald-500/40"
                          : "bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground dark:bg-destructive/30 dark:hover:bg-destructive/40"
                      }`}
                    >
                      {coupon.isActive ? "Hoạt động" : "Vô hiệu"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/70 hover:text-primary/90 dark:text-muted-foreground/60 dark:hover:text-primary/80"
                        onClick={() => showEditModal(coupon._id)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Sửa mã giảm giá</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/70 hover:text-destructive dark:text-muted-foreground/60 dark:hover:text-destructive"
                        onClick={() => showDeleteDialog(coupon._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Xóa mã giảm giá</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground/70 dark:text-muted-foreground/60"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-base">Không tìm thấy mã giảm giá nào.</p>
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
            Trang {currentPage} / {totalPages} (Tổng: {data.length} mã giảm giá)
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

      {/* Edit Modal */}
      {selectedCoupon && (
        <EditCoupon
          open={isEditModalOpen}
          onCancel={handleEditModalClose}
          couponId={selectedCoupon}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mã giảm giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CouponsManagementTable;
