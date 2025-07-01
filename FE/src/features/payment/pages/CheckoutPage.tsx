import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CartItem, Address } from "@/types/dataTypes";
import { getAuthCredentials } from "@/utils/authUtil";
import { Button } from "@/components/ui/button";
import AddressSelect from "../components/AddressSelect";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();

  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: userInfo?.address?.street || "",
    city: userInfo?.address?.city || "",
    state: userInfo?.address?.state || "",
    country: userInfo?.address?.country || "",
    zipCode: userInfo?.address?.zipCode || "",
  });

  const { cartItems, total } = (location.state || {}) as {
    cartItems: CartItem[];
    total: number;
  };

  const handleAddressChange = (address: Address) => {
    setShippingAddress(address);
  };

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
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.country ||
      !shippingAddress.zipCode
    ) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.");
      return;
    }

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
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Thông Tin Giao Hàng
      </h1>
      <div className="bg-white shadow-md rounded-lg px-6 sm:px-8 pt-6 pb-8 mb-4">
        <AddressSelect
          onAddressChange={handleAddressChange}
          defaultAddress={shippingAddress}
        />

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
