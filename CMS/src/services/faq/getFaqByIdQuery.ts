import { useQuery } from "@tanstack/react-query";
import faqRepository from "@/repositories/faq/faq";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const useGetFaqByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["faqs", "detail", id],
    queryFn: async () => {
      const response = await faqRepository.getFaqById(
        API_ENDPOINTS.FAQ_BY_ID(id)
      );
      return response;
    },
    enabled: !!id,
  });
};
