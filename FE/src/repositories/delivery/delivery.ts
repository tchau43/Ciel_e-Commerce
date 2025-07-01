import { API_ENDPOINTS } from "@/utils/api/endpoint";
import Base from "../base";
import { Address } from "@/types/dataTypes";

interface DeliveryFeeData {
  deliveryFee: number;
  currency: string;
  shippingAddress: Address;
}

interface APIResponse {
  success: boolean;
  data: DeliveryFeeData;
}

class DeliveryRepository extends Base {
  calculateDeliveryFee = async (address: Address): Promise<DeliveryFeeData> => {
    try {
      const payload = {
        shippingAddress: {
          street: address.street || "",
          city: address.city || "",
          state: address.state || "",
          country: address.country || "",
          zipCode: address.zipCode || "",
        },
      };

      console.log("Sending payload to API:", payload);

      const response = await this.http<APIResponse>(
        API_ENDPOINTS.DELIVERY.CALCULATE_FEE,
        "post",
        payload
      );

      console.log("API Response:", response);

      if (!response.success) {
        throw new Error("Failed to calculate delivery fee");
      }

      return response.data;
    } catch (error: any) {
      console.error("Delivery Fee API Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  };
}

export default new DeliveryRepository();
