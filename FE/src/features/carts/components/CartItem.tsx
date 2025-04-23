// components/cart/CartItem.tsx
import React, { useEffect, useState, useCallback } from "react";
import { CartItemData } from "@/types/dataTypes";
import { useUpdateCartMutation } from "@/services/cart/updateCartMutation"; // Make sure path is correct
import { getAuthCredentials } from "@/utils/authUtil";
import { useNavigate } from "react-router-dom";
import { TiDeleteOutline } from "react-icons/ti";
import { debounce } from "lodash"; // Using lodash debounce

interface CartItemProps {
  item: CartItemData; // *** RENAMED PROP ***
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  // *** USE RENAMED PROP ***
  const navigate = useNavigate();
  const product = item.product; // Extract product for easier access
  const [quantity, setQuantity] = useState<number>(item.quantity);
  const { mutate: updateCartMutation, isPending: isUpdating } =
    useUpdateCartMutation();

  // --- Find Variant & Calculate Price ---
  const chosenVariant = product?.variants?.find(
    (v) => v._id === item.variant?.toString() // Use item.variant (the stored ID)
  );
  const displayPrice = chosenVariant
    ? chosenVariant.price
    : Number(product?.base_price ?? 0);
  const itemTotal = (isNaN(displayPrice) ? 0 : displayPrice) * quantity;
  // ---

  // Sync local state with prop
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  // --- Debounced Update Logic ---
  const debouncedUpdateCart = useCallback(
    debounce((newQuantity: number) => {
      const { userInfo } = getAuthCredentials();
      const userId = userInfo?._id;
      if (!userId || !product?._id) {
        console.error("User or Product ID missing for cart update.");
        return;
      }

      console.log(
        `Debounced Update: userId=${userId}, productId=${
          product._id
        }, variantId=${item.variant || null}, quantity=${newQuantity}`
      );

      // *** FIX: Send correct field name 'quantity' and include 'variantId' ***
      updateCartMutation({
        variables: {
          userId,
          productId: product._id,
          variantId: item.variant || null,
          quantity: newQuantity, // Correctly sending 'quantity' field name
        },
      });
    }, 500), // 500ms delay
    [updateCartMutation, product?._id, item.variant]
  );

  // Trigger debounced update when local quantity changes
  useEffect(() => {
    if (quantity !== item.quantity && quantity >= 0) {
      debouncedUpdateCart(quantity);
    }
    return () => {
      debouncedUpdateCart.cancel();
    };
  }, [quantity, item.quantity, debouncedUpdateCart]);
  // --- End Debounced Update ---

  const handleIncreaseQuantity = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecreaseQuantity = () => {
    // *** FIX: Allow decreasing to 0 to trigger removal ***
    setQuantity((q) => Math.max(0, q - 1));
  };

  const handleRemoveProduct = () => {
    // Set local quantity to 0, which triggers the debounced update
    // The backend service should handle quantity: 0 as a removal instruction
    setQuantity(0);
  };

  if (!product) {
    return (
      <div className="bg-white p-4 rounded shadow text-red-500">
        Product data unavailable.
      </div>
    );
  }

  // --- Updated Return JSX ---
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Image */}
      <img
        src={product.images?.[0] || "/logo.png"} // *** FIX: Use actual product image ***
        alt={product.name}
        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded flex-shrink-0 border cursor-pointer"
        onClick={() => navigate(`/product/${product._id}`)}
        onError={(e) => {
          e.currentTarget.src = "/logo.png";
        }}
      />

      {/* Details */}
      <div className="flex-grow text-center sm:text-left">
        <h3
          className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.name}
        </h3>
        {/* *** FIX: Display Variant Type *** */}
        {chosenVariant && (
          <p className="text-sm text-gray-500">{chosenVariant.types}</p>
        )}
        {/* Display Price Per Item */}
        <p className="text-sm text-gray-600 mt-1">
          {displayPrice.toLocaleString("vi-VN")} VND
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 flex-shrink-0 my-2 sm:my-0">
        <button
          onClick={handleDecreaseQuantity}
          disabled={isUpdating || quantity === 0} // Also disable if 0
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

      {/* *** FIX: Item Total Price Calculation *** */}
      <div className="w-28 text-center sm:text-right font-medium text-gray-800 flex-shrink-0">
        {itemTotal.toLocaleString("vi-VN")} VND
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemoveProduct}
        disabled={isUpdating}
        className="text-gray-400 hover:text-red-600 ml-2 sm:ml-4 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove item"
        aria-label="Remove item"
      >
        <TiDeleteOutline className="size-6" />
      </button>
    </div>
  );
};

export default CartItem;
