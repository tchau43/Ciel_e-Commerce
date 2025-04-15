// pages/PaymentPage.tsx
import { useDeleteAllProductInCartMutation } from "@/services/cart/deleteAllProductInCartMutation";
import { useCreateInvoiceMutation } from "@/services/invoice/createInvoiceMutation";
import { CartItemData, ShippingAddress } from "@/types/dataTypes"; // Import ShippingAddress
import { getAuthCredentials } from "@/utils/authUtil";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();
  const {
    mutate: createInvoice,
    isError,
    isPending,
  } = useCreateInvoiceMutation(); // Renamed for clarity
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD"); // e.g., "COD" or "Stripe"

  // --- State for Shipping Address ---
  // Initialize with user's default address or empty strings
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: userInfo?.address || "", // Use default street if available
    city: "", // Add fields for city, state, etc.
    state: "",
    country: "",
    zipCode: "",
  });
  // ---

  const { cartItems, total } = (location.state || {}) as {
    cartItems: CartItemData[];
    total: number;
  };
  const { mutate: deleteCart } = useDeleteAllProductInCartMutation(); // Renamed for clarity

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPaymentMethod(e.target.value);
  };

  // --- Handler for address input changes ---
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };
  // ---

  if (!location.state || !cartItems || cartItems.length === 0) {
    // Added checks
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">
          No items found for payment or invalid state.
        </p>
        <button
          onClick={() => navigate("/cart")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  const handleCheckout = () => {
    // Basic address validation (improve as needed)
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.country ||
      !shippingAddress.zipCode
    ) {
      alert("Please fill in all required shipping address fields.");
      return;
    }

    if (selectedPaymentMethod === "Stripe") {
      // Use a clear identifier like "Stripe"
      // Pass necessary data including the *intended* structured address
      navigate("/payment/stripe", {
        state: { cartItems, total, shippingAddress }, // Pass address too
      });
      return;
    }

    // --- Logic for COD or other non-redirect methods ---
    createInvoice(
      {
        variables: {
          // This is the object sent as the request body
          userId: userInfo._id,
          shippingAddress: shippingAddress, // The state object
          productsList: cartItems.map((c: CartItemData) => ({
            // Array from cart
            productId: c.product._id,
            quantity: c.quantity,
            variantId: c.variant || null,
          })),
          paymentMethod: selectedPaymentMethod, // "COD"
        },
      },
      {
        onSuccess: (data) => {
          // Access the created invoice data
          console.log("Invoice created (COD):", data);
          // Clear cart after successful invoice creation
          deleteCart(userInfo._id, {
            onSuccess: () => {
              console.log("Cart cleared.");
              // Navigate to an order confirmation/success page, passing invoice ID
              navigate(`/order-success/${data.invoice._id}`); // Example route
            },
            onError: (cartError) => {
              console.error("Failed to clear cart:", cartError);
              // Still navigate, but maybe show a message?
              navigate(`/order-success/${data.invoice._id}`);
            },
          });
        },
        onError: (error) => {
          console.error("Invoice creation failed:", error);
          alert(
            `Failed to create invoice: ${error.message || "Unknown error"}`
          );
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6 text-center">Checkout</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {/* Shipping Address Form */}
        <h2 className="text-xl mb-4 border-b pb-2">Shipping Address</h2>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="street"
          >
            Street Address
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="street"
            name="street"
            type="text"
            placeholder="123 Main St"
            value={shippingAddress.street}
            onChange={handleAddressChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="city"
          >
            City
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="city"
            name="city"
            type="text"
            placeholder="Hanoi"
            value={shippingAddress.city}
            onChange={handleAddressChange}
            required
          />
        </div>
        {/* Add similar inputs for state, country, zipCode using handleAddressChange */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="zipCode"
          >
            Zip Code
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="zipCode"
            name="zipCode"
            type="text"
            placeholder="100000"
            value={shippingAddress.zipCode}
            onChange={handleAddressChange}
            required
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="country"
          >
            Country
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="country"
            name="country"
            type="text"
            placeholder="Vietnam"
            value={shippingAddress.country}
            onChange={handleAddressChange}
            required
          />
        </div>

        {/* Order Summary & Payment Method */}
        <h2 className="text-xl mb-4 border-b pb-2 pt-4">
          Order Summary & Payment
        </h2>
        <div className="mb-4">
          <p>
            <strong>Items:</strong>
          </p>
          <ul className="list-disc ml-5 text-sm">
            {cartItems.map((item) => (
              <li key={`${item.product._id}-${item.variant || "base"}`}>
                {item.product.name}{" "}
                {item.variant
                  ? `(${
                      item.product.variants.find((v) => v._id === item.variant)
                        ?.types || "Variant"
                    })`
                  : ""}{" "}
                x {item.quantity}
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4 flex justify-between">
          <span className="font-bold">Total:</span>
          <span>{total?.toLocaleString("vi-VN")} VND</span>
        </div>
        <div className="mb-6">
          <label
            htmlFor="payment"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Payment Method:
          </label>
          <select
            id="payment"
            value={selectedPaymentMethod}
            onChange={handlePaymentMethodChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="COD">Cash on Delivery</option>
            <option value="Stripe">Pay with Card (Stripe)</option>
          </select>
        </div>

        {/* Checkout Button */}
        <div className="flex items-center justify-between">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
            onClick={handleCheckout}
            disabled={isPending} // Disable while mutation is in progress
          >
            {isPending
              ? "Processing..."
              : selectedPaymentMethod === "Stripe"
              ? "Proceed to Card Payment"
              : "Place Order (COD)"}
          </button>
        </div>
        {isError && (
          <p className="text-red-500 text-xs italic mt-4">
            Failed to create invoice. Please try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
