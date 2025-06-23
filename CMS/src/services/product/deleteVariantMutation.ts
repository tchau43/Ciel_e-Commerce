import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";

interface DeleteVariantVariables {
  variantId: string;
}

export const useDeleteVariantMutation = () => {
  return useMutation<void, Error, DeleteVariantVariables>({
    mutationFn: ({ variantId }) =>
      ProductRepository.deleteVariant(
        API_ENDPOINTS.ADMIN_DELETE_VARIANT(variantId)
      ),
    onError: (error) => {
      console.error("Delete variant error:", error);
    },
  });
};
