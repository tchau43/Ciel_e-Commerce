import CartRepository from "@/repositories/cart/cart"; // Renamed import to avoid conflict
// Import the correct type 'Cart' from dataTypes.ts
import { Cart } from "@/types/dataTypes"; // Changed from CartData
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useGetCartQuery = (
  // Use userId instead of _id for clarity, assuming it's the user's ID
  userId: string,
  options?: any
  // Update the return type hint to use Cart
): UseQueryResult<Cart> => {
  // Changed from CartData
  // Update the query type hint to use Cart
  return useQuery<Cart>({
    // Changed from CartData
    // Use a more specific query key including the userId
    queryKey: ["cart", userId],
    queryFn: () => {
      // Call the repository method
      return CartRepository.getCart(API_ENDPOINTS.CART(userId));
    },
    // Ensure the query only runs if userId is truthy
    enabled: !!userId,
    ...options,
  });
};
