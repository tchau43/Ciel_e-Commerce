import { useGetProductReviewsQuery } from "@/services/review/getProductReviewsQuery";
import { Star } from "lucide-react";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useGetProductReviewsQuery(productId);

  if (isLoading)
    return (
      <div className="py-8 text-center text-gray-500">Đang tải đánh giá...</div>
    );
  if (isError)
    return (
      <div className="py-8 text-center text-red-500">
        Không thể tải đánh giá.
      </div>
    );

  if (!reviews.length) {
    return (
      <div className="py-8 text-center text-gray-400 italic">
        Chưa có đánh giá nào cho sản phẩm này.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-6 text-ch-blue">Đánh giá sản phẩm</h2>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="flex items-start gap-4 border-b last:border-b-0 border-gray-100 pb-6"
          >
            <img
              src={review.user.image || "/avatar-default.png"}
              alt={review.user.name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-gray-50"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800">
                  {review.user.name}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "text-yellow-400 fill-yellow-300"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-gray-700 text-base">{review.comment}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
