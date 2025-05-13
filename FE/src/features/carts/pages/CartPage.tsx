import CartItemComponent from "@/features/carts/components/CartItem";
import { useGetCartQuery } from "@/services/cart/getCartQuery";
import { getAuthCredentials } from "@/utils/authUtil";
import { useNavigate } from "react-router-dom";
import { Cart, CartItem, Variant } from "@/types/dataTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const CartPage = () => {
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();
  const userId = userInfo?._id;

  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useGetCartQuery(userId!, {
    enabled: !!userId,
  });

  const total =
    cart?.items?.reduce((sum: number, item: CartItem) => {
      const subtotal = typeof item.subtotal === "number" ? item.subtotal : 0;
      return sum + subtotal;
    }, 0) ?? 0;

  const handleCheckout = () => {
    if (!cart?.items || cart.items.length === 0) {
      alert("Giỏ hàng của bạn đang trống.");
      return;
    }
    navigate("/payment", {
      state: {
        cartItems: cart.items as CartItem[],
        total: total,
      },
    });
  };

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-700">
          Vui lòng đăng nhập để xem giỏ hàng.
        </p>
        <Button
          onClick={() => navigate("/login")}
          className="mt-4 px-6 py-2 bg-ch-blue text-white rounded hover:bg-ch-blue-100 transition duration-200"
        >
          Đăng nhập
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
            Giỏ hàng của bạn
          </h1>
          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="md:w-2/3 space-y-4">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
            <div className="md:w-1/3 mt-8 md:mt-0">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-6" />
                <Skeleton className="h-6 w-1/2 mb-6" />
                <Skeleton className="h-12 w-full mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error("Lỗi tải giỏ hàng:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
          Giỏ hàng của bạn
        </h1>
        <p className="text-center text-ch-red py-10">
          Lỗi tải giỏ hàng. Vui lòng thử lại.
        </p>
      </div>
    );
  }

  const cartItems = cart?.items ?? [];
  const isEmpty = cartItems.length === 0;

  return (
    <div className=" min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
          Giỏ hàng của bạn
        </h1>
        {isEmpty ? (
          <div className="text-center bg-white p-10 rounded-lg shadow">
            <p className="text-xl text-gray-600 mb-4">
              Giỏ hàng của bạn hiện đang trống.
            </p>
            <Button
              onClick={() => navigate("/products")}
              className="px-6 py-2 bg-ch-blue text-white rounded hover:bg-ch-blue-dark transition duration-200"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="md:w-2/3 space-y-4">
              {cartItems.map((item: CartItem) => (
                <CartItemComponent
                  key={`${item.productId}-${item.variantId || "no-variant"}`}
                  item={item}
                />
              ))}
            </div>
            <div className="md:w-1/3 mt-8 md:mt-0">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
                  Tóm tắt đơn hàng
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{total.toLocaleString("vi-VN")} VND</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span>Tính khi thanh toán</span>
                  </div>
                </div>
                <div className="flex justify-between font-semibold text-lg text-gray-800 border-t pt-4">
                  <span>Tổng cộng</span>
                  <span>{total.toLocaleString("vi-VN")} VND</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={isEmpty}
                  className="mt-6 w-full px-6 py-3 bg-ch-red text-white font-semibold rounded-md hover:bg-ch-red-dark transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  size="lg"
                >
                  Tiến hành thanh toán
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
