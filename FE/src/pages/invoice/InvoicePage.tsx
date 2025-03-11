import { useCreateInvoiceMutation } from "@/services/invoice/createInvoiceMutation";
import { CartItemData, InvoiceInputData, ProductData } from "@/types/dataTypes";
import { getAuthCredentials } from "@/utils/authUtil";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const InvoicePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();
  const { mutate: invoice, isError, isPending } = useCreateInvoiceMutation();
  const [paymentMethod, setPaymentMethod] = useState("pending");
  const { cartItems, total } = location.state || {
    cartItems: [],
    total: 0,
  };

  // Handle dropdown change
  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPaymentMethod(e.target.value);
  };

  if (!location.state) {
    return (
      <div className="p-4 text-red-500">
        Vui lòng hoàn tất giỏ hàng trước khi thanh toán
      </div>
    );
  }

  // In handleCheckout function of InvoicePage
  const handleCheckout = () => {
    if (paymentMethod === "paid") {
      // Pass cart data to Stripe component
      navigate("/invoice/stripe", {
        state: { cartItems, total },
      });
      return;
    }

    // Existing COD logic
    invoice({
      variables: {
        userId: userInfo._id,
        address: userInfo.address,
        productsList: cartItems.map((c: CartItemData) => ({
          productId: c.product._id,
          quantity: c.quantity,
        })),
        payment: paymentMethod,
      },
    });
  };

  return (
    <div className="flex justify-center">
      <div className="ml-8 flex flex-col space-y-4 w-96">
        <div className="flex items-center space-x-4">
          <label htmlFor="name" className="w-1/3">
            Tên:
          </label>
          <input
            id="name"
            disabled
            placeholder={userInfo.name}
            className="border rounded-md w-2/3"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="total" className="w-1/3">
            Tổng:
          </label>
          <input
            id="total"
            disabled
            value={total} // Use value instead of placeholder
            className="border rounded-md w-2/3"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="address" className="w-1/3">
            Địa chỉ:
          </label>
          <input
            id="address"
            //   placeholder="Địa chỉ"
            value={userInfo.address}
            className="border rounded-md w-2/3"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="payment" className="w-1/3">
            Phương thức thanh toán:
          </label>
          <select
            value={paymentMethod}
            onChange={handlePaymentMethodChange} // Handle the change
            className="border rounded-md px-2 py-1 w-2/3"
          >
            <option key="pending" value="pending">
              Thanh toán khi nhận hàng
            </option>
            <option key="paid" value="paid">
              Thanh toán bằng visa
            </option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            className="border rounded-md px-3 py-1 bg-green-400 hover:bg-green-600"
            onClick={handleCheckout}
          >
            THANH TOÁN
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
