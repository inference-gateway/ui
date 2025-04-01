"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Moon, Sun, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import ModelSelector from "@/components/model-selector";
import { ChatHistory } from "@/components/chat-history";
import { ChatArea } from "@/components/chat-area";
import { InputArea } from "@/components/input-area";
import {
  SchemaCreateChatCompletionStreamResponse,
  InferenceGatewayClient,
  MessageRole,
} from "@inference-gateway/sdk";
import type { Message } from "@/types/chat";

export default function Home() {
  const [chatSessions, setChatSessions] = useState<
    {
      id: string;
      title: string;
      messages: Message[];
    }[]
  >([{ id: "1", title: "New Chat", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState<string>("1");
  const activeChat =
    chatSessions.find((chat) => chat.id === activeChatId) || chatSessions[0];
  const [messages, setMessages] = useState<Message[]>(activeChat.messages);
  const [inputValue, setInputValue] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedModel, setSelectedModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<{
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });
  const [clientInstance, setClientInstance] =
    useState<InferenceGatewayClient | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<string>("");
  const reasoningContentRef = useRef<string>("");

  useEffect(() => {
    const newClient = new InferenceGatewayClient({
      baseURL: "/api/v1",
      fetch: window.fetch.bind(window),
    });
    setClientInstance(newClient);
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  useEffect(() => {
    let scrollInterval: NodeJS.Timeout | null = null;

    if (isStreaming) {
      scrollInterval = setInterval(scrollToBottom, 100);
    }

    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [isStreaming]);

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setChatSessions((prev) => [
      ...prev,
      { id: newChatId, title: "New Chat", messages: [] },
    ]);
    setActiveChatId(newChatId);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !clientInstance) return;

    if (inputValue.startsWith("/")) {
      if (inputValue.trim() === "/reset" || inputValue.trim() === "/clear") {
        setMessages([]);
        setInputValue("");
        setTokenUsage({
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        });
        return;
      }
    }

    const userMessage: Message = {
      role: MessageRole.user,
      content: inputValue,
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatSessions((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, userMessage],
          };
          if (chat.title === "New Chat" && userMessage.content) {
            updatedChat.title =
              userMessage.content.slice(0, 20) +
              (userMessage.content.length > 20 ? "..." : "");
          }
          return updatedChat;
        }
        return chat;
      })
    );
    setInputValue("");
    setIsLoading(true);

    latestMessageRef.current = "";
    reasoningContentRef.current = "";

    const assistantMessageId = Date.now().toString();

    const assistantMessage: Message = {
      role: MessageRole.assistant,
      content: "",
      id: assistantMessageId,
      model: selectedModel,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setChatSessions((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      )
    );
    setIsStreaming(true);

    try {
      await clientInstance.streamChatCompletion(
        {
          model: selectedModel,
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content: content || "",
          })),
          stream: true,
        },
        {
          onChunk: (chunk: SchemaCreateChatCompletionStreamResponse) => {
            const content = chunk.choices[0]?.delta?.content || "";
            console.log("Received chunk:", chunk);
            interface DeltaWithReasoning {
              content?: string;
              reasoning_content?: string;
            }

            const delta = chunk.choices[0]?.delta as DeltaWithReasoning;
            const reasoning = delta?.reasoning_content || "";

            if (content || reasoning) {
              if (content) {
                latestMessageRef.current += content;
              }

              if (reasoning) {
                reasoningContentRef.current += reasoning;
              }

              setMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (updated[lastIndex].id === assistantMessageId) {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    content: latestMessageRef.current,
                    reasoning_content: reasoningContentRef.current || undefined,
                  };
                }
                return updated;
              });
            }

            if (chunk.usage) {
              setTokenUsage({
                promptTokens: chunk.usage.prompt_tokens,
                completionTokens: chunk.usage.completion_tokens,
                totalTokens: chunk.usage.total_tokens,
              });
            }
          },
          onError: (error) => {
            console.error("Stream error:", error);
            throw error;
          },
        }
      );
    } catch (error) {
      console.error("Failed to get response:", error);

      const errorMessage: Message = {
        role: MessageRole.assistant,
        content: "Sorry, I encountered an error. Please try again later.",
        id: Date.now().toString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  return (
    <div className="h-screen bg-neutral-50 dark:bg-neutral-900 flex overflow-hidden">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="fixed top-4 left-4 z-50 h-10 w-10 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 flex items-center justify-center"
        >
          <Menu className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
        </button>
      )}

      {/* Chat History Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out h-full bg-white dark:bg-neutral-800",
          isMobile ? "fixed inset-y-0 z-40 w-64" : "w-64",
          showSidebar ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ChatHistory
          chatSessions={[...chatSessions].sort(
            (a, b) => Number(b.id) - Number(a.id)
          )}
          activeChatId={activeChatId}
          onNewChatAction={handleNewChat}
          onSelectChatAction={(id) => {
            setChatSessions((prev) => {
              const updated = prev.map((chat) =>
                chat.id === activeChatId
                  ? { ...chat, messages: [...messages] }
                  : chat
              );

              setActiveChatId(id);
              const newMessages =
                updated.find((chat) => chat.id === id)?.messages || [];
              setMessages([...newMessages]);

              return updated;
            });
          }}
          onDeleteChatAction={(id) => {
            setChatSessions((prev) => {
              const newSessions = prev.filter((chat) => chat.id !== id);
              if (id === activeChatId && newSessions.length > 0) {
                setActiveChatId(newSessions[0].id);
                setMessages(newSessions[0].messages);
              } else if (newSessions.length === 0) {
                const newChatId = Date.now().toString();
                const newChat = {
                  id: newChatId,
                  title: "New Chat",
                  messages: [],
                };
                setActiveChatId(newChatId);
                setMessages([]);
                return [newChat];
              }
              return newSessions;
            });
          }}
          isMobileOpen={showSidebar}
          setIsMobileOpen={setShowSidebar}
        />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-transform duration-300",
          isMobile && showSidebar ? "translate-x-64" : ""
        )}
      >
        {/* Header */}
        <header className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-xl font-bold text-neutral-800 dark:text-white">
              Inference Gateway UI
            </h1>
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Model Selector */}
              <ModelSelector
                selectedModel={selectedModel}
                onSelectModelAction={setSelectedModel}
              />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="h-10 w-10 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 flex items-center justify-center"
                title="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                ) : (
                  <Moon className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
          onClick={() => isMobile && setShowSidebar(false)}
        >
          <ChatArea messages={messages} isStreaming={isStreaming} />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 w-full bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
          <InputArea
            inputValue={inputValue}
            isLoading={isLoading}
            selectedModel={selectedModel}
            tokenUsage={tokenUsage}
            messages={messages}
            onInputChange={setInputValue}
            onKeyDown={handleKeyDown}
            onSendMessage={handleSendMessage}
            onClearMessages={() => {
              setMessages([]);
              setTokenUsage({
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
