// Import the correct type from dataTypes.ts
import { CartItemInput } from "@/types/dataTypes"; // Changed from UpdateCartItemData
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cart from "@/repositories/cart/cart";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useAddProductToCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Use the correct type for variables
    mutationFn: ({ variables }: { variables: CartItemInput }) => {
      // Changed from UpdateCartItemData
      // Use the correct endpoint name
      return Cart.updateCart(API_ENDPOINTS.CART_ITEM, variables); // Changed from ADD_TO_CART
    },
    onSuccess: () => {
      // Invalidate the cart query to trigger a refetch
      // Consider invalidating with the user ID if your query key includes it
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      // Log the specific error for better debugging
      console.error("Failed to add product to cart:", error);
    },
  });
};
