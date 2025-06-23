import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";

interface DeleteProductVariables {
  productId: string;
}

export const useDeleteProductMutation = () => {
  return useMutation<void, Error, DeleteProductVariables>({
    mutationFn: ({ productId }) =>
      ProductRepository.deleteProduct(
        API_ENDPOINTS.ADMIN_DELETE_PRODUCT(productId)
      ),
    onError: (error) => {
      console.error("Delete product error:", error);
    },
  });
};
