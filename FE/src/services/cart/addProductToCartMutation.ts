import { CartItemInput } from "@/types/dataTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cart from "@/repositories/cart/cart";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useAddProductToCartMutation = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variables }: { variables: CartItemInput }) => {
      return Cart.updateCart(API_ENDPOINTS.CART_ITEM, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error("Failed to add product to cart:", error);
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
