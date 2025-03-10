import { UpdateCartItemData } from "@/types/dataTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cart from "@/repositories/cart/cart";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useAddProductToCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variables }: { variables: UpdateCartItemData }) => {
      return Cart.updateCart(API_ENDPOINTS.ADD_TO_CART, variables);
    },
    onSuccess: () => {
      // Invalidate the cart query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      console.error("Failed to update cart:", error);
    },
  });
};
