import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReviewMutation } from "@/services/review/createReviewMutation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewFormProps {
  productId: string;
  variantId: string;
  invoiceId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm = ({
  productId,
  variantId,
  invoiceId,
  onSuccess,
  onCancel,
}: ReviewFormProps) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hover, setHover] = useState<number>(0);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState<boolean>(false);

  const { mutate: submitReview, isPending } = useCreateReviewMutation({
    onSuccess: () => {
      setIsSubmitSuccess(true);
      toast.success("Đánh giá thành công!", {
        description:
          "Cảm ơn bạn đã đánh giá sản phẩm. Đánh giá của bạn sẽ được hiển thị sau khi được xem xét.",
        duration: 5000,
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    },
    onError: (error: any) => {
      toast.error("Không thể gửi đánh giá", {
        description:
          error?.response?.data?.message ||
          "Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại.",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    submitReview({
      productId,
      variantId,
      invoiceId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const starVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: (i: number) => ({
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: i * 0.1,
      },
    }),
    hover: { scale: 1.2, rotate: 15 },
    tap: { scale: 0.9 },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  if (isSubmitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Đánh giá thành công!
        </h3>
        <p className="text-green-700 mb-4">
          Cảm ơn bạn đã đánh giá sản phẩm. Đánh giá của bạn sẽ giúp người dùng
          khác đưa ra quyết định mua hàng tốt hơn.
        </p>
        <div className="flex items-center justify-center gap-1">
          {[...Array(rating)].map((_, i) => (
            <span key={i} className="text-2xl text-yellow-400">
              ★
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-lg p-6 max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Đánh giá sản phẩm
          </h3>
          <p className="text-gray-500">
            Chia sẻ trải nghiệm của bạn để giúp người khác có quyết định tốt hơn
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => {
              const ratingValue = i + 1;
              return (
                <motion.button
                  type="button"
                  key={i}
                  variants={starVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  custom={i}
                  className={`text-4xl cursor-pointer focus:outline-none transition-colors duration-200 ${
                    ratingValue <= (hover || rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${
                rating > 0 ? "text-green-600" : "text-gray-500"
              }`}
            >
              {rating > 0
                ? `Bạn đã chọn ${rating} sao - ${
                    rating === 5
                      ? "Tuyệt vời!"
                      : rating === 4
                      ? "Rất tốt!"
                      : rating === 3
                      ? "Bình thường"
                      : rating === 2
                      ? "Không hài lòng"
                      : "Rất tệ"
                  }`
                : "Hãy chọn số sao để đánh giá"}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700"
          >
            Nhận xét của bạn (không bắt buộc)
          </label>
          <Textarea
            id="comment"
            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending || rating === 0}
            className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 transform hover:-translate-y-0.5 ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isPending ? (
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  ⭕
                </motion.div>
                Đang gửi...
              </div>
            ) : (
              "Gửi đánh giá"
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ReviewForm;
