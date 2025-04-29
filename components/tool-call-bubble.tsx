import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { SchemaChatCompletionMessageToolCall } from '@inference-gateway/sdk';
import { CodeBlock } from './code-block';

interface ToolCallBubbleProps {
  toolCalls: SchemaChatCompletionMessageToolCall[] | undefined;
}

export default function ToolCallBubble({ toolCalls }: ToolCallBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(prev => !prev);

  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  const formattedToolCalls = JSON.stringify(toolCalls, null, 2);

  return (
    <div className="w-full relative mb-0.5">
      <div className="flex flex-col">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[hsl(var(--thinking-bubble-bg))] border border-[hsl(var(--thinking-bubble-border))] hover:bg-[hsl(var(--thinking-bubble-hover-bg))] transition-colors duration-200 text-[hsl(var(--thinking-bubble-text))]"
        >
          <Terminal className="h-3 w-3" />
          <span>Tool Calls ({toolCalls.length})</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="flex items-start gap-4 rounded-lg p-4 mt-1 mb-1 bg-[hsl(var(--thinking-bubble-content-bg))] border border-[hsl(var(--thinking-bubble-content-border))] shadow-sm transition-all overflow-x-auto">
          <div className="flex-1 space-y-2 min-w-0">
            <div className="overflow-x-auto">
              <CodeBlock className="language-json">{formattedToolCalls}</CodeBlock>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
