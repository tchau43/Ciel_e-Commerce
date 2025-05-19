// pages/PaymentPage.tsx
import { useState, ChangeEvent } from "react"; // Import React
import { useLocation, useNavigate } from "react-router-dom";
import { useDeleteAllProductInCartMutation } from "@/services/cart/deleteAllProductInCartMutation";
import { useCreateInvoiceMutation } from "@/services/invoice/createInvoiceMutation";
// SỬA LỖI: Import đúng types từ dataTypes.ts
import { CartItem, Address, PaymentMethod } from "@/types/dataTypes";
import { getAuthCredentials } from "@/utils/authUtil";
import { Button } from "@/components/ui/button"; // Import Button nếu cần
import { Input } from "@/components/ui/input"; // Import Input nếu cần
import { Label } from "@/components/ui/label"; // Import Label nếu cần
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select nếu cần

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();
  const userId = userInfo?._id; // Lấy userId an toàn

  const {
    mutate: createInvoice,
    isError: isCreateInvoiceError, // Đổi tên để rõ ràng hơn
    isPending: isCreateInvoicePending, // Đổi tên để rõ ràng hơn
  } = useCreateInvoiceMutation();
  const { mutate: deleteCart } = useDeleteAllProductInCartMutation();

  // Sử dụng đúng PaymentMethod từ enum
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(PaymentMethod.CASH);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    // Sử dụng type Address
    street: userInfo?.address?.street || "", // Lấy thông tin chi tiết hơn nếu có
    city: userInfo?.address?.city || "",
    state: userInfo?.address?.state || "",
    country: userInfo?.address?.country || "",
    zipCode: userInfo?.address?.zipCode || "",
  });

  // Giả định state truyền từ CartPage chứa cartItems và total
  const { cartItems, total } = (location.state || {}) as {
    cartItems: CartItem[]; // Sử dụng type CartItem
    total: number;
  };

  const handlePaymentMethodChange = (value: string) => {
    // Handler cho Shadcn Select
    setSelectedPaymentMethod(value as PaymentMethod);
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // SỬA LỖI: Thêm kiểu Address cho prev
    setShippingAddress((prev: Address) => ({ ...prev, [name]: value }));
  };

  // Kiểm tra dữ liệu đầu vào trước khi render
  if (!location.state || !cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500 mb-4">
          Không tìm thấy sản phẩm để thanh toán hoặc dữ liệu không hợp lệ.
        </p>
        <Button onClick={() => navigate("/cart")}>Quay lại giỏ hàng</Button>
      </div>
    );
  }

  const handleCheckout = () => {
    // SỬA LỖI: Kiểm tra userId trước khi thực hiện
    if (!userId) {
      alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    // Kiểm tra địa chỉ giao hàng
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.country ||
      !shippingAddress.zipCode
      // Có thể thêm kiểm tra state nếu cần
    ) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.");
      return;
    }

    // Xử lý thanh toán Stripe (nếu chọn)
    if (selectedPaymentMethod === PaymentMethod.CARD) {
      navigate("/payment/stripe", {
        state: { cartItems, total, shippingAddress }, // Truyền cả địa chỉ
      });
      return;
    }

    // Xử lý thanh toán CASH/COD
    createInvoice(
      {
        variables: {
          shippingAddress: shippingAddress,
          // SỬA LỖI: Map dữ liệu từ CartItem sang InvoiceItemInput
          productsList: cartItems.map((item: CartItem) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || null, // Lấy variantId trực tiếp
          })),
          paymentMethod: selectedPaymentMethod, // Sử dụng enum PaymentMethod đã chọn
        },
      },
      {
        onSuccess: (data) => {
          console.log("Hóa đơn đã tạo (COD):", data);
          // Xóa giỏ hàng sau khi tạo hóa đơn thành công
          deleteCart(userId, {
            // Đảm bảo userId đã được kiểm tra
            onSuccess: () => {
              console.log("Đã xóa giỏ hàng.");
              // Chuyển hướng đến trang thành công với ID hóa đơn
              navigate(`/order-success/${data.invoice._id}`);
            },
            onError: (cartError) => {
              console.error("Lỗi xóa giỏ hàng:", cartError);
              // Vẫn chuyển hướng nhưng có thể kèm thông báo lỗi?
              navigate(`/order-success/${data.invoice._id}`);
            },
          });
        },
        onError: (error) => {
          console.error("Lỗi tạo hóa đơn:", error);
          alert(`Lỗi tạo hóa đơn: ${error.message || "Lỗi không xác định"}`);
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      {" "}
      {/* Tăng max-w */}
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Thanh Toán
      </h1>
      <div className="bg-white shadow-md rounded-lg px-6 sm:px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4 border-b pb-3 text-gray-700">
          Địa Chỉ Giao Hàng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label
              htmlFor="street"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Địa chỉ
            </Label>
            <Input
              id="street"
              name="street"
              type="text"
              placeholder="Ví dụ: Số 10, ngõ 5..."
              value={shippingAddress.street}
              onChange={handleAddressChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label
              htmlFor="city"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Thành phố / Tỉnh
            </Label>
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="Ví dụ: Hà Nội"
              value={shippingAddress.city}
              onChange={handleAddressChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Thêm input cho state/district nếu cần */}
          {/* <div>
            <Label htmlFor="state" className="block text-gray-700 text-sm font-bold mb-2">Quận / Huyện</Label>
            <Input id="state" name="state" type="text" placeholder="Ví dụ: Ba Đình" value={shippingAddress.state} onChange={handleAddressChange} className="..."/>
          </div> */}
          <div>
            <Label
              htmlFor="zipCode"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Mã bưu chính (Zip Code)
            </Label>
            <Input
              id="zipCode"
              name="zipCode"
              type="text"
              placeholder="Ví dụ: 100000"
              value={shippingAddress.zipCode}
              onChange={handleAddressChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label
              htmlFor="country"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Quốc gia
            </Label>
            <Input
              id="country"
              name="country"
              type="text"
              placeholder="Ví dụ: Việt Nam"
              value={shippingAddress.country}
              onChange={handleAddressChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4 border-b pb-3 pt-4 text-gray-700">
          Tóm Tắt Đơn Hàng & Thanh Toán
        </h2>
        <div className="mb-4">
          <p className="font-semibold text-gray-700 mb-2">Sản phẩm:</p>
          <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
            {/* SỬA LỖI: Hiển thị thông tin từ CartItem */}
            {cartItems.map((item) => (
              <li key={`${item.productId}-${item.variantId || "base"}`}>
                {item.name} {/* Hiển thị tên sản phẩm từ CartItem */}
                {item.variantTypes ? ` (${item.variantTypes})` : ""}{" "}
                {/* Hiển thị loại biến thể nếu có */} x {item.quantity}
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4 flex justify-between font-medium text-gray-800">
          <span>Tổng cộng:</span>
          <span>{total?.toLocaleString("vi-VN")} VND</span>
        </div>
        <div className="mb-6">
          <Label
            htmlFor="payment"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Phương thức thanh toán:
          </Label>
          <Select
            value={selectedPaymentMethod}
            onValueChange={handlePaymentMethodChange}
          >
            <SelectTrigger className="w-full shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Chọn phương thức thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PaymentMethod.CASH}>
                Thanh toán khi nhận hàng (COD)
              </SelectItem>
              <SelectItem value={PaymentMethod.CARD}>
                Thanh toán bằng thẻ (Stripe)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center">
          <Button
            size="lg" // Tăng kích thước nút
            className="bg-green-600 hover:bg-green-700 text-white font-bold w-full md:w-auto disabled:opacity-50"
            onClick={handleCheckout}
            disabled={isCreateInvoicePending}
          >
            {isCreateInvoicePending
              ? "Đang xử lý..."
              : selectedPaymentMethod === PaymentMethod.CARD
              ? "Tiếp tục thanh toán thẻ"
              : "Đặt hàng (COD)"}
          </Button>
        </div>
        {isCreateInvoiceError && (
          <p className="text-red-500 text-xs italic mt-4 text-center">
            Không thể tạo đơn hàng. Vui lòng thử lại.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
