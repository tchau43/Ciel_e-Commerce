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

export const useCreateCouponMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: Partial<CouponItem>) => {
      const response = await couponRepository.createCoupon(
        API_ENDPOINTS.ADMIN_CREATE_COUPON,
        variables
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};
