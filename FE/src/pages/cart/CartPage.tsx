import CartItemComponent from "@/features/carts/components/CartItem"; // Renamed to avoid conflict with type
import { useGetCartQuery } from "@/services/cart/getCartQuery";
import { getAuthCredentials } from "@/utils/authUtil";
import { useNavigate } from "react-router-dom";
// Import correct types from dataTypes.ts
import { Cart, CartItem, Variant } from "@/types/dataTypes"; // Changed CartItemData to CartItem, added Cart, Variant

const CartPage = () => {
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();
  const userId = userInfo?._id;

  // Add Cart type hint to useGetCartQuery for better type inference
  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useGetCartQuery(userId!, {
    enabled: !!userId,
  });

  // --- Corrected Total Calculation ---
  // Sum the 'subtotal' field directly from each cart item
  const total =
    cart?.items?.reduce((sum: number, item: CartItem) => {
      // Ensure item.subtotal is a valid number, default to 0 if not
      const subtotal = typeof item.subtotal === "number" ? item.subtotal : 0;
      return sum + subtotal;
    }, 0) ?? 0; // Default to 0 if cart or items are null/undefined

  const handleCheckout = () => {
    if (!cart?.items || cart.items.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    // Pass the correctly typed items and calculated total
    navigate("/payment", {
      state: {
        cartItems: cart.items as CartItem[], // Assert type for safety
        total: total,
      },
    });
  };

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-700">
          Please log in to view your cart.
        </p>
        <button
          onClick={() => navigate("/login")}
          // Using theme colors
          className="mt-4 px-6 py-2 bg-ch-blue text-white rounded hover:bg-ch-blue-100 transition duration-200"
        >
          Login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-center text-gray-600 py-10">Loading Cart...</p>;
  }

  if (isError) {
    console.error("Error loading cart:", error);
    return (
      <p className="text-center text-ch-red py-10">
        {" "}
        {/* Use theme color */}
        Error loading cart. Please try again.
      </p>
    );
  }

  // Use the cart directly after checks, default items to empty array if needed
  const cartItems = cart?.items ?? [];
  const isEmpty = cartItems.length === 0;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
          Your Shopping Cart
        </h1>

        {isEmpty ? (
          <div className="text-center bg-white p-10 rounded shadow">
            <p className="text-xl text-gray-600 mb-4">
              Your cart is currently empty.
            </p>
            <button
              onClick={() => navigate("/product")}
              // Using theme colors
              className="px-6 py-2 bg-ch-blue text-white rounded hover:bg-ch-blue-100 transition duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="md:w-2/3 space-y-4">
              {/* Map over cartItems which defaults to [] */}
              {cartItems.map(
                (
                  item: CartItem // Use correct CartItem type
                ) => (
                  <CartItemComponent
                    // Ensure key is unique, using variantId if available
                    key={`${item.productId}-${item.variantId || "no-variant"}`}
                    item={item}
                  />
                )
              )}
            </div>

            <div className="md:w-1/3 mt-8 md:mt-0">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{total.toLocaleString("vi-VN")} VND</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                <div className="flex justify-between font-semibold text-lg text-gray-800 border-t pt-4">
                  <span>Total</span>
                  <span>{total.toLocaleString("vi-VN")} VND</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isEmpty}
                  // Using theme color for checkout button
                  className="mt-6 w-full px-6 py-3 bg-ch-red text-white font-semibold rounded-md hover:bg-ch-red-100 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
