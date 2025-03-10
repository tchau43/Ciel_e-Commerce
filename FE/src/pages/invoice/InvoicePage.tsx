import { InvoiceInputData } from "@/types/dataTypes";
import { getAuthCredentials } from "@/utils/authUtil";
import { useLocation } from "react-router-dom";

const InvoicePage = () => {
  const location = useLocation();
  const { userInfo } = getAuthCredentials();

  const { cartItems, total } = location.state || {
    cartItems: [],
    total: 0,
  };

  if (!location.state) {
    return (
      <div className="p-4 text-red-500">
        Vui lòng hoàn tất giỏ hàng trước khi thanh toán
      </div>
    );
  }

  return (
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
        <select className="border rounded-md px-2 py-1 w-2/3">
          <option key="pending" value="pending">
            Thanh toán khi nhận hàng
          </option>
          <option key="paid" value="paid">
            Thanh toán bằng visa
          </option>
        </select>
      </div>
    </div>
  );
};

export default InvoicePage;
