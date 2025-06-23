import { useMutation, useQueryClient } from "@tanstack/react-query";
import couponRepository from "@/repositories/coupon/coupon";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useDeleteCouponMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await couponRepository.deleteCoupon(
        API_ENDPOINTS.ADMIN_DELETE_COUPON(id)
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};
