import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import Product from "@/repositories/product/product";

export const useUpdateProductMutation = () => {
  return useMutation({
    mutationFn: ({
      productId,
      variables,
    }: {
      productId: string;
      variables: FormData;
      // variables: ProductReq;
    }) => {
      // console.log(
      //   ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>variables",
      //   variables
      // );
      return Product.updateProduct(
        API_ENDPOINTS.PRODUCT_BY_ID(productId),
        variables
      );
    },
  });
};
