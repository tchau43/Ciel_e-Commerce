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
    enabled: hasRequiredFields, // Chỉ gọi API khi có đủ thông tin cần thiết
    staleTime: 5 * 60 * 1000, // Cache trong 5 phút
    retry: false, // Không retry nếu có lỗi
  });
};
