"use client";

import { Trash2, Loader2 } from "lucide-react";
import type { Message } from "@/types/chat";

interface InputAreaProps {
  inputValue: string;
  isLoading: boolean;
  selectedModel: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  messages: Message[];
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
  onClearMessages: () => void;
}

export function InputArea({
  inputValue,
  isLoading,
  selectedModel,
  tokenUsage,
  messages,
  onInputChange,
  onKeyDown,
  onSendMessage,
  onClearMessages,
}: InputAreaProps) {
  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
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
            onClick={onSendMessage}
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
              onClick={onClearMessages}
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
  );
}
