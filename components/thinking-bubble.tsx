import { useState } from 'react';
import { Bot, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ThinkingBubbleProps {
  content: string;
  isVisible: boolean;
  isStreaming?: boolean;
  streamTokens?: string;
  isThinkingModel?: boolean;
}

export default function ThinkingBubble({
  content,
  isVisible,
  isStreaming = false,
  streamTokens = '',
  isThinkingModel = false,
}: ThinkingBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isThinkingModel || (!isVisible && !isStreaming) || (!content && !isStreaming)) return null;

  const toggleExpanded = () => setIsExpanded(prev => !prev);

  const displayContent = isExpanded ? content : isStreaming ? streamTokens : content;

  const bubbleLabel = isStreaming ? 'Thinking...' : 'Thinking process';

  const isActivelyThinking = isStreaming;

  const previewContent = (isStreaming ? streamTokens : content).slice(0, 150);

  return (
    <div className="w-full relative mb-0.5">
      <div className="flex flex-col">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[hsl(var(--thinking-bubble-bg))] border border-[hsl(var(--thinking-bubble-border))] hover:bg-[hsl(var(--thinking-bubble-hover-bg))] transition-colors duration-200 text-[hsl(var(--thinking-bubble-text))] z-10"
        >
          <Bot className={`h-3 w-3 ${isStreaming ? 'animate-pulse' : ''}`} />
          <span>{bubbleLabel}</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {!isExpanded && isActivelyThinking && previewContent && (
          <div className="mt-1 relative overflow-hidden max-w-[90%] ml-6">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--thinking-bubble-gradient-via))] to-[hsl(var(--thinking-bubble-gradient-to))] animate-pulse-slow z-10"></div>
            <div className="absolute inset-0 backdrop-blur-[3px] z-10"></div>
            <div className="font-mono text-[8px] leading-tight opacity-50 text-[hsl(var(--thinking-bubble-mono-text))] line-clamp-2 overflow-hidden">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="whitespace-nowrap">
                    {previewContent.split(' ').map((word, index) => (
                      <span
                        key={index}
                        className="inline-block mx-0.5 animate-fade-in"
                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="flex items-start gap-4 rounded-lg p-4 mt-1 mb-1 bg-[hsl(var(--thinking-bubble-content-bg))] border border-[hsl(var(--thinking-bubble-content-border))] shadow-sm transition-all overflow-hidden">
          <div className="flex-1 space-y-2">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
