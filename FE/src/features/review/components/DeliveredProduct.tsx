import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { FC } from "react";
import { Link } from "react-router-dom";

interface DeliveredProductProps {
  product: {
    invoice: {
      _id: string;
      createdAt: string;
      orderStatus: string;
    };
    product: {
      _id: string;
      name: string;
      description?: string;
      images?: string[];
    };
    variant: {
      _id: string;
      types: string;
      price: number;
    };
    quantity: number;
    priceAtPurchase: number;
    reviewStatus?: {
      isReviewed: boolean;
      reviewId: string | null;
      rating: number | null;
    };
  };
  onWriteReview: (
    productId: string,
    variantId: string,
    invoiceId: string
  ) => void;
  onViewReview?: (reviewId: string) => void;
}

const DeliveredProduct: FC<DeliveredProductProps> = ({
  product,
  onWriteReview,
  onViewReview,
}) => {
  const {
    invoice,
    product: productData,
    variant,
    quantity,
    priceAtPurchase,
    reviewStatus,
  } = product;
  const imageUrl =
    productData.images && productData.images.length > 0
      ? productData.images[0]
      : undefined;
  const formattedDate = new Date(invoice.createdAt).toLocaleDateString(
    "vi-VN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const handleWriteReview = () => {
    onWriteReview(productData._id, variant._id, invoice._id);
  };

  const handleViewReview = () => {
    if (reviewStatus?.isReviewed && reviewStatus?.reviewId && onViewReview) {
      onViewReview(reviewStatus.reviewId);
    }
  };

  // Product detail URL
  const productUrl = `/product/${productData._id}`;

  // Render stars based on rating
  const renderStars = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined) return null;

    return (
      <div className="flex items-center gap-0.5 mt-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Default review status if not provided
  const isReviewed = reviewStatus?.isReviewed || false;

  return (
    <Card
      className={`overflow-hidden hover:shadow-md transition-shadow duration-300 ${
        isReviewed ? "border-green-200" : ""
      }`}
    >
      {isReviewed && (
        <div className="bg-green-100 text-green-800 text-xs font-medium py-1 px-2 text-center">
          Đã đánh giá
        </div>
      )}
      <Link
        to={productUrl}
        className="block aspect-video relative bg-gray-100 hover:opacity-90 transition-opacity"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productData.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
            No image available
          </div>
        )}
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">
            <Link
              to={productUrl}
              className="hover:text-blue-600 transition-colors"
            >
              {productData.name}
            </Link>
          </h3>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {variant.types}
          </span>
        </div>

        <div className="flex justify-between items-center mb-3">
          <p className="text-gray-700 font-medium">
            {formatCurrency(priceAtPurchase)}
          </p>
          <p className="text-gray-500 text-sm">Số lượng: {quantity}</p>
        </div>

        <p className="text-gray-500 mb-3 text-sm">
          Đơn hàng #{invoice._id.substring(0, 8)}... • {formattedDate}
        </p>

        {isReviewed ? (
          <div className="space-y-2">
            {renderStars(reviewStatus?.rating)}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleViewReview}
            >
              Xem đánh giá
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleWriteReview}>
            Viết đánh giá
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveredProduct;
