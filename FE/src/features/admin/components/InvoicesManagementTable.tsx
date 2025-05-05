// src/features/admin/components/InvoicesManagementTable.tsx

// Removed unused 'React' import
import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Removed unused 'Badge' import (using Select for status)
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Invoice, OrderStatus, PaymentStatus } from "@/types/dataTypes";
import { useUpdateInvoiceStatusMutation } from "@/services/invoice/updateInvoiceStatusMutation";
import { format } from "date-fns"; // Ensure date-fns is installed
import { vi } from "date-fns/locale"; // Ensure date-fns is installed
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
// Removed unused 'toast' import (handled in mutation hook)

interface InvoicesManagementTableProps {
  data: Invoice[];
  // Removed unused 'title' prop from interface if not needed elsewhere
  // title?: string;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Helper function to get badge variant based on OrderStatus
const getOrderStatusVariant = (
  status: OrderStatus
): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case OrderStatus.PENDING:
      return "outline";
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
    default:
      return "outline";
  }
};

// Helper function to get badge variant based on PaymentStatus
const getPaymentStatusVariant = (
  status: PaymentStatus
): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case PaymentStatus.PENDING:
      return "outline";
    case PaymentStatus.PAID:
      return "default";
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

// Function to translate OrderStatus to Vietnamese
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

// Function to translate PaymentStatus to Vietnamese
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

// Removed unused 'title' prop from destructuring
const InvoicesManagementTable = ({ data }: InvoicesManagementTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Invoice | "user.name" | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const itemsPerPage = 10;

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateInvoiceStatusMutation();

  // --- Sorting Logic ---
  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if (sortConfig.key === "user.name") {
          aVal = a.user?.name?.toLowerCase() || "";
          bVal = b.user?.name?.toLowerCase() || "";
        } else if (sortConfig.key === "totalAmount") {
          aVal = a.totalAmount;
          bVal = b.totalAmount;
        } else if (sortConfig.key === "createdAt") {
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
        } else if (sortConfig.key === "orderStatus") {
          aVal = a.orderStatus.toLowerCase();
          bVal = b.orderStatus.toLowerCase();
        } else if (sortConfig.key === "paymentStatus") {
          aVal = a.paymentStatus.toLowerCase();
          bVal = b.paymentStatus.toLowerCase();
        } else {
          aVal = a[sortConfig.key as keyof Invoice];
          bVal = b[sortConfig.key as keyof Invoice];
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const handleSort = (key: keyof Invoice | "user.name") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  // --- Pagination Logic ---
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- Status Update Logic ---
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

    const variables: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    } = {};
    if (type === "orderStatus") {
      variables.orderStatus = value as OrderStatus;
    } else {
      variables.paymentStatus = value as PaymentStatus;
    }

    updateStatus({ invoiceId, variables });
  };

  // Helper for sort icons
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
    <Card className="border bg-card rounded-lg overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="border-b bg-muted/30">
            <TableRow>
              <TableHead className="pl-6 text-muted-foreground w-[150px]">
                Mã HĐ
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  Ngày tạo <SortIcon columnKey="createdAt" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleSort("user.name")}
              >
                <div className="flex items-center">
                  Người dùng <SortIcon columnKey="user.name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors text-right"
                onClick={() => handleSort("totalAmount")}
              >
                <div className="flex items-center justify-end">
                  Tổng tiền <SortIcon columnKey="totalAmount" />
                </div>
              </TableHead>
              <TableHead className="text-center text-muted-foreground w-[180px]">
                TT Thanh toán
              </TableHead>
              <TableHead className="text-center text-muted-foreground w-[180px]">
                TT Đơn hàng
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((invoice) => (
                <TableRow
                  key={invoice._id}
                  className="hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors border-b last:border-b-0"
                >
                  <TableCell className="pl-6 py-3 font-mono text-xs text-muted-foreground">
                    {invoice._id}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </TableCell>
                  <TableCell className="py-3 font-medium text-foreground/90 dark:text-foreground/80">
                    {invoice.user?.name || "N/A"}
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
                        className={`h-8 text-xs w-[150px] focus:ring-0 focus:ring-offset-0 ${
                          getPaymentStatusVariant(invoice.paymentStatus) ===
                          "default"
                            ? "border-green-500 text-green-700 dark:border-green-600 dark:text-green-400"
                            : getPaymentStatusVariant(invoice.paymentStatus) ===
                              "destructive"
                            ? "border-red-500 text-red-700 dark:border-red-600 dark:text-red-400"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PaymentStatus).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="text-xs"
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
                        className={`h-8 text-xs w-[150px] focus:ring-0 focus:ring-offset-0 ${
                          getOrderStatusVariant(invoice.orderStatus) ===
                          "default"
                            ? "border-green-500 text-green-700 dark:border-green-600 dark:text-green-400"
                            : getOrderStatusVariant(invoice.orderStatus) ===
                              "destructive"
                            ? "border-red-500 text-red-700 dark:border-red-600 dark:text-red-400"
                            : getOrderStatusVariant(invoice.orderStatus) ===
                              "secondary"
                            ? "border-blue-500 text-blue-700 dark:border-blue-600 dark:text-blue-400"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(OrderStatus).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="text-xs"
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
                  className="h-24 text-center text-muted-foreground"
                >
                  Không tìm thấy hóa đơn nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t pt-4 pb-4">
          <div className="text-xs text-muted-foreground">
            Trang {currentPage} / {totalPages} (Tổng: {sortedData.length} hóa
            đơn)
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isUpdatingStatus}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isUpdatingStatus}
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

export default InvoicesManagementTable;
