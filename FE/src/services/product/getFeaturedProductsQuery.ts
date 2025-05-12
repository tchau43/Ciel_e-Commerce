import { Product } from "@/types/dataTypes";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ProductRepository from "@/repositories/product/product";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetFeaturedProductsQuery = (
  // Tùy chọn có thể chứa limit, enabled, etc.
  options?: { limit?: number; enabled?: boolean; [key: string]: any }
): UseQueryResult<Product[]> => {
  return useQuery<Product[], Error>({
    queryKey: ["featuredProducts", options?.limit],
    queryFn: async () => {
      // Xây dựng URL với query params nếu có (ví dụ: limit)
      let url = API_ENDPOINTS.FEATURED_PRODUCTS;
      if (options?.limit) {
        url += `?limit=${options.limit}`;
      }
      // Gọi repository để lấy dữ liệu
      const featuredProducts = await ProductRepository.getFeaturedProducts(url);
      return featuredProducts;
    },
    // Truyền toàn bộ object options vào useQuery
    ...options,
  });
};
