// src/features/admin/pages/AdminInvoicesManagementPage.tsx

import { useGetAllInvoicesQuery } from "@/services/invoice/getAllInvoicesQuery";
import InvoicesManagementTable from "@/features/admin/components/InvoicesManagementTable";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Corrected import path for Toaster
import { Toaster } from "sonner";

const AdminInvoicesManagementPage = () => {
  const {
    data: invoicesList = [],
    isLoading,
    isError,
    // Removed unused 'error' variable. Add back if you want to display error details.
    // error,
  } = useGetAllInvoicesQuery();

  if (isLoading) {
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
          {/* Example of using the error variable if needed: */}
          {/* <pre className="mt-2 text-xs">{(error as Error)?.message || 'Unknown error'}</pre> */}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Quản lý Hóa đơn</h1>
      <InvoicesManagementTable data={invoicesList} />
      {/* Ensure Toaster is rendered, preferably in a higher-level layout or here */}
      <Toaster richColors position="top-right" />
    </div>
  );
};

export default AdminInvoicesManagementPage;
