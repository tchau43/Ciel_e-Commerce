import { useDeleteAllProductInCartMutation } from "@/services/cart/deleteAllProductInCartMutation";
import { useCreateInvoiceMutation } from "@/services/invoice/createInvoiceMutation";
import { CartItemData } from "@/types/dataTypes";
import { getAuthCredentials } from "@/utils/authUtil";
import {
  CardElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface StripeFormProps {
  clientSecret: string;
  total: number;
  cartItems: CartItemData[];
}

const StripeForm = ({ clientSecret, total, cartItems }: StripeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { mutate: invoice } = useCreateInvoiceMutation();
  const { userInfo } = getAuthCredentials();
  const navigate = useNavigate();
  const { mutate: deleteProduct } = useDeleteAllProductInCartMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setErrorMessage("Card element not found");
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
      console.log("paymentIntent:", paymentIntent);

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        invoice(
          {
            variables: {
              userId: userInfo._id,
              address: userInfo.address,
              productsList: cartItems.map((c: CartItemData) => ({
                productId: c.product._id,
                quantity: c.quantity,
              })),
              payment: "paid",
            },
          },
          {
            onSuccess: () => {
              deleteProduct(userInfo._id, {
                onSuccess: () => {},
              });
              navigate("/product");
            },
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

export default StripeForm;
