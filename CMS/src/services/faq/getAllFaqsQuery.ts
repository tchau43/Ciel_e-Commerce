import { useQuery } from "@tanstack/react-query";
import faqRepository, { FAQResponse } from "@/repositories/faq/faq";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetAllFaqsQuery = () => {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const response = await faqRepository.getAllFaqs(API_ENDPOINTS.FAQS);
      return response;
    },
  });
};
