import { useQuery } from "@tanstack/react-query";
import couponRepository from "@/repositories/coupon/coupon";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useValidateCouponQuery = (code: string, subtotal: number) => {
  return useQuery({
    queryKey: ["coupons", "validate", code, subtotal],
    queryFn: async () => {
      if (!code) return null;
      const response = await couponRepository.validateCoupon(
        `${API_ENDPOINTS.VALIDATE_COUPON}?code=${code}&subtotal=${subtotal}`
      );
      console.log(response);
      return response;
    },
    enabled: !!code,
  });
};
