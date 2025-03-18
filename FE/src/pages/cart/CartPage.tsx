import CartItem from "@/components/cart/CartItem";
import { useGetCartQuery } from "@/services/cart/getCartQuery";
import { getAuthCredentials } from "@/utils/authUtil";
import { useNavigate, useParams } from "react-router-dom";

const CartPage = () => {
  const navigate = useNavigate();

  // const [total, setTotal] = useState<number>(0);
  // const { userId } = useParams(); // Get user ID from URL
  const { userInfo } = getAuthCredentials();
  const userId = userInfo._id;
  console.log("userId", userId);
  const {
    data: cart,
    isLoading,
    isError,
  } = useGetCartQuery(userId!, {
    enabled: true,
  });

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading product data...</p>;
  }

  const total =
    cart?.items?.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    ) || 0;

  const handleCheckout = () => {
    navigate("/payment", {
      state: {
        cartItems: cart?.items || [],
        total: total,
      },
    });
  };

  console.log("cart", cart);
  const itemList = cart?.items;
  console.log("itemList", itemList);

  return (
    <div>
      {cart?.items?.map((i) => {
        return <CartItem key={i._id} product={i} />;
      })}
      <div className="">
        <div className="flex flex-col items-end mr-12">
          {/* <div className="flex justify-end mr-12"> */}
          <p>TOTAL: {total}</p>
          <button
            onClick={handleCheckout}
            disabled={total === 0}
            className="border rounded-md px-6 py-2 text-[16px] disabled:bg-gray-400 font-semibold bg-green-400 hover:bg-green-500 transition ease-in-out duration-200"
          >
            THANH TOÁN
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
