import cart from "@/repositories/cart/cart";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";

export const useDeleteAllProductInCartMutation = () => {
  return useMutation({
    mutationFn: (userId: string) => {
      return cart.deleteProductInCart(API_ENDPOINTS.DELETE_CART(userId));
    },
  });
};
