import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetInvoiceQuery } from "@/services/invoice/getInvoiceQuery";
import { getAuthCredentials } from "@/utils/authUtil";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Invoice } from "@/types/dataTypes";
import { CheckCircle2, ShoppingBag, ArrowLeft, Package } from "lucide-react";

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = getAuthCredentials();
  const [latestInvoice, setLatestInvoice] = useState<Invoice | null>(null);

  // Get invoices for the current user
  const { data: invoices, isLoading } = useGetInvoiceQuery(userInfo?._id || "");

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      // Get the most recent invoice
      const sortedInvoices = [...invoices].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLatestInvoice(sortedInvoices[0]);
    }
  }, [invoices]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!latestInvoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No order found</h2>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Your order has been confirmed and will be shipped soon.
          </p>
        </div>

        {/* Order Summary Card */}
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Order Summary
              </h2>
              <span className="text-sm text-gray-500">
                Order #{latestInvoice._id.substring(0, 8)}
              </span>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {latestInvoice.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">
                        {item.product.name}
                      </h3>
                      {item.variant && (
                        <p className="text-sm text-gray-500">
                          Variant: {item.variant.types}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {formatCurrency(item.priceAtPurchase * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(latestInvoice.subtotal || 0)}</span>
              </div>
              {(latestInvoice.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>
                    -{formatCurrency(latestInvoice.discountAmount || 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span>{formatCurrency(latestInvoice.deliveryFee || 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-800 pt-4 border-t">
                <span>Total</span>
                <span>{formatCurrency(latestInvoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Shipping Information */}
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                Shipping Details
              </h2>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>{latestInvoice.shippingAddress.street}</p>
              <p>
                {latestInvoice.shippingAddress.city},{" "}
                {latestInvoice.shippingAddress.state}
              </p>
              <p>
                {latestInvoice.shippingAddress.country},{" "}
                {latestInvoice.shippingAddress.zipCode}
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Button>
          <Button
            onClick={() => navigate("/invoice")}
            className="flex items-center space-x-2"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>View Orders</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
