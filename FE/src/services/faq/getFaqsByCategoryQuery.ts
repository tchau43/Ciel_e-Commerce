import { useQuery } from "@tanstack/react-query";
import faqRepository from "@/repositories/faq/faq";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetFaqsByCategoryQuery = (category: string) => {
  return useQuery({
    queryKey: ["faqs", "category", category],
    queryFn: async () => {
      const response = await faqRepository.getFaqsByCategory(
        API_ENDPOINTS.FAQS_BY_CATEGORY(category)
      );
      return response;
    },
    enabled: !!category, // Only run the query if category is provided
  });
};
