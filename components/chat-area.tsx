"use client";

import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ThinkingBubble from "@/components/thinking-bubble";
import type { Message } from "@/types/chat";

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
}

export function ChatArea({ messages, isStreaming }: ChatAreaProps) {
  return (
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
  );
}
