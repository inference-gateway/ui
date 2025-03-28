"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { User, Bot, Moon, Sun, Trash2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ModelSelector from "@/components/model-selector";
import type { CreateChatCompletionRequest, Message } from "@/types/chat";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (inputValue.startsWith("/")) {
      if (inputValue.trim() === "/reset" || inputValue.trim() === "/clear") {
        setMessages([]);
        setInputValue("");
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

    try {
      const chatRequest: CreateChatCompletionRequest = {
        model: selectedModel,
        messages: [...messages, userMessage].map(({ role, content }) => ({
          role,
          content,
          id: "",
        })),
      };

      const response = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
        id: data.id || Date.now().toString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
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
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-neutral-800 dark:text-white">
            Inference Gateway UI
          </h1>
          <div className="flex items-center gap-4">
            {/* Model Selector */}
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
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
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
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
                      <div className="font-medium">
                        {isUser ? "You" : "Assistant"}
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
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
              placeholder="Type a message..."
              rows={1}
              disabled={isLoading}
              className="flex-1 min-h-[40px] max-h-[200px] rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 resize-none disabled:opacity-70"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
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
                onClick={() => setMessages([])}
                disabled={isLoading}
                title="Clear chat"
                className="h-10 w-10 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 flex items-center justify-center disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
              </button>
            )}
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
