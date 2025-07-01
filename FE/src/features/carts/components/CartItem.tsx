import React, { useEffect, useState, useCallback } from "react";

import { CartItem as CartItemType, CartItemInput } from "@/types/dataTypes";
import { useUpdateCartMutation } from "@/services/cart/updateCartMutation";
import { getAuthCredentials } from "@/utils/authUtil";
import { useNavigate } from "react-router-dom";
import { TiDeleteOutline } from "react-icons/ti";
import { debounce } from "lodash";

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState<number>(item.quantity);
  const { mutate: updateCartMutation, isPending: isUpdating } =
    useUpdateCartMutation();

  const displayPrice = item.pricePerUnit ?? 0;
  const itemTotal = item.subtotal ?? 0;

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const debouncedUpdateCart = useCallback(
    debounce((newQuantity: number) => {
      const { userInfo } = getAuthCredentials();
      const userId = userInfo?._id;

      if (!userId || !item.productId) {
        console.error("User or Product ID missing for cart update.");
        return;
      }

      console.log(
        `Debounced Update: productId=${item.productId}, variantId=${
          item.variantId || null
        }, quantity=${newQuantity}`
      );

      const variables: CartItemInput = {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: newQuantity,
      };

      updateCartMutation({ variables });
    }, 500),
    [updateCartMutation, item.productId, item.variantId]
  );

  useEffect(() => {
    if (quantity !== item.quantity && quantity >= 0) {
      debouncedUpdateCart(quantity);
    }

    return () => {
      debouncedUpdateCart.cancel();
    };
  }, [quantity, item.quantity, debouncedUpdateCart]);

  const handleIncreaseQuantity = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((q) => Math.max(0, q - 1));
  };

  const handleRemoveProduct = () => {
    setQuantity(0);
  };

  const productName = item.name ?? "Product Name Unavailable";
  const productImageUrl = item.imageUrl || "/logo.png";
  const variantInfo = item.variantTypes;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <img
        src={productImageUrl}
        alt={productName}
        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded flex-shrink-0 border cursor-pointer"
        onClick={() => navigate(`/product/${item.productId}`)}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/logo.png";
        }}
      />

      <div className="flex-grow text-center sm:text-left">
        <h3
          className="font-semibold text-gray-800 hover:text-ch-blue cursor-pointer"
          onClick={() => navigate(`/product/${item.productId}`)}
        >
          {productName}
        </h3>
        {variantInfo && <p className="text-sm text-gray-500">{variantInfo}</p>}
        <p className="text-sm text-gray-600 mt-1">
          {displayPrice.toLocaleString("vi-VN")} VND
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 my-2 sm:my-0">
        <button
          onClick={handleDecreaseQuantity}
          disabled={isUpdating || quantity === 0}
          className="border rounded-full w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="w-10 text-center font-medium" aria-live="polite">
          {quantity}
        </span>
        <button
          onClick={handleIncreaseQuantity}
          disabled={isUpdating}
          className="border rounded-full w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="w-28 text-center sm:text-right font-medium text-gray-800 flex-shrink-0">
        {/* Display subtotal directly */}
        {itemTotal.toLocaleString("vi-VN")} VND
      </div>

      <button
        onClick={handleRemoveProduct}
        disabled={isUpdating}
        className="text-gray-400 hover:text-ch-pink ml-2 sm:ml-4 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove item"
        aria-label="Remove item"
      >
        <TiDeleteOutline className="size-6" />
      </button>
    </div>
  );
};

export default CartItem;
