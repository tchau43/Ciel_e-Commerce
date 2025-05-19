// src/features/admin/pages/AdminInvoicesManagementPage.tsx

import React, { useState } from "react";
import { useDebounce } from "use-debounce";

// Hooks and Services
import {
  useGetAllInvoicesQuery,
  AdminInvoiceFilterParams,
} from "@/services/invoice/getAllInvoicesQuery";
import { useUpdateInvoiceStatusMutation } from "@/services/invoice/updateInvoiceStatusMutation";

// Components UI
import InvoicesManagementTable from "@/features/admin/components/InvoicesManagementTable";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

// Icons and Types
import {
  AlertCircle,
  Search,
  Calendar as CalendarIcon,
  Filter,
  X,
} from "lucide-react";
import {
  UpdateInvoiceStatusInput,
  OrderStatus,
  PaymentStatus,
} from "@/types/dataTypes";

const AdminInvoicesManagementPage = () => {
  // Filter states
  const [filters, setFilters] = useState<AdminInvoiceFilterParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Update filters with debounced search term
  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: debouncedSearchTerm || undefined,
      page: 1, // Reset to page 1 when search changes
    }));
  }, [debouncedSearchTerm]);

  // Fetch data using our enhanced query
  const { data, isLoading, isError, isFetching } =
    useGetAllInvoicesQuery(filters);

  const updateStatusMutation = useUpdateInvoiceStatusMutation();

  // --- Handlers ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (!data?.totalPages || newPage <= data.totalPages)) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to page 1 when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      searchTerm: debouncedSearchTerm || undefined,
    });
    setSearchTerm(searchTerm); // Keep current search
  };

  const handleUpdateStatus = (
    invoiceId: string,
    newStatus: UpdateInvoiceStatusInput
  ) => {
    updateStatusMutation.mutate({ invoiceId, variables: newStatus });
  };

  const handleDateSelect = (
    date: Date | undefined,
    type: "fromDate" | "toDate"
  ) => {
    if (date) {
      handleFilterChange(type, format(date, "yyyy-MM-dd"));
    } else {
      handleFilterChange(type, undefined);
    }
  };

  // --- Render Logic ---
  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground animate-pulse">
          Đang tải dữ liệu hóa đơn...
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
          Không thể tải dữ liệu hóa đơn. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  console.log("Search term:", debouncedSearchTerm);
  console.log("Filters sent to query:", filters);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Quản lý Hóa đơn</h1>
        <Button
          variant="outline"
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="flex items-center gap-2"
        >
          {showFilterPanel ? <X size={16} /> : <Filter size={16} />}
          {showFilterPanel ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm theo tên, email hoặc mã hóa đơn..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8 w-full"
          />
        </div>

        {isFetching && (
          <span className="text-sm text-muted-foreground animate-pulse">
            Đang tải dữ liệu...
          </span>
        )}

        {data?.totalInvoices !== undefined && !isFetching && (
          <span className="text-sm text-muted-foreground">
            Tổng cộng: {data.totalInvoices} hóa đơn
            {data.totalPages > 0 &&
              ` (Trang ${data.currentPage}/${data.totalPages})`}
          </span>
        )}
      </div>

      {/* Filter panel */}
      {showFilterPanel && (
        <div className="bg-muted/30 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Bộ lọc nâng cao</h3>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Xóa bộ lọc
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Order Status filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái đơn hàng</label>
              <Select
                value={filters.orderStatus || ""}
                onValueChange={(value) =>
                  handleFilterChange("orderStatus", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả trạng thái</SelectItem>
                  {Object.values(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === OrderStatus.PROCESSING
                        ? "Đang xử lý"
                        : status === OrderStatus.SHIPPED
                        ? "Đã giao hàng"
                        : status === OrderStatus.DELIVERED
                        ? "Đã nhận hàng"
                        : status === OrderStatus.CANCELLED
                        ? "Đã hủy"
                        : status === OrderStatus.RETURNED
                        ? "Đã trả hàng"
                        : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Trạng thái thanh toán
              </label>
              <Select
                value={filters.paymentStatus || ""}
                onValueChange={(value) =>
                  handleFilterChange("paymentStatus", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả trạng thái</SelectItem>
                  {Object.values(PaymentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === PaymentStatus.PENDING
                        ? "Chờ thanh toán"
                        : status === PaymentStatus.PAID
                        ? "Đã thanh toán"
                        : status === PaymentStatus.FAILED
                        ? "Thất bại"
                        : status === PaymentStatus.REFUNDED
                        ? "Đã hoàn tiền"
                        : status === PaymentStatus.CANCELLED
                        ? "Đã hủy"
                        : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Date filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Từ ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.fromDate ? (
                      format(new Date(filters.fromDate), "dd/MM/yyyy")
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      filters.fromDate ? new Date(filters.fromDate) : undefined
                    }
                    onSelect={(date) => handleDateSelect(date, "fromDate")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Đến ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.toDate ? (
                      format(new Date(filters.toDate), "dd/MM/yyyy")
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      filters.toDate ? new Date(filters.toDate) : undefined
                    }
                    onSelect={(date) => handleDateSelect(date, "toDate")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Min Amount filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá trị tối thiểu</label>
              <Input
                type="number"
                placeholder="Nhập số tiền"
                value={filters.minAmount || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "minAmount",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            {/* Max Amount filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá trị tối đa</label>
              <Input
                type="number"
                placeholder="Nhập số tiền"
                value={filters.maxAmount || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "maxAmount",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            {/* Sort options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sắp xếp theo</label>
              <Select
                value={filters.sortBy || "createdAt"}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trường sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                  <SelectItem value="totalAmount">Tổng tiền</SelectItem>
                  <SelectItem value="orderStatus">
                    Trạng thái đơn hàng
                  </SelectItem>
                  <SelectItem value="paymentStatus">
                    Trạng thái thanh toán
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Thứ tự sắp xếp</label>
              <Select
                value={filters.sortOrder || "desc"}
                onValueChange={(value) =>
                  handleFilterChange("sortOrder", value as "asc" | "desc")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thứ tự" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Giảm dần</SelectItem>
                  <SelectItem value="asc">Tăng dần</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Số mục trên trang</label>
              <Select
                value={String(filters.limit || 10)}
                onValueChange={(value) =>
                  handleFilterChange("limit", Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn số mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <InvoicesManagementTable
        data={data?.invoices || []}
        onUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={updateStatusMutation.isPending}
      />

      {data?.invoices.length === 0 && !isFetching && (
        <p className="text-center text-muted-foreground my-8">
          Không tìm thấy hóa đơn nào.
        </p>
      )}

      {/* Pagination using backend pagination */}
      {data?.totalPages && data.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(data.currentPage - 1);
                }}
                className={
                  data.currentPage <= 1
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>

            {/* First page */}
            {data.currentPage > 2 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(1);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis for start */}
            {data.currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Previous page */}
            {data.currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(data.currentPage - 1);
                  }}
                >
                  {data.currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Current page */}
            <PaginationItem>
              <PaginationLink
                href="#"
                isActive
                onClick={(e) => e.preventDefault()}
              >
                {data.currentPage}
              </PaginationLink>
            </PaginationItem>

            {/* Next page */}
            {data.currentPage < data.totalPages && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(data.currentPage + 1);
                  }}
                >
                  {data.currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis for end */}
            {data.currentPage < data.totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Last page */}
            {data.currentPage < data.totalPages - 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(data.totalPages);
                  }}
                >
                  {data.totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(data.currentPage + 1);
                }}
                className={
                  data.currentPage >= data.totalPages
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default AdminInvoicesManagementPage;
