import {
  ChatbotInput,
  ChatbotResponse,
  ChatHistoryResponse,
} from "@/types/dataTypes";
import Base from "../base";

class Chatbot extends Base {
  sendMessage = async (
    url: string,
    input: ChatbotInput
  ): Promise<ChatbotResponse> => {
    return this.http(url, "post", input);
  };

  getChatHistoryByThread = async (
    url: string
  ): Promise<ChatHistoryResponse> => {
    return this.http(url, "get");
  };
}

export default new Chatbot();
