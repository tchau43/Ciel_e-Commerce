import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCreateInvoiceMutation } from "@/services/invoice/createInvoiceMutation";
import { CartItemData } from "@/types/dataTypes";
import { getAuthCredentials } from "@/utils/authUtil";
import { useCreateStripePaymentMutation } from "@/services/invoice/createStripePaymentMutation";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripeForm = ({
  clientSecret,
  total,
  cartItems,
}: {
  clientSecret: string;
  total: number;
  cartItems: CartItemData[];
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { mutate: createInvoice } = useCreateInvoiceMutation();
  const { userInfo } = getAuthCredentials();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        createInvoice(
          {
            variables: {
              userId: userInfo._id,
              address: userInfo.address,
              productsList: cartItems,
              payment: "paid",
            },
          },
          {
            onSuccess: () => navigate("/order-success"),
          }
        );
      }
    } catch (error) {
      setErrorMessage("Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Stripe Payment</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <CardElement
            className="border p-3 rounded-lg"
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>

        {errorMessage && (
          <div className="text-red-500 mb-4">{errorMessage}</div>
        )}

        <button
          type="submit"
          disabled={isProcessing || !stripe}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {isProcessing ? "Processing..." : `Pay ${total.toLocaleString()}₫`}
        </button>
      </form>
    </div>
  );
};

const StripePaymentForm = () => {
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
  console.log("paymentIntent:", paymentIntent);

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

export default StripePaymentForm;
