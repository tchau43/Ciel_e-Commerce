import { useMutation, useQueryClient } from "@tanstack/react-query";
import couponRepository from "@/repositories/coupon/coupon";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

type CouponItem = {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minPurchaseAmount: number;
  maxUses: number;
  expiresAt: string;
  isActive: boolean;
};

export const useUpdateCouponMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: Partial<CouponItem>) => {
      const response = await couponRepository.updateCoupon(
        API_ENDPOINTS.ADMIN_UPDATE_COUPON(id),
        variables
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon", id] });
    },
  });
};
