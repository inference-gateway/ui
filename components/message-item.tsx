import type { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { User, Bot, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { MessageRole } from '@/types/chat';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isTool = message.role === MessageRole.tool;

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg p-4',
        isUser
          ? 'bg-[hsl(var(--message-user-bg))] dark:bg-[hsl(var(--message-user-bg-dark))]'
          : isTool
            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800'
            : 'bg-[hsl(var(--message-ai-bg))] dark:bg-[hsl(var(--message-ai-bg-dark))]'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border',
          isUser
            ? 'border-[hsl(var(--message-user-icon-border))] bg-[hsl(var(--message-user-icon-bg))] text-[hsl(var(--message-user-icon-text))] dark:border-[hsl(var(--message-user-icon-border-dark))] dark:bg-[hsl(var(--message-user-icon-bg-dark))] dark:text-[hsl(var(--message-user-icon-text-dark))]'
            : isTool
              ? 'border-blue-200 bg-blue-100 text-blue-600 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-400'
              : 'border-[hsl(var(--message-ai-icon-border))] bg-[hsl(var(--message-ai-icon-bg))] text-[hsl(var(--message-ai-icon-text))] dark:border-[hsl(var(--message-ai-icon-border-dark))] dark:bg-[hsl(var(--message-ai-icon-bg-dark))] dark:text-[hsl(var(--message-ai-icon-text-dark))]'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : isTool ? (
          <Search className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="font-medium">
          {isUser ? 'You' : isTool ? 'Web Search Results' : 'Assistant'}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content && <ReactMarkdown>{message.content}</ReactMarkdown>}
        </div>
      </div>
    </div>
  );
}
