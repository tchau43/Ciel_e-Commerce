// pages/payment/StripePaymentPage.tsx (Corrected)

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartItem, Address } from "@/types/dataTypes"; // Updated imports to match dataTypes.ts
// Import the CORRECT mutation hook
import StripeForm from "@/features/stripe/components/StripeForm"; // Adjust path
import { getAuthCredentials } from "@/utils/authUtil"; // To get userId
import { useInitiateStripePaymentMutation } from "@/services/payment/initiateStripePaymentMutation";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();

  // Destructure ALL data passed from PaymentPage
  const { cartItems, total, shippingAddress, couponCode } = (location.state ||
    {}) as {
    cartItems: CartItem[];
    total: number; // This FE total is mainly for initial display/fallback
    shippingAddress: Address; // Updated type to match dataTypes.ts
    couponCode: string | null; // Add couponCode to the type
  };

  // State to hold data received from the backend initiation endpoint
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string | null;
    invoiceId: string | null;
    backendTotal: number | null;
  }>({
    clientSecret: null,
    invoiceId: null,
    backendTotal: null,
  });

  // Use the CORRECT mutation hook
  const {
    mutate: initiatePayment, // Rename mutate function
    isPending: isInitiating,
    error: initiationError,
  } = useInitiateStripePaymentMutation(); // <-- USE THIS HOOK

  useEffect(() => {
    // Validate necessary data before initiating payment
    // Use optional chaining for userInfo
    if (
      !userInfo?._id ||
      !cartItems?.length ||
      !shippingAddress ||
      !(total > 0)
    ) {
      console.error(
        "StripePaymentPage: Missing required data. Navigating back to cart.",
        { userInfo, cartItems, shippingAddress, total }
      );
      alert(
        "Could not proceed to payment. Please check your cart and address details."
      ); // User feedback
      navigate("/cart", { replace: true });
      return; // Stop execution
    }

    // Prepare variables for the initiation mutation
    const variables = {
      userId: userInfo._id,
      // Map cart items correctly, including variantId
      productsList: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variantId: item.variantId || null,
      })),
      shippingAddress: shippingAddress, // Pass the structured address
      couponCode: couponCode || undefined, // Add couponCode to variables, use undefined if null
    };

    console.log(
      "StripePaymentPage: Calling initiatePayment with variables:",
      variables
    );

    // Call the mutation
    initiatePayment(
      { variables },
      {
        onSuccess: (data) => {
          // Set state with data received from the backend
          console.log(
            "StripePaymentPage: Received data from initiatePayment:",
            data
          );
          setPaymentData({
            clientSecret: data.clientSecret,
            invoiceId: data.invoiceId,
            backendTotal: data.totalAmount, // Store backend calculated total
          });
        },
        onError: (error) => {
          // Handle initiation error more gracefully
          console.error(
            "StripePaymentPage: Failed to initiate payment intent:",
            error
          );
          // Optionally navigate back or show a persistent error message
          // setErrorState(error.message || "Failed to initialize payment.");
        },
      }
    );

    // Run this effect only once when the component mounts or essential data changes
    // Be careful with dependencies if cartItems/total/address can change while on this page
  }, []); // Empty dependency array means it runs once on mount

  // --- Render loading/error states based on the INITIATION mutation ---

  if (initiationError) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded">
        Error initiating payment: {initiationError.message}
        <button
          onClick={() => navigate("/cart")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  if (isInitiating || (!paymentData.clientSecret && !initiationError)) {
    return (
      <div className="text-center p-10">
        Initiating secure payment session...
      </div>
    );
  }

  // If initiation finished without error but data is missing
  if (!paymentData.clientSecret || !paymentData.invoiceId) {
    console.error(
      "StripePaymentPage: clientSecret or invoiceId missing after initiation attempt.",
      paymentData
    );
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded">
        Could not initialize payment session. Data missing from server response.
        Please try again later.
        <button
          onClick={() => navigate("/cart")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  // --- Render Stripe Elements once clientSecret and invoiceId are available ---
  const options = {
    clientSecret: paymentData.clientSecret,
  };

  return (
    // Key added to Elements to force re-mount if clientSecret changes, per Stripe docs recommendation
    <Elements
      key={paymentData.clientSecret}
      stripe={stripePromise}
      options={options}
    >
      <StripeForm
        clientSecret={paymentData.clientSecret}
        invoiceId={paymentData.invoiceId} // <-- Pass invoiceId
        total={paymentData.backendTotal ?? total} // Prefer backend total
      />
    </Elements>
  );
};

export default StripePaymentPage;
