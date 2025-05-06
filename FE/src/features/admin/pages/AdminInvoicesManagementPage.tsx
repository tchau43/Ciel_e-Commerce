// src/features/admin/pages/AdminInvoicesManagementPage.tsx

import React, { useState, useCallback } from "react"; // Xóa useEffect khỏi import
import { useDebounce } from "use-debounce";

// Hooks và Services
import { useGetAllInvoicesQuery } from "@/services/invoice/getAllInvoicesQuery";
import { useUpdateInvoiceStatusMutation } from "@/services/invoice/updateInvoiceStatusMutation";

// Components UI
import InvoicesManagementTable from "@/features/admin/components/InvoicesManagementTable";
// Sửa đường dẫn import và tên component Pagination
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis, // Import thêm Ellipsis nếu muốn dùng
} from "@/components/ui/pagination"; // <-- Sửa đường dẫn import
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "sonner";

// Icons và Types
import { AlertCircle, Search } from "lucide-react";
import { Invoice, UpdateInvoiceStatusInput } from "@/types/dataTypes";

const ITEMS_PER_PAGE = 10;

const AdminInvoicesManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const {
    data: queryResponse,
    isLoading,
    isError,
    isFetching,
  } = useGetAllInvoicesQuery({
    searchTerm: debouncedSearchTerm || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  console.log(
    "--------------------------------------queryResponse",
    queryResponse
  );

  const updateStatusMutation = useUpdateInvoiceStatusMutation();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (queryResponse?.totalPages ?? 1)) {
      setCurrentPage(newPage);
    }
  };

  const handleUpdateStatus = useCallback(
    (invoiceId: string, newStatus: UpdateInvoiceStatusInput) => {
      updateStatusMutation.mutate({ invoiceId, variables: newStatus });
    },
    [updateStatusMutation]
  );

  const invoicesList: Invoice[] = queryResponse?.invoices ?? [];
  const totalPages = queryResponse?.totalPages ?? 1;
  const totalInvoices = queryResponse?.totalInvoices ?? 0; // Biến này vẫn còn, có thể dùng để hiển thị

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

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Quản lý Hóa đơn</h1>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Thanh tìm kiếm */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8 w-full"
          />
        </div>
        {/* Hiển thị tổng số lượng (ví dụ) */}
        {!isLoading && !isFetching && totalInvoices > 0 && (
          <span className="text-sm text-muted-foreground">
            Tổng cộng: {totalInvoices} hóa đơn
          </span>
        )}
      </div>

      {(isLoading || isFetching) && !isError && (
        <div className="flex justify-center items-center h-40">
          <p className="text-muted-foreground animate-pulse">Đang tải...</p>
        </div>
      )}

      {!isLoading && !isFetching && (
        <>
          <InvoicesManagementTable
            data={invoicesList}
            onUpdateStatus={handleUpdateStatus}
            isUpdatingStatus={updateStatusMutation.isPending}
          />
          {invoicesList.length === 0 && !isFetching && (
            <p className="text-center text-muted-foreground mt-4">
              Không tìm thấy hóa đơn nào.
            </p>
          )}
        </>
      )}

      {/* Phân trang sử dụng component từ shadcn/ui */}
      {totalPages > 1 &&
        !isLoading &&
        !isFetching &&
        invoicesList.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#" // Dùng href="#" và preventDefault để tránh reload trang
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  // Disable nút Previous nếu đang ở trang đầu
                  className={
                    currentPage <= 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>

              {/* Logic hiển thị số trang có thể phức tạp hơn, đây là ví dụ đơn giản */}
              {/* Ví dụ chỉ hiển thị trang hiện tại */}
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
              {/* Bạn có thể thêm logic để hiển thị nhiều số trang hơn và dấu "..." */}
              {/* Ví dụ: Hiển thị dấu ... nếu còn nhiều trang */}
              {currentPage < totalPages - 1 && totalPages > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {/* Ví dụ: Luôn hiển thị trang cuối nếu không phải trang hiện tại */}
              {currentPage !== totalPages && totalPages > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  // Disable nút Next nếu đang ở trang cuối
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

      <Toaster richColors position="top-right" />
    </div>
  );
};

export default AdminInvoicesManagementPage;
