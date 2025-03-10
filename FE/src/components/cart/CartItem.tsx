import { useUpdateCartMutation } from "@/services/cart/updateCartMutation";
import { getAuthCredentials } from "@/utils/authUtil";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TiDeleteOutline } from "react-icons/ti";
import { CartItemData, ProductData } from "@/types/dataTypes";

interface CartItemProps {
  product: CartItemData;
}

const CartItem = ({ product }: CartItemProps) => {
  console.log("product", product);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState<number>(product.quantity);
  const { mutate: updateCart, isPending } = useUpdateCartMutation();

  useEffect(() => {
    setQuantity(product.quantity);
  }, [product.quantity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleChangeCart();
    }, 300);
    return () => clearTimeout(timer);
  }, [quantity]);

  const handleIncreaseQuantity = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((q) => {
      const temp = q - 1;
      return temp >= 1 ? temp : q;
    });
  };

  const handleRemoveProduct = () => {
    setQuantity((q) => 0);
  };

  const handleChangeCart = () => {
    const { userInfo } = getAuthCredentials(); // retrieve user id from auth state
    console.log("userInfo", userInfo);
    const userId = userInfo._id;
    if (!userId) {
      // If the user is not logged in, you might redirect them or show a message
      navigate("/login");
      return;
    }

    updateCart({
      variables: {
        userId,
        productId: product.product._id,
        changeQuantity: quantity,
      },
    });
  };
  return (
    <div className="px-4 w-full max-w-7xl border rounded-xl h-30 flex items-center mb-4">
      <div className="w-36">
        <img
          className="size-24 object-cover"
          src="https://placehold.co/300x400"
        ></img>
      </div>
      <div className="flex-1">{product.product.name}</div>
      <div className="w-48">{Number(product.product.price) * quantity}</div>
      <div className="flex gap-x-1 w-36 justify-center">
        <button
          className="border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
          onClick={handleDecreaseQuantity}
          disabled={isPending}
        >
          -
        </button>
        <input
          disabled={true}
          value={quantity}
          className="border border-gray-300 text-center w-12"
        ></input>
        <button
          className="border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
          onClick={handleIncreaseQuantity}
          disabled={isPending}
        >
          +
        </button>
      </div>
      <div className="w-20 flex justify-center">
        <TiDeleteOutline className="size-8" onClick={handleRemoveProduct} />
      </div>
    </div>
  );
};

export default CartItem;
