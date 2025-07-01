import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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

  const productUrl = `/product/${productData._id}`;

  const renderStars = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined) return null;

    return (
      <div className="flex items-center gap-0.5 mt-1">
        {[...Array(5)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`text-lg ${
              i < rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </motion.span>
        ))}
      </div>
    );
  };

  const isReviewed = reviewStatus?.isReviewed || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={`overflow-hidden transition-all duration-300 transform hover:-translate-y-1 ${
          isReviewed
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm hover:shadow-emerald-100"
            : "border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm hover:shadow-lg hover:border-blue-200"
        }`}
      >
        {isReviewed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium py-1.5 px-2 text-center"
          >
            Đã đánh giá ✓
          </motion.div>
        )}

        <Link
          to={productUrl}
          className="block aspect-video relative overflow-hidden group"
        >
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={productData.name}
              className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400">
              No image available
            </div>
          )}
        </Link>

        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div className="h-[3.75rem] flex-grow">
              <h3 className="font-semibold text-lg line-clamp-2 hover:text-blue-600 transition-colors duration-200">
                <Link to={productUrl}>{productData.name}</Link>
              </h3>
            </div>
            <span className="text-sm bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 border border-blue-100">
              {variant.types}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {formatCurrency(priceAtPurchase)}
            </p>
            <p className="text-slate-500 text-sm">Số lượng: {quantity}</p>
          </div>

          <p className="text-slate-500 text-sm border-t border-slate-200 pt-2">
            Đơn hàng #{invoice._id.substring(0, 8)}... • {formattedDate}
          </p>

          {isReviewed ? (
            <div className="space-y-2">
              {renderStars(reviewStatus?.rating)}
              <Button
                variant="outline"
                className="w-full bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 border-emerald-200 hover:border-emerald-300 text-emerald-700 transition-all duration-200"
                onClick={handleViewReview}
              >
                Xem đánh giá của bạn
              </Button>
            </div>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={handleWriteReview}
            >
              Viết đánh giá
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default DeliveredProduct;
