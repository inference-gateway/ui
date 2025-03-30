"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import type { Message } from "@/types/chat-extra";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  onClearChat,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Process commands
  const processCommand = (input: string) => {
    const trimmedInput = input.trim();

    if (trimmedInput === "/reset" || trimmedInput === "/clear") {
      onClearChat();
      return true;
    }

    if (trimmedInput === "/help") {
      onSendMessage("/help");
      return true;
    }

    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue.startsWith("/")) {
      const isCommand = processCommand(inputValue);
      if (isCommand) {
        setInputValue("");
        return;
      }
    }

    handleSendMessage();
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 ? (
          <MessageList messages={messages} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">
                Type a message to begin chatting with the AI assistant
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center space-x-2">
            <form
              onSubmit={handleSubmit}
              className="flex-1 flex items-end space-x-2"
            >
              <MessageInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="submit" disabled={!inputValue.trim()}>
                Send
              </Button>
            </form>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={onClearChat}
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
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
