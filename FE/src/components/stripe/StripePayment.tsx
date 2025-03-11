import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartItemData } from "@/types/dataTypes";
import { useCreateStripePaymentMutation } from "@/services/invoice/createStripePaymentMutation";
import StripeForm from "./StripeForm";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, total } = (location.state || {}) as {
    cartItems: CartItemData[];
    total: number;
  };

  const {
    mutate: createPaymentIntent,
    data: paymentIntent,
    isPending,
    error,
  } = useCreateStripePaymentMutation();

  useEffect(() => {
    if (!cartItems?.length || !total) {
      navigate("/cart", { replace: true });
      return;
    }
    if (total > 0) {
      createPaymentIntent({ variables: { amount: total } });
    }
  }, [total, cartItems, createPaymentIntent, navigate]);

  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (isPending)
    return <div className="text-center p-4">Loading payment...</div>;

  // Log the paymentIntent to debug
  console.log("paymentIntent1:", paymentIntent);

  // Ensure clientSecret is available before rendering Elements
  const clientSecret = paymentIntent?.clientSecret;
  if (!clientSecret) {
    return (
      <div className="text-red-500">Error: clientSecret not available</div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeForm
        clientSecret={clientSecret}
        total={total}
        cartItems={cartItems}
      />
    </Elements>
  );
};

export default StripePayment;
