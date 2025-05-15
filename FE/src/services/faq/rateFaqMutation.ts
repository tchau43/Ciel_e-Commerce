import { useMutation, useQueryClient } from "@tanstack/react-query";
import faqRepository from "@/repositories/faq/faq";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { toast } from "sonner";

interface RateFaqOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useRateFaqMutation = (faqId: string, options?: RateFaqOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isHelpful: boolean) => {
      return await faqRepository.rateFaqHelpfulness(
        API_ENDPOINTS.FAQ_RATE(faqId),
        isHelpful
      );
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["faqs", "detail", faqId] });

      // Show success toast
      toast.success("Đánh giá của bạn đã được ghi nhận", {
        description: "Cảm ơn bạn đã đóng góp ý kiến.",
      });

      // Call custom onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error: any) => {
      // Show error toast
      toast.error("Không thể gửi đánh giá", {
        description: error?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.",
      });

      // Call custom onError if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
