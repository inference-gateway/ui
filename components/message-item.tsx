import logger from "@/lib/logger";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";
  logger.debug("Rendering message", {
    role: message.role,
    contentLength: message.content.length,
    id: message.id,
  });

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg p-4",
        isUser
          ? "bg-blue-50 dark:bg-blue-900/20"
          : "bg-gray-100 dark:bg-gray-800"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border",
          isUser
            ? "border-blue-200 bg-blue-100 text-blue-600 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300"
            : "border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="font-medium">{isUser ? "You" : "Assistant"}</div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
