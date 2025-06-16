import { useQuery } from "@tanstack/react-query";
import couponRepository from "@/repositories/coupon/coupon";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetCouponByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["coupon", id],
    queryFn: async () => {
      const response = await couponRepository.getCouponById(
        API_ENDPOINTS.ADMIN_GET_COUPON_BY_ID(id)
      );
      return response;
    },
    enabled: !!id,
  });
};
