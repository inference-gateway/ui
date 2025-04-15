import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ThinkingBubbleProps {
  content: string;
  isVisible: boolean;
}

export default function ThinkingBubble({ content, isVisible }: ThinkingBubbleProps) {
  if (!isVisible || !content) return null;

  return (
    <div className="flex items-start gap-4 rounded-lg p-4 bg-white dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/50 mb-1 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="font-medium flex items-center">
          <span>Thinking process</span>
          <span className="ml-2 text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300">
            reasoning
          </span>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
