import { useQuery } from "@tanstack/react-query";
import faqRepository from "@/repositories/faq/faq";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useSearchFaqsQuery = (query: string) => {
  return useQuery({
    queryKey: ["faqs", "search", query],
    queryFn: async () => {
      const response = await faqRepository.searchFaqs(
        API_ENDPOINTS.FAQS_SEARCH(query)
      );
      return response;
    },
    enabled: !!query && query.length >= 2, 
  });
};
