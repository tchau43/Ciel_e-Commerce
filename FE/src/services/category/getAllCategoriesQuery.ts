import { useQuery, UseQueryResult } from "@tanstack/react-query";
import category from "@/repositories/category/category";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { CategoryData } from "@/types/dataTypes";

export const useGetAllCategoriesQuery = (
  options?: any
): UseQueryResult<CategoryData[]> => {
  return useQuery<CategoryData[]>({
    queryKey: ["categories"],
    queryFn: () => {
      const categoriesList = category.getAllCetegories(
        API_ENDPOINTS.CATEGORIES
      );
      console.log("categoriesList", categoriesList);
      return categoriesList;
    },
    ...options,
  });
};
