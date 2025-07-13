import { useQuery } from "@tanstack/react-query";
import { Address } from "@/types/dataTypes";
import DeliveryRepository from "@/repositories/delivery/delivery";

interface DeliveryFeeData {
  deliveryFee: number;
  currency: string;
  shippingAddress: Address;
}

export const useGetDeliveryFeeQuery = (address: Address) => {
  const hasRequiredFields = Boolean(
    address.city?.trim() && address.state?.trim()
  );

  return useQuery<DeliveryFeeData, Error>({
    queryKey: ["delivery-fee", address],
    queryFn: async () => {
      try {
        return await DeliveryRepository.calculateDeliveryFee(address);
      } catch (error: any) {
        console.error("Delivery Fee Query Error:", error);
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Failed to calculate delivery fee"
        );
      }
    },
    enabled: hasRequiredFields, 
    retry: false, 
  });
};
