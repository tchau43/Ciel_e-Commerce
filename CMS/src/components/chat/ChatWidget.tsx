import { useState, useRef, useEffect } from "react";
import { IoMdChatboxes } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useChatbotMutation } from "@/services/chatbot/chatbotMutation";
import { IoSend } from "react-icons/io5";

interface Message {
  text: string;
  isUser: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChatbotMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    try {
      const response = await chatMutation.mutateAsync({
        message: inputMessage,
      });
      const botMessage = { text: response.reply, isUser: false };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300"
      >
        {isOpen ? (
          <IoClose className="w-6 h-6" />
        ) : (
          <IoMdChatboxes className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
          {/* Chat Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg">
            <h3 className="text-lg font-semibold">Chat với chúng tôi</h3>
          </div>

          {/* Messages Container */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={chatMutation.isPending}
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
              >
                {chatMutation.isPending ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <IoSend className="w-6 h-6" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
