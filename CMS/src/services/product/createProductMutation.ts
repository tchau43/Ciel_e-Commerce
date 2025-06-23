import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { Product, ProductInput } from "@/types/dataTypes";

export const useCreateProductMutation = () => {
  return useMutation<Product, Error, ProductInput>({
    mutationKey: ["createProduct"],
    mutationFn: (variables) => {
      console.log("Sending to server:", variables);
      return ProductRepository.createProduct(
        API_ENDPOINTS.ADMIN_CREATE_PRODUCT,
        variables as unknown as FormData
      );
    },
    onError: (error) => {
      console.error("Create product error:", error);
    },
  });
};
