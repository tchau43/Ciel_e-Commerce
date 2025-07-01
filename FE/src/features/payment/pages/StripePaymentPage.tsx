import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartItem, Address } from "@/types/dataTypes";
import StripeForm from "@/features/payment/components/StripeForm";
import { getAuthCredentials } from "@/utils/authUtil";
import { useInitiateStripePaymentMutation } from "@/services/payment/initiateStripePaymentMutation";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();

  const { cartItems, total, shippingAddress, couponCode, deliveryFee } =
    (location.state || {}) as {
      cartItems: CartItem[];
      total: number;
      shippingAddress: Address;
      couponCode: string | null;
      deliveryFee: number;
    };

  const [paymentData, setPaymentData] = useState<{
    clientSecret: string | null;
    invoiceId: string | null;
    backendTotal: number | null;
  }>({
    clientSecret: null,
    invoiceId: null,
    backendTotal: null,
  });

  const {
    mutate: initiatePayment,
    isPending: isInitiating,
    error: initiationError,
  } = useInitiateStripePaymentMutation();

  useEffect(() => {
    if (
      !userInfo?._id ||
      !cartItems?.length ||
      !shippingAddress ||
      !(total > 0) ||
      typeof deliveryFee !== "number"
    ) {
      console.error(
        "StripePaymentPage: Missing required data. Navigating back to cart.",
        { userInfo, cartItems, shippingAddress, total, deliveryFee }
      );
      alert(
        "Could not proceed to payment. Please check your cart and address details."
      );
      navigate("/cart", { replace: true });
      return;
    }

    const variables = {
      userId: userInfo._id,
      productsList: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variantId: item.variantId || null,
      })),
      shippingAddress,
      couponCode: couponCode || null,
      deliveryFee,
    };

    initiatePayment(
      { variables },
      {
        onSuccess: (data) => {
          setPaymentData({
            clientSecret: data.clientSecret,
            invoiceId: data.invoiceId,
            backendTotal: data.totalAmount,
          });
        },
        onError: (error) => {
          console.error(
            "StripePaymentPage: Failed to initiate payment intent:",
            error
          );
        },
      }
    );
  }, []);

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

  const options = {
    clientSecret: paymentData.clientSecret,
  };

  return (
    <Elements
      key={paymentData.clientSecret}
      stripe={stripePromise}
      options={options}
    >
      <StripeForm
        clientSecret={paymentData.clientSecret}
        invoiceId={paymentData.invoiceId}
        total={paymentData.backendTotal ?? total}
      />
    </Elements>
  );
};

export default StripePaymentPage;
