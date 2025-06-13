import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";

interface UpdateProductVariables {
  productId: string;
  variables: FormData;
}

export const useUpdateProductMutation = () => {
  return useMutation<any, Error, UpdateProductVariables>({
    mutationFn: ({ productId, variables }) =>
      ProductRepository.updateProduct(
        API_ENDPOINTS.PRODUCT_BY_ID(productId),
        variables
      ),
    onError: (error) => {
      console.error("Update product error:", error);
    },
  });
};
