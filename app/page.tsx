"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import ModelSelector from "@/components/model-selector";
import { ChatArea } from "@/components/chat-area";
import { InputArea } from "@/components/input-area";
import {
  ChatCompletionStreamResponse,
  InferenceGatewayClient,
  MessageRole,
} from "@inference-gateway/sdk";
import type { Message } from "@/types/chat";

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
      role: MessageRole.User,
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
      role: MessageRole.Assistant,
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
            role,
            content: content || "",
          })),
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
        role: MessageRole.Assistant,
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
      <ChatArea messages={messages} isStreaming={isStreaming} />

      {/* Input Area */}
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
  );
}
