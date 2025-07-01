import { CartItemInput } from "@/types/dataTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cart from "@/repositories/cart/cart";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useUpdateCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variables }: { variables: CartItemInput }) => {
      return Cart.updateCart(API_ENDPOINTS.CART_ITEM, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      console.error("Failed to update cart:", error);
    },
  });
};
