import CartRepository from "@/repositories/cart/cart";
import { Cart } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useGetCartQuery = (
  userId: string,
  options?: any
): UseQueryResult<Cart> => {
  return useQuery<Cart>({
    queryKey: ["cart", userId],
    queryFn: () => {
      return CartRepository.getCart(API_ENDPOINTS.CART(userId));
    },
    enabled: !!userId,
    ...options,
  });
};
