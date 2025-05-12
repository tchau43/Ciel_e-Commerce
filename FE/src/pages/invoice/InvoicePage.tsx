import React from "react"; // Import React
import InvoiceItems from "@/features/invoices/components/InvoiceItems"; // Đảm bảo đường dẫn đúng
import { useGetInvoiceQuery } from "@/services/invoice/getInvoiceQuery";
import { getAuthCredentials } from "@/utils/authUtil";
import { Invoice } from "@/types/dataTypes"; // Import kiểu Invoice nếu InvoiceItems cần
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton cho loading

const InvoicePage = () => {
  const { userInfo } = getAuthCredentials();
  // Lấy userId một cách an toàn
  const userId = userInfo?._id;

  const {
    data: invoices = [], // Dữ liệu trả về, mặc định là mảng rỗng
    isError, // Trạng thái lỗi
    isLoading, // Trạng thái đang tải
    // Sử dụng option 'enabled' để chỉ chạy query khi có userId
  } = useGetInvoiceQuery(userId!, { enabled: !!userId }); // Thêm dấu ! để báo TS rằng userId chắc chắn có nếu enabled=true

  // 1. Xử lý trạng thái Loading
  if (isLoading) {
    // Hiển thị skeleton hoặc spinner khi đang tải
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-semibold mb-4">Lịch sử đơn hàng</h1>
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    );
  }

  // 2. Xử lý trạng thái Error
  if (isError) {
    // Hiển thị thông báo lỗi
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-semibold mb-4">Lịch sử đơn hàng</h1>
        <p className="text-red-600">
          Đã xảy ra lỗi khi tải lịch sử đơn hàng. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  // 3. Hiển thị danh sách hóa đơn khi có dữ liệu
  return (
    <div className="p-4">
      {" "}
      {/* Thêm div bao ngoài với padding */}
      <h1 className="text-2xl font-semibold mb-6">Lịch sử đơn hàng</h1>
      {invoices && invoices.length > 0 ? (
        // Có hóa đơn -> map và hiển thị
        <div className="space-y-6 bg-ch-blue-10/50 backdrop-blur-sm m-4 px-2 pt-2 rounded-lg">
          {/* Thêm khoảng cách giữa các hóa đơn */}
          {invoices.map((invoice: Invoice) => (
            // Đảm bảo InvoiceItems nhận đúng prop và có key
            <InvoiceItems key={invoice._id} invoiceItem={invoice} />
          ))}
        </div>
      ) : (
        // Không có hóa đơn -> hiển thị thông báo
        <div className="text-center text-gray-500 mt-10">
          <p>Bạn chưa có đơn hàng nào.</p>
          {/* Có thể thêm nút để quay lại trang sản phẩm */}
          {/* <Button asChild className="mt-4">
            <Link to="/products">Tiếp tục mua sắm</Link>
          </Button> */}
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
