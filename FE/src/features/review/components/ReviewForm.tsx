import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReviewMutation } from "@/services/review/createReviewMutation";
import { toast } from "sonner";

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

  const { mutate: submitReview, isPending } = useCreateReviewMutation({
    onSuccess: () => {
      toast.success("Đánh giá của bạn đã được gửi thành công!");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại."
      );
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

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="mb-2 font-medium">Đánh giá của bạn</p>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => {
              const ratingValue = i + 1;
              return (
                <button
                  type="button"
                  key={i}
                  className={`text-3xl cursor-pointer focus:outline-none transition-colors ${
                    ratingValue <= (hover || rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500">
            {rating > 0
              ? `Bạn đã chọn ${rating} sao`
              : "Hãy chọn số sao để đánh giá"}
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block mb-2 font-medium">
            Nhận xét của bạn (không bắt buộc)
          </label>
          <Textarea
            id="comment"
            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isPending || rating === 0}>
            {isPending ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
