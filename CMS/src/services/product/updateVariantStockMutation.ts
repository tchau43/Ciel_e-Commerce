import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { Product } from "@/types/dataTypes";

interface UpdateVariantStockVariables {
  variantId: string;
  stock: number;
}

export const useUpdateVariantStockMutation = () => {
  return useMutation<Product, Error, UpdateVariantStockVariables>({
    mutationFn: ({ variantId, stock }) =>
      ProductRepository.updateVariantStock(
        API_ENDPOINTS.ADMIN_UPDATE_VARIANT_STOCK(variantId),
        { stock }
      ),
    onError: (error) => {
      console.error("Update variant stock error:", error);
    },
  });
};
