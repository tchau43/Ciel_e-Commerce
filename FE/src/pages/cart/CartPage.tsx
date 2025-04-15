// pages/CartPage.tsx (Example structure)

import CartItem from "@/components/cart/CartItem"; // Assuming you have this
import { useGetCartQuery } from "@/services/cart/getCartQuery";
import { getAuthCredentials } from "@/utils/authUtil";
import { useNavigate } from "react-router-dom";
import { CartItemData } from "@/types/dataTypes"; // Import type

const CartPage = () => {
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();
  const userId = userInfo?._id;

  const {
    data: cart,
    isLoading,
    isError,
    error, // Capture error
  } = useGetCartQuery(userId!, {
    // Keep cart enabled only if userId exists
    enabled: !!userId,
    // Optionally add refetch interval or other react-query options
  });

  console.log("-----------------------------------cart", cart);

  // Calculate total price based on selected variants or base price
  const total =
    cart?.items?.reduce((sum, item) => {
      const chosenVariant = item.product?.variants?.find(
        (v) => v._id === item.variant?.toString()
      );
      const pricePerItem = chosenVariant
        ? chosenVariant.price
        : Number(item.product?.base_price); // Add optional chaining for base_price too
      const validPrice = isNaN(pricePerItem) ? 0 : pricePerItem;
      return sum + validPrice * item.quantity;
    }, 0) ?? 0;

  const handleCheckout = () => {
    // Ensure items exist before navigating
    if (!cart?.items || cart.items.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    navigate("/payment", {
      state: {
        // Pass necessary data to payment page
        cartItems: cart.items,
        total: total,
      },
    });
  };

  if (!userId) {
    // Handle case where user is not logged in (optional: redirect or show message)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-700">
          Please log in to view your cart.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
      <p className="text-center text-red-600 py-10">
        Error loading cart. Please try again.
      </p>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;

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
              onClick={() => navigate("/product")} // Navigate to products page
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:gap-8">
            {/* Cart Items Section */}
            <div className="md:w-2/3 space-y-4">
              {cart.items.map((item: CartItemData) => (
                // You need to create/update CartItem component
                // It should receive item data and potentially handlers for quantity change/removal
                <CartItem
                  key={`${item.product._id}-${item.variant || "base"}`} // Create a unique key including variant
                  item={item}
                />
              ))}
            </div>

            {/* Order Summary Section */}
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
                    <span>Calculated at checkout</span> {/* Or Free Shipping */}
                  </div>
                  {/* Add Taxes if applicable */}
                </div>
                <div className="flex justify-between font-semibold text-lg text-gray-800 border-t pt-4">
                  <span>Total</span>
                  <span>{total.toLocaleString("vi-VN")} VND</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isEmpty} // Already checked above, but good practice
                  className="mt-6 w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
