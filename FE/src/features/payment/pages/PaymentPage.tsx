import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDeleteAllProductInCartMutation } from "@/services/cart/deleteAllProductInCartMutation";
import { useCreateInvoiceMutation } from "@/services/invoice/createInvoiceMutation";
import { useValidateCouponQuery } from "@/services/coupon/validateCouponQuery";
import { useGetDeliveryFeeQuery } from "@/services/delivery/getDeliveryFeeQuery";
import {
  CartItem,
  Address,
  PaymentMethod,
  CreateInvoiceInput,
} from "@/types/dataTypes";
import { getAuthCredentials } from "@/utils/authUtil";
import { normalizeLocationName } from "@/utils/helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();
  const userId = userInfo?._id;

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(PaymentMethod.CASH);

  const { cartItems, total, shippingAddress } = (location.state || {}) as {
    cartItems: CartItem[];
    total: number;
    shippingAddress: Address;
  };

  // Chuẩn hóa địa chỉ cho API vận chuyển
  const normalizedAddress: Address = {
    ...shippingAddress,
    city: normalizeLocationName(shippingAddress.city || ""),
    state: normalizeLocationName(shippingAddress.state || ""),
  };

  console.log("Original Address:", shippingAddress);
  console.log("Normalized Address:", normalizedAddress);

  // Gọi API tính phí vận chuyển
  const {
    data: deliveryData,
    isLoading: isCalculatingDeliveryFee,
    error: deliveryError,
  } = useGetDeliveryFeeQuery(normalizedAddress);

  console.log("Delivery Error:", deliveryError);

  const SHIPPING_FEE = deliveryData?.deliveryFee || 30000;

  const {
    mutate: createInvoice,
    isError: isCreateInvoiceError,
    isPending: isCreateInvoicePending,
  } = useCreateInvoiceMutation();
  const { mutate: deleteCart } = useDeleteAllProductInCartMutation();

  // Validate coupon if applied
  const { data: couponData, isLoading: isCouponValidating } =
    useValidateCouponQuery(appliedCoupon, total);

  const discountAmount = couponData?.valid
    ? couponData.coupon.calculatedDiscount
    : 0;

  const finalTotal = total + SHIPPING_FEE - discountAmount;

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value as PaymentMethod);
  };

  const handleApplyCoupon = () => {
    setAppliedCoupon(couponCode);
  };

  const handleCheckout = () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    if (!SHIPPING_FEE || typeof SHIPPING_FEE !== "number" || SHIPPING_FEE < 0) {
      alert("Không thể tính phí vận chuyển. Vui lòng thử lại sau.");
      return;
    }

    if (selectedPaymentMethod === PaymentMethod.CARD) {
      navigate("/payment/stripe", {
        state: {
          cartItems,
          total: finalTotal,
          shippingAddress,
          couponCode: couponData?.valid ? appliedCoupon : null,
          deliveryFee: SHIPPING_FEE,
        },
      });
      return;
    }

    createInvoice(
      {
        variables: {
          userId,
          shippingAddress,
          productsList: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || null,
          })),
          paymentMethod: selectedPaymentMethod,
          couponCode: couponData?.valid ? appliedCoupon : null,
          deliveryFee: SHIPPING_FEE,
        } as CreateInvoiceInput,
      },
      {
        onSuccess: (data) => {
          deleteCart(userId, {
            onSuccess: () => {
              navigate(`/order-success/${data.invoice._id}`);
            },
          });
        },
        onError: (error) => {
          alert(error.message || "Có lỗi xảy ra khi tạo đơn hàng");
        },
      }
    );
  };

  if (!location.state || !cartItems || !shippingAddress) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500 mb-4">
          Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.
        </p>
        <Button onClick={() => navigate("/cart")}>Quay lại giỏ hàng</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Thanh Toán
      </h1>
      <div className="bg-white shadow-md rounded-lg px-6 sm:px-8 pt-6 pb-8 mb-4">
        {/* Order Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b text-gray-700">
            Chi Tiết Đơn Hàng
          </h2>
          <ul className="space-y-3">
            {cartItems.map((item) => (
              <li
                key={`${item.productId}-${item.variantId || "base"}`}
                className="flex justify-between items-center text-gray-700"
              >
                <div>
                  <span className="font-medium">{item.name}</span>
                  {item.variantTypes && (
                    <span className="text-sm text-gray-500">
                      {" "}
                      ({item.variantTypes})
                    </span>
                  )}
                  <span className="text-gray-500"> x {item.quantity}</span>
                </div>
                <span>
                  {(item.pricePerUnit * item.quantity).toLocaleString("vi-VN")}{" "}
                  ₫
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Coupon Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b text-gray-700">
            Mã Giảm Giá
          </h2>
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã giảm giá"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponCode || isCouponValidating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCouponValidating ? "Đang kiểm tra..." : "Áp dụng"}
            </Button>
          </div>
          {isCouponValidating && (
            <p className="text-sm text-gray-500 mt-2">Đang kiểm tra mã...</p>
          )}
          {appliedCoupon && couponData?.valid && (
            <p className="text-sm text-green-600 mt-2">
              Đã áp dụng mã giảm giá: {couponData.coupon.discountValue}%
              <br />
              <span className="text-gray-600">
                {couponData.coupon.description}
              </span>
            </p>
          )}
          {appliedCoupon && !couponData?.valid && (
            <p className="text-sm text-red-600 mt-2">
              Mã giảm giá không hợp lệ hoặc đã hết hạn
            </p>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Tạm tính:</span>
            <span>{total.toLocaleString("vi-VN")} ₫</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Phí vận chuyển:</span>
            {isCalculatingDeliveryFee ? (
              <span className="text-gray-500">Đang tính...</span>
            ) : (
              <span>{SHIPPING_FEE.toLocaleString("vi-VN")} ₫</span>
            )}
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá:</span>
              <span>-{discountAmount.toLocaleString("vi-VN")} ₫</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Tổng cộng:</span>
            {isCalculatingDeliveryFee ? (
              <span className="text-gray-500">Đang tính...</span>
            ) : (
              <span>{finalTotal.toLocaleString("vi-VN")} ₫</span>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b text-gray-700">
            Phương Thức Thanh Toán
          </h2>
          <Select
            value={selectedPaymentMethod}
            onValueChange={handlePaymentMethodChange}
          >
            <SelectTrigger className="w-full">
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

        {/* Checkout Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white font-bold w-full md:w-auto px-8"
            onClick={handleCheckout}
            disabled={isCreateInvoicePending || isCalculatingDeliveryFee}
          >
            {isCreateInvoicePending
              ? "Đang xử lý..."
              : selectedPaymentMethod === PaymentMethod.CARD
              ? "Tiếp tục thanh toán thẻ"
              : "Đặt hàng (COD)"}
          </Button>
        </div>

        {isCreateInvoiceError && (
          <p className="text-red-500 text-sm text-center mt-4">
            Không thể tạo đơn hàng. Vui lòng thử lại.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
