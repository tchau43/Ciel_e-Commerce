import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { Product } from "@/types/dataTypes";

interface UpdateProductData {
  name?: string;
  base_price?: number;
  description?: string[];
  category?: string;
  brand?: string;
  tags?: string[];
  images?: string[];
  url?: string;
  popularity?: number;
}

interface UpdateProductVariables {
  productId: string;
  variables: UpdateProductData;
}

export const useUpdateProductMutation = () => {
  return useMutation<Product, Error, UpdateProductVariables>({
    mutationFn: ({ productId, variables }) =>
      ProductRepository.updateProduct(
        API_ENDPOINTS.ADMIN_UPDATE_PRODUCT(productId),
        variables
      ),
    onError: (error) => {
      console.error("Update product error:", error);
    },
  });
};
