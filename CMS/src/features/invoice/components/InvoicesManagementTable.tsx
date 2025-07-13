

import { useMemo, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Invoice,
  OrderStatus,
  PaymentStatus,
  UpdateInvoiceStatusInput,
} from "@/types/dataTypes";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";


interface InvoicesManagementTableProps {
  data: Invoice[];
  onUpdateStatus: (
    invoiceId: string,
    newStatus: UpdateInvoiceStatusInput
  ) => void;
  isUpdatingStatus: boolean;
}


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getOrderStatusVariant = (
  status: OrderStatus
): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case OrderStatus.PROCESSING:
      return "secondary";
    case OrderStatus.SHIPPED:
      return "default";
    case OrderStatus.DELIVERED:
      return "default";
    case OrderStatus.CANCELLED:
      return "destructive";
    case OrderStatus.RETURNED:
      return "destructive";
    case OrderStatus.PENDING:
    default:
      return "outline";
  }
};

const getPaymentStatusVariant = (
  status: PaymentStatus
): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case PaymentStatus.PAID:
      return "default";
    case PaymentStatus.PENDING:
      return "outline";
    case PaymentStatus.FAILED:
      return "destructive";
    case PaymentStatus.REFUNDED:
      return "destructive";
    case PaymentStatus.CANCELLED:
      return "destructive";
    default:
      return "outline";
  }
};

const translateOrderStatus = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return "Chờ xử lý";
    case OrderStatus.PROCESSING:
      return "Đang xử lý";
    case OrderStatus.SHIPPED:
      return "Đã giao hàng";
    case OrderStatus.DELIVERED:
      return "Đã nhận hàng";
    case OrderStatus.CANCELLED:
      return "Đã hủy";
    case OrderStatus.RETURNED:
      return "Đã trả hàng";
    default:
      return status;
  }
};

const translatePaymentStatus = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PENDING:
      return "Chờ thanh toán";
    case PaymentStatus.PAID:
      return "Đã thanh toán";
    case PaymentStatus.FAILED:
      return "Thất bại";
    case PaymentStatus.REFUNDED:
      return "Đã hoàn tiền";
    case PaymentStatus.CANCELLED:
      return "Đã hủy";
    default:
      return status;
  }
};


const InvoicesManagementTable = ({
  data,
  onUpdateStatus,
  isUpdatingStatus,
}: InvoicesManagementTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Invoice | "user.name" | null;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });

  const itemsPerPage = 8;

  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal: any;
        let bVal: any;
        const key = sortConfig.key!;

        if (key === "user.name") {
          aVal = a.user?.name?.toLowerCase() || "";
          bVal = b.user?.name?.toLowerCase() || "";
        } else if (key === "totalAmount") {
          aVal = a.totalAmount;
          bVal = b.totalAmount;
        } else if (key === "createdAt") {
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
        } else if (key === "orderStatus") {
          aVal = a.orderStatus.toLowerCase();
          bVal = b.orderStatus.toLowerCase();
        } else if (key === "paymentStatus") {
          aVal = a.paymentStatus.toLowerCase();
          bVal = b.paymentStatus.toLowerCase();
        } else {
          aVal = (a as any)[key] ?? "";
          bVal = (b as any)[key] ?? "";
        }

        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          aVal = aNum;
          bVal = bNum;
        } else if (typeof aVal === "string" && typeof bVal === "string") {
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

  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (key: keyof Invoice | "user.name") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleStatusChange = (
    invoiceId: string,
    type: "orderStatus" | "paymentStatus",
    value: string
  ) => {
    if (!value) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn cập nhật ${
          type === "orderStatus"
            ? "trạng thái đơn hàng"
            : "trạng thái thanh toán"
        } không?`
      )
    ) {
      return;
    }
    const variables: UpdateInvoiceStatusInput = {};
    if (type === "orderStatus") {
      variables.orderStatus = value as OrderStatus;
    } else {
      variables.paymentStatus = value as PaymentStatus;
    }
    onUpdateStatus(invoiceId, variables);
  };

  const SortIcon = ({
    columnKey,
  }: {
    columnKey: keyof Invoice | "user.name";
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
    <Card className="border border-border/10 dark:border-border/20 bg-card/95 dark:bg-card/90 backdrop-blur-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="border-b border-border/10 dark:border-border/20 bg-muted/30 dark:bg-muted/20">
            <TableRow>
              <TableHead className="pl-6 py-3 text-muted-foreground/70 dark:text-muted-foreground/60 w-[150px] text-xs font-semibold uppercase tracking-wider">
                Mã HĐ
              </TableHead>
              <TableHead
                className="py-3 cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors text-xs font-semibold uppercase tracking-wider"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  Ngày tạo <SortIcon columnKey="createdAt" />
                </div>
              </TableHead>
              <TableHead
                className="py-3 cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors text-xs font-semibold uppercase tracking-wider"
                onClick={() => handleSort("user.name")}
              >
                <div className="flex items-center">
                  Người dùng <SortIcon columnKey="user.name" />
                </div>
              </TableHead>
              <TableHead
                className="py-3 cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors text-right text-xs font-semibold uppercase tracking-wider"
                onClick={() => handleSort("totalAmount")}
              >
                <div className="flex items-center justify-end">
                  Tổng tiền <SortIcon columnKey="totalAmount" />
                </div>
              </TableHead>
              <TableHead className="py-3 text-center text-muted-foreground/70 dark:text-muted-foreground/60 w-[180px] text-xs font-semibold uppercase tracking-wider">
                TT Thanh toán
              </TableHead>
              <TableHead className="py-3 text-center text-muted-foreground/70 dark:text-muted-foreground/60 w-[180px] text-xs font-semibold uppercase tracking-wider">
                TT Đơn hàng
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((invoice) => (
                <TableRow
                  key={invoice._id}
                  className="hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors border-b border-border/10 dark:border-border/20 last:border-b-0"
                >
                  <TableCell className="pl-6 py-3 font-mono text-xs text-muted-foreground/70 dark:text-muted-foreground/60">
                    {invoice._id}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground/70 dark:text-muted-foreground/60">
                    {format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="font-medium text-foreground/90 dark:text-foreground/80">
                      {invoice.user?.name || "N/A"}
                    </span>
                    <span className="block text-xs text-muted-foreground/70 dark:text-muted-foreground/60">
                      {invoice.user?.email}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right font-medium text-foreground/90 dark:text-foreground/80">
                    {formatCurrency(invoice.totalAmount)}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Select
                      value={invoice.paymentStatus}
                      onValueChange={(value) =>
                        handleStatusChange(invoice._id, "paymentStatus", value)
                      }
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger
                        className={`h-8 text-xs w-[150px] focus:ring-0 focus:ring-offset-0 border-border/20 dark:border-border/10 bg-background/95 dark:bg-background/90 ${
                          getPaymentStatusVariant(invoice.paymentStatus) ===
                          "default"
                            ? "text-green-700 dark:text-green-400"
                            : getPaymentStatusVariant(invoice.paymentStatus) ===
                              "destructive"
                            ? "text-red-700 dark:text-red-400"
                            : "text-foreground/80 dark:text-foreground/70"
                        }`}
                      >
                        {translatePaymentStatus(invoice.paymentStatus)}
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 dark:bg-background/90 border-border/20 dark:border-border/10">
                        {Object.values(PaymentStatus).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="text-xs text-foreground/90 dark:text-foreground/80"
                          >
                            {translatePaymentStatus(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Select
                      value={invoice.orderStatus}
                      onValueChange={(value) =>
                        handleStatusChange(invoice._id, "orderStatus", value)
                      }
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger
                        className={`h-8 text-xs w-[150px] focus:ring-0 focus:ring-offset-0 border-border/20 dark:border-border/10 bg-background/95 dark:bg-background/90 ${
                          getOrderStatusVariant(invoice.orderStatus) ===
                          "default"
                            ? "text-green-700 dark:text-green-400"
                            : getOrderStatusVariant(invoice.orderStatus) ===
                              "destructive"
                            ? "text-red-700 dark:text-red-400"
                            : getOrderStatusVariant(invoice.orderStatus) ===
                              "secondary"
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-foreground/80 dark:text-foreground/70"
                        }`}
                      >
                        {translateOrderStatus(invoice.orderStatus)}
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 dark:bg-background/90 border-border/20 dark:border-border/10">
                        {Object.values(OrderStatus).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="text-xs text-foreground/90 dark:text-foreground/80"
                          >
                            {translateOrderStatus(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <p className="text-base">Không tìm thấy hóa đơn nào.</p>
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
            Trang {currentPage} / {totalPages} (Tổng: {data.length} hóa đơn)
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

export default InvoicesManagementTable;
