import { useMutation } from "@tanstack/react-query";
import chatbotRepository from "@/repositories/chatbot/chatbot";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { ChatbotInput, ChatbotResponse } from "@/types/dataTypes";
import { toast } from "sonner";

export const useChatbotMutation = () => {
  return useMutation<ChatbotResponse, Error, ChatbotInput>({
    mutationFn: (message: ChatbotInput) => {
      return chatbotRepository.sendMessage(API_ENDPOINTS.CHATBOT, message);
    },
    onError: (error: any) => {
      toast.error("Không thể gửi tin nhắn", {
        description: error?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.",
      });
    },
  });
};
