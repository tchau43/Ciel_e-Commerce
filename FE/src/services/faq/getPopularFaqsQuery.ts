import { useQuery } from "@tanstack/react-query";
import faqRepository from "@/repositories/faq/faq";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetPopularFaqsQuery = () => {
  return useQuery({
    queryKey: ["faqs", "popular"],
    queryFn: async () => {
      const response = await faqRepository.getPopularFaqs(
        API_ENDPOINTS.FAQS_POPULAR
      );
      return response;
    },
  });
};
