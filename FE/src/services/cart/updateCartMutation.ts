// Import the correct type from dataTypes.ts
import { CartItemInput } from "@/types/dataTypes"; // Changed from UpdateCartItemData
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cart from "@/repositories/cart/cart";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useUpdateCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Use the correct type for variables
    mutationFn: ({ variables }: { variables: CartItemInput }) => {
      // Changed from UpdateCartItemData
      // Use the correct endpoint name
      return Cart.updateCart(API_ENDPOINTS.CART_ITEM, variables); // Changed from UPDATE_CART
    },
    onSuccess: () => {
      // Invalidate the cart query to trigger a refetch
      // Include userId in queryKey if your getCartQuery uses it
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      console.error("Failed to update cart:", error);
    },
  });
};
