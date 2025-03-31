"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { User, Bot, Moon, Sun, Trash2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ModelSelector from "@/components/model-selector";
import {
  ChatCompletionStreamResponse,
  InferenceGatewayClient,
} from "@inference-gateway/sdk";
import type { Message } from "@/types/chat-extra";
import ThinkingBubble from "@/components/thinking-bubble";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedModel, setSelectedModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const latestMessageRef = useRef<string>("");
  const reasoningContentRef = useRef<string>("");
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

  useEffect(() => {
    const newClient = new InferenceGatewayClient({
      baseURL: "/api/v1",
      fetch: window.fetch.bind(window),
    });
    setClientInstance(newClient);
  }, []);

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
      role: "user",
      content: inputValue,
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    latestMessageRef.current = "";
    reasoningContentRef.current = "";

    const assistantMessageId = Date.now().toString();

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      id: assistantMessageId,
      model: selectedModel,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsStreaming(true);

    try {
      await clientInstance.streamChatCompletion(
        {
          model: selectedModel,
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role: role as "user" | "assistant" | "system" | "tool",
            content: content || "",
          })) as any,
          stream: true,
        },
        {
          onChunk: (chunk: ChatCompletionStreamResponse) => {
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
        role: "assistant",
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
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
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {messages.length > 0 ? (
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const nextMessage = messages[index + 1];
                const showReasoning =
                  !isUser &&
                  message.reasoning_content &&
                  nextMessage?.role !== "user";

                return (
                  <div key={`${message.role + message.id}`}>
                    {!isUser && (
                      <ThinkingBubble
                        content={message.reasoning_content || ""}
                        isVisible={!!showReasoning}
                      />
                    )}
                    <div
                      className={`flex items-start gap-4 rounded-lg p-4 ${
                        isUser
                          ? "bg-blue-50 dark:bg-blue-950/20"
                          : "bg-neutral-100 dark:bg-neutral-800"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
                          isUser
                            ? "border-blue-200 bg-blue-100 text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : "border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        }`}
                      >
                        {isUser ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="font-medium flex items-center gap-2">
                          {isUser ? (
                            "You"
                          ) : (
                            <>
                              Assistant
                              {!isUser && message.model && (
                                <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-full font-normal">
                                  {message.model}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {message.content === "" ? (
                            <div className="animate-pulse space-y-2">
                              <div className="h-3 bg-neutral-300 dark:bg-neutral-600 rounded w-3/4"></div>
                              <div className="h-3 bg-neutral-300 dark:bg-neutral-600 rounded w-1/2"></div>
                            </div>
                          ) : (
                            <>
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                              {isStreaming &&
                                index === messages.length - 1 &&
                                !isUser && (
                                  <span className="inline-block w-1 h-4 bg-current animate-pulse ml-1"></span>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-180px)]">
              <div className="text-center text-neutral-500 dark:text-neutral-400">
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm">
                  Type a message to begin chatting with the AI assistant
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-end gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !selectedModel
                  ? "Please select a model first..."
                  : "Type a message..."
              }
              rows={1}
              disabled={isLoading || !selectedModel}
              className="flex-1 min-h-[40px] max-h-[200px] rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 resize-none disabled:opacity-70"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || !selectedModel}
              className="h-10 px-4 py-2 rounded-md bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                "Send"
              )}
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  setTokenUsage({
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0,
                  });
                }}
                disabled={isLoading}
                title="Clear chat"
                className="h-10 w-10 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 flex items-center justify-center disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
              </button>
            )}
          </div>
          <div className="mt-4 p-2 border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800">
            <div className="container mx-auto max-w-4xl">
              <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
                <span className="bg-blue-50 dark:bg-blue-900/20 p-1 px-2 rounded">
                  Prompt: {tokenUsage.promptTokens || 0} tokens
                </span>
                <span className="bg-green-50 dark:bg-green-900/20 p-1 px-2 rounded">
                  Completion: {tokenUsage.completionTokens || 0} tokens
                </span>
                <span className="font-medium bg-neutral-100 dark:bg-neutral-700 p-1 px-2 rounded">
                  Total: {tokenUsage.totalTokens || 0} tokens
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>
              Press Enter to send, Shift+Enter for new line. Try commands like
              /help or /reset
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
