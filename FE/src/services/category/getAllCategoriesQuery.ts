import { useQuery, UseQueryResult } from "@tanstack/react-query";
import category from "@/repositories/category/category";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { Category } from "@/types/dataTypes";

export const useGetAllCategoriesQuery = (
  options?: any
): UseQueryResult<Category[]> => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => {
      const categoriesList = category.getAllCategories(
        API_ENDPOINTS.CATEGORIES
      );
      console.log("categoriesList", categoriesList);
      return categoriesList;
    },
    ...options,
  });
};
