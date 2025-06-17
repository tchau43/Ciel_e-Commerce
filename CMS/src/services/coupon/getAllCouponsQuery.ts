import { useQuery } from "@tanstack/react-query";
import couponRepository from "@/repositories/coupon/coupon";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetAllCouponsQuery = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const response = await couponRepository.getAllCoupons(
        API_ENDPOINTS.ADMIN_GET_ALL_COUPONS
      );
      return response.coupons;
    },
  });
};
