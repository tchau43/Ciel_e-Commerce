import Cart from "@/repositories/cart/cart";
import { CartData } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";

export const useUpdateCartMutation = () => {
  return useMutation({
    mutationFn: ({ variables }: { variables: CartData }) => {
      return Cart.updateCart(API_ENDPOINTS.CART, variables);
    },
  });
};
