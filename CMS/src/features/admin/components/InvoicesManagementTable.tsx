// src/features/admin/components/InvoicesManagementTable.tsx

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  // SelectValue, // <-- Xóa import này
} from "@/components/ui/select";
import {
  Invoice,
  OrderStatus,
  PaymentStatus,
  UpdateInvoiceStatusInput,
} from "@/types/dataTypes";
import { format } from "date-fns";
import { vi } from "date-fns/locale"; // Đảm bảo đã cài: npm install date-fns
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

// --- Interface Props ---
interface InvoicesManagementTableProps {
  data: Invoice[];
  onUpdateStatus: (
    invoiceId: string,
    newStatus: UpdateInvoiceStatusInput
  ) => void;
  isUpdatingStatus: boolean;
}

// --- Helper Functions (Giữ nguyên) ---
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

// --- Component ---
const InvoicesManagementTable = ({
  data,
  onUpdateStatus,
  isUpdatingStatus,
}: InvoicesManagementTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Invoice | "user.name" | null;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });

  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      // Kiểm tra key khác null ở đây
      sortableData.sort((a, b) => {
        let aVal: any;
        let bVal: any;
        const key = sortConfig.key!; // <-- Khẳng định key không null ở đây cho tiện

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
          // Sử dụng key đã khẳng định không null
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
    <Card className="border bg-card rounded-lg overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="border-b bg-muted/40 dark:bg-muted/20">
            <TableRow>
              <TableHead className="pl-6 py-3 text-muted-foreground w-[150px] text-xs font-semibold uppercase tracking-wider">
                {" "}
                Mã HĐ{" "}
              </TableHead>
              <TableHead
                className="py-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  {" "}
                  Ngày tạo <SortIcon columnKey="createdAt" />{" "}
                </div>
              </TableHead>
              <TableHead
                className="py-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider"
                onClick={() => handleSort("user.name")}
              >
                <div className="flex items-center">
                  {" "}
                  Người dùng <SortIcon columnKey="user.name" />{" "}
                </div>
              </TableHead>
              <TableHead
                className="py-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors text-right text-xs font-semibold uppercase tracking-wider"
                onClick={() => handleSort("totalAmount")}
              >
                <div className="flex items-center justify-end">
                  {" "}
                  Tổng tiền <SortIcon columnKey="totalAmount" />{" "}
                </div>
              </TableHead>
              <TableHead className="py-3 text-center text-muted-foreground w-[180px] text-xs font-semibold uppercase tracking-wider">
                {" "}
                TT Thanh toán{" "}
              </TableHead>
              <TableHead className="py-3 text-center text-muted-foreground w-[180px] text-xs font-semibold uppercase tracking-wider">
                {" "}
                TT Đơn hàng{" "}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((invoice) => (
                <TableRow
                  key={invoice._id}
                  className="hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors border-b last:border-b-0"
                >
                  <TableCell className="pl-6 py-3 font-mono text-xs text-muted-foreground">
                    {" "}
                    {invoice._id}{" "}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {" "}
                    {format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}{" "}
                  </TableCell>
                  <TableCell className="py-3 font-medium text-foreground/90 dark:text-foreground/80">
                    {invoice.user?.name || "N/A"}
                    <span className="block text-xs text-muted-foreground">
                      {invoice.user?.email}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right font-medium text-foreground/90 dark:text-foreground/80">
                    {" "}
                    {formatCurrency(invoice.totalAmount)}{" "}
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
                        className={`h-8 text-xs w-[150px] focus:ring-0 focus:ring-offset-0 border ${getPaymentStatusVariant(
                          invoice.paymentStatus
                        )}`}
                      >
                        <span
                          className={`font-medium ${
                            getPaymentStatusVariant(invoice.paymentStatus) ===
                            "default"
                              ? "text-green-700 dark:text-green-400"
                              : getPaymentStatusVariant(
                                  invoice.paymentStatus
                                ) === "destructive"
                              ? "text-red-700 dark:text-red-400"
                              : "text-foreground/80"
                          }`}
                        >
                          {" "}
                          {translatePaymentStatus(invoice.paymentStatus)}{" "}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PaymentStatus).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="text-xs"
                          >
                            {" "}
                            {translatePaymentStatus(status)}{" "}
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
                        className={`h-8 text-xs w-[150px] focus:ring-0 focus:ring-offset-0 border ${getOrderStatusVariant(
                          invoice.orderStatus
                        )}`}
                      >
                        <span
                          className={`font-medium ${
                            getOrderStatusVariant(invoice.orderStatus) ===
                            "default"
                              ? "text-green-700 dark:text-green-400"
                              : getOrderStatusVariant(invoice.orderStatus) ===
                                "destructive"
                              ? "text-red-700 dark:text-red-400"
                              : getOrderStatusVariant(invoice.orderStatus) ===
                                "secondary"
                              ? "text-blue-700 dark:text-blue-400"
                              : "text-foreground/80"
                          }`}
                        >
                          {" "}
                          {translateOrderStatus(invoice.orderStatus)}{" "}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(OrderStatus).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="text-xs"
                          >
                            {" "}
                            {translateOrderStatus(status)}{" "}
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
                  {" "}
                  Không tìm thấy hóa đơn nào.{" "}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InvoicesManagementTable;
