import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { Product } from "@/types/dataTypes";

export const useCreateProductMutation = () => {
  return useMutation<Product, Error, FormData>({
    mutationFn: (variables) =>
      ProductRepository.createProduct(
        API_ENDPOINTS.ADMIN_CREATE_PRODUCT,
        variables
      ),
    onError: (error) => {
      console.error("Create product error:", error);
    },
  });
};
