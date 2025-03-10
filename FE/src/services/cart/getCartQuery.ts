import Cart from "@/repositories/cart/cart";
import { CartData } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useGetCartQuery = (
  _id: string,
  options?: any
): UseQueryResult<CartData> => {
  return useQuery<CartData>({
    queryKey: ["cart", _id],
    queryFn: () => {
      return Cart.getCart(API_ENDPOINTS.CART(_id));
    },
    enabled: !!_id, // Only fetch if _Id exists
    ...options,
  });
};
