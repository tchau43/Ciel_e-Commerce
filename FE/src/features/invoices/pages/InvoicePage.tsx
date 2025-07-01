import InvoiceItems from "@/features/invoices/components/InvoiceItems";
import { useGetInvoiceQuery } from "@/services/invoice/getInvoiceQuery";
import { getAuthCredentials } from "@/utils/authUtil";
import { Invoice } from "@/types/dataTypes";
import { Skeleton } from "@/components/ui/skeleton";

const InvoicePage = () => {
  const { userInfo } = getAuthCredentials();
  const userId = userInfo?._id;

  const {
    data: invoices = [],
    isError,
    isLoading,
  } = useGetInvoiceQuery(userId!, { enabled: !!userId });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-semibold mb-4">Lịch sử đơn hàng</h1>
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-semibold mb-4">Lịch sử đơn hàng</h1>
        <p className="text-red-600">
          Đã xảy ra lỗi khi tải lịch sử đơn hàng. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Lịch sử đơn hàng</h1>
      {invoices && invoices.length > 0 ? (
        <div className="space-y-6 bg-ch-blue-10/50 backdrop-blur-sm m-4 px-2 pt-2 rounded-lg">
          {invoices.map((invoice: Invoice) => (
            <InvoiceItems key={invoice._id} invoiceItem={invoice} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <p>Bạn chưa có đơn hàng nào.</p>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
