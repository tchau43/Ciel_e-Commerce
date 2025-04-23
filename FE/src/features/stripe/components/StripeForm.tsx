// components/payment/StripeForm.tsx (Example path)
import { getAuthCredentials } from "@/utils/authUtil"; // Might not need userInfo here anymore
import { useDeleteAllProductInCartMutation } from "@/services/cart/deleteAllProductInCartMutation"; // For clearing cart
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Props might change depending on what you pass from the backend initiator endpoint
interface StripeFormProps {
  clientSecret: string;
  invoiceId: string; // Pass the ID of the invoice created *before* payment
  total: number; // Still useful for display
  // You likely don't need cartItems or full shippingAddress here anymore
}

const StripeForm = ({ clientSecret, invoiceId, total }: StripeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials(); // Needed for clearing cart by userId
  const { mutate: deleteCart } = useDeleteAllProductInCartMutation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- REMOVED useCreateInvoiceMutation ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      setErrorMessage("Payment system not ready.");
      console.error("Stripe.js has not loaded or clientSecret is missing.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null); // Clear previous errors

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setErrorMessage("Card details component not ready.");
        setIsProcessing(false);
        return;
      }

      // Confirm the payment with Stripe using the clientSecret
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            // Optionally add billing details if needed/collected
            // billing_details: {
            //   name: userInfo?.name || 'Customer',
            //   email: userInfo?.email,
            // },
          },
          // We assume return_url is handled elsewhere or not needed for this specific confirmation type
        }
      );

      console.log("Stripe confirmCardPayment result:", {
        error,
        paymentIntent,
      });

      if (error) {
        // Show error message to your customer (e.g., insufficient funds, card declined)
        setErrorMessage(error.message || "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      // --- Payment Succeeded ---
      if (paymentIntent?.status === "succeeded") {
        console.log("Payment Succeeded! PaymentIntent:", paymentIntent);

        // --- REMOVE INVOICE CREATION CALL ---
        // The invoice should already exist in a 'pending' state.
        // The backend webhook will update it to 'paid' and send the email.

        // 1. Clear the user's cart (optional - do this only if desired immediately)
        if (userInfo?._id) {
          deleteCart(userInfo._id, {
            onSuccess: () => console.log("Cart cleared on payment success."),
            onError: (err) => console.error("Failed to clear cart:", err),
          });
        }

        // 2. Navigate to a success page, passing the invoice ID
        // This page can show "Order processing" until the webhook confirms fully.
        navigate(`/order-success/${invoiceId}`); // Use the invoiceId received in props
      } else if (paymentIntent) {
        // Handle other statuses if needed (e.g., requires_action)
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
            className="border p-3 rounded-lg shadow-sm" // Added shadow-sm
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
          disabled={isProcessing || !stripe || !clientSecret} // Also disable if clientSecret is missing
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
