import { useState, useRef, useEffect } from "react";
import { IoMdChatboxes } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import {
  useChatbotMutation,
  useChatHistoryByThread,
} from "@/services/chatbot/chatbotMutation";
import { IoSend } from "react-icons/io5";
import { FaRobot } from "react-icons/fa";
import { useAuth } from "@/auth/AuthContext";
import DOMPurify from "dompurify";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatHistoryMessage {
  _id: string;
  sessionId: string;
  sender: "user" | "bot";
  message: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [threadId, setThreadId] = useState<string>(() => {
    return localStorage.getItem("chatThreadId") || "";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const chatMutation = useChatbotMutation();
  const { data: chatHistory, isLoading: isLoadingHistory } =
    useChatHistoryByThread(threadId);

  useEffect(() => {
    if (threadId) {
      localStorage.setItem("chatThreadId", threadId);
    }
  }, [threadId]);

  useEffect(() => {
    setMessages([]);
  }, [user?._id]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatHistory?.success && chatHistory?.chatHistory) {
      const formattedMessages = chatHistory.chatHistory.map(
        (msg: ChatHistoryMessage) => ({
          text: msg.message,
          isUser: msg.sender === "user",
          timestamp: new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      );
      setMessages(formattedMessages);

      if (chatHistory.threadId && !threadId) {
        setThreadId(chatHistory.threadId);
      }

      setTimeout(scrollToBottom, 100);
    }
  }, [chatHistory, threadId]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      text: inputMessage,
      isUser: true,
      timestamp: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    try {
      const response = await chatMutation.mutateAsync({
        message: inputMessage,
        threadId: threadId,
      });

      if (response.success) {
        if (response.threadId && !threadId) {
          setThreadId(response.threadId);
        }

        const botMessage = {
          text: response.reply,
          isUser: false,
          timestamp: getCurrentTime(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(response.reply);
      }
    } catch (error) {
      const errorMessage = {
        text: "Xin lỗi, hiện tại tôi không thể trả lời. Vui lòng thử lại sau.",
        isUser: false,
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const initialMessage = {
    greeting: user
      ? `Xin chào ${user.name || ""}! Tôi là Ciel Assistant.`
      : "Xin chào! Tôi là Ciel Assistant.",
    subGreeting: "Tôi có thể giúp bạn:",
    suggestions: [
      "Tìm sản phẩm phù hợp",
      "Tư vấn cấu hình",
      "Chính sách bảo hành",
      "Thông tin khuyến mãi",
    ],
  };

  const renderMessageContent = (text: string) => {
    if (!text) return "";
    const sanitizedHtml = DOMPurify.sanitize(text);
    return (
      <div
        className="
          text-sm leading-relaxed
          [&_.product-card]:bg-white [&_.product-card]:p-4 [&_.product-card]:rounded-lg [&_.product-card]:shadow-sm [&_.product-card]:mb-4
          [&_.specs-grid]:grid [&_.specs-grid]:gap-2 [&_.specs-grid]:my-2
          [&_.spec-item]:flex [&_.spec-item]:justify-between [&_.spec-item]:items-center [&_.spec-item]:border-b [&_.spec-item]:border-gray-100 [&_.spec-item]:py-1
          [&_.spec-label]:text-gray-600 [&_.spec-label]:font-medium
          [&_.spec-value]:text-gray-900
          [&_.comparison-table]:w-full [&_.comparison-table]:border-collapse [&_.comparison-table]:my-4
          [&_.compare-row]:grid [&_.compare-row]:grid-cols-3 [&_.compare-row]:gap-2 [&_.compare-row]:py-2 [&_.compare-row]:border-b [&_.compare-row]:border-gray-100
          [&_.compare-label]:font-medium [&_.compare-label]:text-gray-600
          [&_.compare-value]:text-gray-900
          [&_.advice-box]:bg-blue-50 [&_.advice-box]:p-4 [&_.advice-box]:rounded-lg [&_.advice-box]:border [&_.advice-box]:border-blue-200 [&_.advice-box]:my-4
          [&_.price-box]:flex [&_.price-box]:items-center [&_.price-box]:gap-2 [&_.price-box]:my-2
          [&_.old-price]:text-gray-500 [&_.old-price]:line-through
          [&_.new-price]:text-xl [&_.new-price]:font-bold [&_.new-price]:text-red-600
          [&_.discount-tag]:bg-red-100 [&_.discount-tag]:text-red-600 [&_.discount-tag]:px-2 [&_.discount-tag]:py-1 [&_.discount-tag]:rounded
          [&_.features-list]:space-y-2 [&_.features-list]:my-4
          [&_.feature-item]:flex [&_.feature-item]:items-center [&_.feature-item]:gap-2
          [&_.feature-icon]:text-green-500 [&_.feature-icon]:font-bold
          [&_.feature-text]:text-gray-700
        "
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-ch-blue text-white p-4 rounded-full shadow-lg hover:bg-ch-blue/90 transition-all duration-300 flex items-center justify-center"
      >
        {isOpen ? (
          <IoClose className="w-6 h-6" />
        ) : (
          <div className="relative">
            <IoMdChatboxes className="w-6 h-6" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-ch-blue to-blue-600 text-white p-4">
            <div className="flex items-center space-x-3">
              <FaRobot className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-semibold">Ciel Assistant</h3>
                <p className="text-sm text-blue-100">
                  Luôn sẵn sàng hỗ trợ bạn 24/7
                </p>
              </div>
            </div>
          </div>

          <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-ch-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FaRobot className="w-12 h-12 mx-auto mb-3 text-ch-blue" />
                <p className="text-sm font-medium mb-2">
                  {initialMessage.greeting}
                </p>
                <p className="text-sm mb-4">{initialMessage.subGreeting}</p>
                <div className="space-y-2">
                  {initialMessage.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputMessage(suggestion);
                        document
                          .querySelector<HTMLInputElement>('input[type="text"]')
                          ?.focus();
                      }}
                      className="block w-full text-left text-sm px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex flex-col max-w-[80%] space-y-1">
                    <div className="flex items-center space-x-2">
                      {!message.isUser && (
                        <FaRobot className="w-4 h-4 text-ch-blue" />
                      )}
                      <span className="text-xs text-gray-500">
                        {message.timestamp}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl ${
                        message.isUser
                          ? "bg-ch-blue text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                      }`}
                    >
                      {message.isUser
                        ? message.text
                        : renderMessageContent(message.text)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-gray-100"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue bg-gray-50"
              />
              <button
                type="submit"
                disabled={chatMutation.isPending}
                className="bg-ch-blue text-white p-3 rounded-xl hover:bg-ch-blue/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
