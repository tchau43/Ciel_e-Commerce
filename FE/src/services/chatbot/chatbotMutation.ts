import { useMutation, useQuery } from "@tanstack/react-query";
import chatbotRepository from "@/repositories/chatbot/chatbot";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import {
  ChatbotInput,
  ChatbotResponse,
  ChatHistoryResponse,
} from "@/types/dataTypes";
import { toast } from "sonner";

export const useChatbotMutation = () => {
  return useMutation<ChatbotResponse, Error, ChatbotInput>({
    mutationFn: (input: ChatbotInput) => {
      return chatbotRepository.sendMessage(API_ENDPOINTS.CHATBOT, input);
    },
    onError: (error: any) => {
      toast.error("Không thể gửi tin nhắn", {
        description: error?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.",
      });
    },
  });
};

export const useChatHistoryByThread = (threadId: string) => {
  return useQuery<ChatHistoryResponse, Error>({
    queryKey: ["chatHistory", threadId],
    queryFn: () =>
      chatbotRepository.getChatHistoryByThread(
        API_ENDPOINTS.CHAT_HISTORY_BY_THREAD(threadId)
      ),
    enabled: !!threadId,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
