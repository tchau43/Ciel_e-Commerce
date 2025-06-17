// pages/CheckoutPage.tsx
import { useState, ChangeEvent } from "react"; // Import React
import { useLocation, useNavigate } from "react-router-dom";
// SỬA LỖI: Import đúng types từ dataTypes.ts
import { CartItem, Address } from "@/types/dataTypes";
import { getAuthCredentials } from "@/utils/authUtil";
import { Button } from "@/components/ui/button"; // Import Button nếu cần
import { Input } from "@/components/ui/input"; // Import Input nếu cần
import { Label } from "@/components/ui/label"; // Import Label nếu cần

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();

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

  const handleContinue = () => {
    // Validate address fields
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.country ||
      !shippingAddress.zipCode
    ) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.");
      return;
    }

    // Navigate to payment page with all necessary data
    navigate("/payment", {
      state: {
        cartItems,
        total,
        shippingAddress,
      },
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      {" "}
      {/* Tăng max-w */}
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Thông Tin Giao Hàng
      </h1>
      <div className="bg-white shadow-md rounded-lg px-6 sm:px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-2">
            <Label
              htmlFor="street"
              className="text-gray-700 text-sm font-bold mb-2"
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
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label
              htmlFor="city"
              className="text-gray-700 text-sm font-bold mb-2"
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
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label
              htmlFor="state"
              className="text-gray-700 text-sm font-bold mb-2"
            >
              Quận / Huyện
            </Label>
            <Input
              id="state"
              name="state"
              type="text"
              placeholder="Ví dụ: Ba Đình"
              value={shippingAddress.state}
              onChange={handleAddressChange}
              required
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label
              htmlFor="zipCode"
              className="text-gray-700 text-sm font-bold mb-2"
            >
              Mã bưu chính
            </Label>
            <Input
              id="zipCode"
              name="zipCode"
              type="text"
              placeholder="Ví dụ: 100000"
              value={shippingAddress.zipCode}
              onChange={handleAddressChange}
              required
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label
              htmlFor="country"
              className="text-gray-700 text-sm font-bold mb-2"
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
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full md:w-auto px-8"
            onClick={handleContinue}
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
