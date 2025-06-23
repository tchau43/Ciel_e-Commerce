import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { Product } from "@/types/dataTypes";

interface UpdateVariantData {
  types?: string;
  price?: number;
  stock?: number;
}

interface UpdateVariantVariables {
  variantId: string;
  variables: UpdateVariantData;
}

export const useUpdateVariantMutation = () => {
  return useMutation<Product, Error, UpdateVariantVariables>({
    mutationFn: ({ variantId, variables }) =>
      ProductRepository.updateVariant(
        API_ENDPOINTS.ADMIN_UPDATE_VARIANT(variantId),
        variables
      ),
    onError: (error) => {
      console.error("Update variant error:", error);
    },
  });
};
