import { useState, useEffect, useRef, FormEvent, SetStateAction } from "react";
import { AIMessage } from "@/types/ai";
import { AIService } from "@/services/ai-service";
import { useTheme } from "next-themes";
import { SendHorizonal, X, Mic, Paperclip, RefreshCw } from "lucide-react";

interface AIChatProps {
  onClose: () => void;
  initialMessage?: string;
}

export const AIChat = ({ onClose, initialMessage }: AIChatProps) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typedResponse, setTypedResponse] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
    }
    inputRef.current?.focus();
  }, [initialMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typedResponse]);

  const typeResponse = (response: string) => {
    let i = 0;
    setTypedResponse("");
    setIsTyping(true);

    typingIntervalRef.current = setInterval(() => {
      if (i < response.length) {
        setTypedResponse((prev) => prev + response.charAt(i));
        i++;
      } else {
        clearInterval(typingIntervalRef.current);
        setIsTyping(false);
      }
    }, 20);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await AIService.sendMessage([userMessage]);

      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        content: response.response
          ?.replaceAll("</think>", "")
          ?.replaceAll("think>", ""),
        role: "assistant",
        timestamp: new Date(response.created_at),
      };

      setMessages((prev) => [...prev, aiMessage]);
      typeResponse(
        response.response?.replaceAll("</think>", "")?.replaceAll("think>", "")
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`AI Error: ${errorMessage}`);
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setTypedResponse("");
    setError(null);
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setIsTyping(false);
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col  w-full justify-between border h-[70vh] p-4 rounded-xl">
      <ul className=" overflow-y-auto h-[90%] space-y-5" ref={scrollRef}>
        {/* Messages */}
        {messages.map((message) => (
          <>
            {/* User Message */}
            {message.role === "user" && (
              <li key={message.id} className="py-2 sm:py-4 ml-auto ">
                <div className="max-w-4xl px-4 sm:px-6    lg:px-8 mx-auto">
                  <div className="  flex justify-between gap-x-2 sm:gap-x-4">
                    <div className="grow mt-2 shadow bg-gray-100  w-full    rounded-xl  p-4 space-y-3">
                      <p className="text-gray-800 dark:text-neutral-200">
                        {message.content}
                      </p>
                    </div>
                    <img
                      className="inline-block w-10 mt-2 h-10 rounded-full"
                      src="https://media.licdn.com/dms/image/v2/D4D03AQEanPoawddODQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1724061520530?e=1755734400&v=beta&t=kcozPkuTwOFmL4UC_t0EYior_1dDnDkd8sX17ykKJ_U"
                      alt="Avatar"
                    />
                  </div>
                </div>
              </li>
            )}

            {/* AI Message */}
            {message.role === "assistant" && (
              <li
                key={message.id}
                className="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4"
              >
                <img
                  className="inline-block w-10 border shadow-lg mt-2 h-10 rounded-full"
                  src="https://cdn-1.webcatalog.io/catalog/deepseek/deepseek-icon-filled-256.webp?v=1748219623720"
                  alt="Avatar"
                />

                <div className="grow  shadow bg-gray-100    rounded-xl  p-4 w-full space-y-3">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-800 dark:text-white">
                      {message.id === messages[messages.length - 1]?.id
                        ? typedResponse?.replaceAll("<", "")
                        : message.content?.replaceAll("<", "")}
                      {isTyping &&
                        message.id === messages[messages.length - 1]?.id && (
                          <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-gray-500 align-middle"></span>
                        )}
                    </p>
                  </div>

                  <div>
                    <div className="sm:flex sm:justify-between">
                      <div className="cursor-not-allowed">
                        <button
                          type="button"
                          disabled
                          className="py-2 px-3     inline-flex items-center gap-x-2 text-sm rounded-full border border-transparent text-gray-500 hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                          </svg>
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )}
          </>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <li className="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4">
            <svg
              className="shrink-0 size-9.5 rounded-full"
              width="38"
              height="38"
              viewBox="0 0 38 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="38" height="38" rx="6" fill="#2563EB" />
              <path
                d="M10 28V18.64C10 13.8683 14.0294 10 19 10C23.9706 10 28 13.8683 28 18.64C28 23.4117 23.9706 27.28 19 27.28H18.25"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M13 28V18.7552C13 15.5104 15.6863 12.88 19 12.88C22.3137 12.88 25 15.5104 25 18.7552C25 22 22.3137 24.6304 19 24.6304H18.25"
                stroke="white"
                strokeWidth="1.5"
              />
              <ellipse cx="19" cy="18.6554" rx="3.75" ry="3.6" fill="white" />
            </svg>

            <div className="grow max-w-[90%] md:max-w-2xl w-full space-y-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
              </div>
            </div>
          </li>
        )}

        {/* Error Message */}
        {error && (
          <li className="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4">
            <div className="w-full text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          </li>
        )}
      </ul>

      {/* Input Area */}
      <div className=" z-10 mt-3 border-t border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
        <div className=" w-full mx-auto px-4 sm:px-6 lg:px-0">
          <div className="flex justify-between items-center mb-3">
            {isLoading && (
              <button
                type="button"
                className="py-1.5 px-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                onClick={() => {
                  if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                  }
                  setIsLoading(false);
                  setIsTyping(false);
                }}
              >
                <svg
                  className="size-3"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z" />
                </svg>
                Stop generating
              </button>
            )}
          </div>

          <div className="relative  w-full">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="p-3 sm:p-4 pb-12 sm:pb-12 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              placeholder="Ask me anything..."
              disabled={isLoading}
              rows={1}
              autoFocus
            />

            <div className="absolute bottom-px inset-x-px p-2 rounded-b-lg bg-white dark:bg-neutral-900">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="inline-flex cursor-not-allowed   shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-gray-100 focus:z-10 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                  >
                    <Paperclip className="shrink-0 size-4" />
                  </button>
                </div>

                <div className="flex items-center gap-x-1">
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed   shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-gray-100 focus:z-10 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                  >
                    <Mic className="shrink-0 size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:z-10 focus:outline-hidden focus:bg-blue-500"
                  >
                    <SendHorizonal className="shrink-0 size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
