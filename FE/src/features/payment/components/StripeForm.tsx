import { getAuthCredentials } from "@/utils/authUtil";
import { useDeleteAllProductInCartMutation } from "@/services/cart/deleteAllProductInCartMutation";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface StripeFormProps {
  clientSecret: string;
  invoiceId: string;
  total: number;
}

const StripeForm = ({ clientSecret, invoiceId, total }: StripeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();
  const { mutate: deleteCart } = useDeleteAllProductInCartMutation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      setErrorMessage("Payment system not ready.");
      console.error("Stripe.js has not loaded or clientSecret is missing.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setErrorMessage("Card details component not ready.");
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      console.log("Stripe confirmCardPayment result:", {
        error,
        paymentIntent,
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        console.log("Payment Succeeded! PaymentIntent:", paymentIntent);

        if (userInfo?._id) {
          deleteCart(userInfo._id, {
            onSuccess: () => console.log("Cart cleared on payment success."),
            onError: (err) => console.error("Failed to clear cart:", err),
          });
        }

        navigate(`/order-success/${invoiceId}`);
      } else if (paymentIntent) {
        setErrorMessage(
          `Payment status: ${paymentIntent.status}. Please follow any instructions.`
        );
      } else {
        setErrorMessage("Payment processing did not complete.");
      }
    } catch (err) {
      console.error("Error during payment confirmation:", err);
      setErrorMessage("An unexpected error occurred during payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Enter Card Details
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Card Information
          </label>
          <CardElement
            className="border p-3 rounded-lg shadow-sm"
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": { color: "#aab7c4" },
                },
                invalid: { color: "#9e2146" },
              },
            }}
          />
        </div>

        {errorMessage && (
          <div className="text-red-600 mb-4 text-sm p-3 bg-red-100 border border-red-400 rounded">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing || !stripe || !clientSecret}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing
            ? "Processing Payment..."
            : `Pay ${total.toLocaleString("vi-VN")} VND`}
        </button>
      </form>
    </div>
  );
};

export default StripeForm;
