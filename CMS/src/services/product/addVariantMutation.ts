import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { Product, VariantInput } from "@/types/dataTypes";

interface AddVariantVariables {
  productId: string;
  variables: VariantInput;
}

export const useAddVariantMutation = () => {
  return useMutation<Product, Error, AddVariantVariables>({
    mutationFn: ({ productId, variables }) =>
      ProductRepository.addVariant(
        API_ENDPOINTS.ADMIN_ADD_VARIANT(productId),
        variables
      ),
    onError: (error) => {
      console.error("Add variant error:", error);
    },
  });
};
