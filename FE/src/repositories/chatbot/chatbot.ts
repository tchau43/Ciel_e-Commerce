import { ChatbotInput, ChatbotResponse } from "@/types/dataTypes";
import Base from "../base";

class Chatbot extends Base {
  /**
   * Send a message to the chatbot and get a response
   * @param url API endpoint for chatbot
   * @param message Message to send to chatbot
   * @returns Chatbot's response
   */
  sendMessage = async (
    url: string,
    message: ChatbotInput
  ): Promise<ChatbotResponse> => {
    return this.http(url, "post", message);
  };
}

export default new Chatbot();
