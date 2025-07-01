import OUser from "@/repositories/user/user";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useGetUserDeliveredProductsQuery = (
  userId: string,
  options?: any
): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: ["userDeliveredProducts", userId],
    queryFn: () => {
      return OUser.getDeliveredProducts(
        API_ENDPOINTS.USER_DELIVERED_PRODUCTS(userId)
      );
    },
    enabled: !!userId,
    ...options,
  });
};
