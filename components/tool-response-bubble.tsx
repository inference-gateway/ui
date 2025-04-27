import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface ToolResponseBubbleProps {
  response: string;
  toolName?: string;
}

export default function ToolResponseBubble({ response, toolName }: ToolResponseBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(prev => !prev);

  if (!response) {
    return null;
  }

  let responseContent;
  try {
    responseContent = JSON.parse(response);
    responseContent = JSON.stringify(responseContent, null, 2);
  } catch {
    responseContent = response;
  }

  return (
    <div className="w-full relative mb-0.5">
      <div className="flex flex-col">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[hsl(var(--thinking-bubble-bg))] border border-[hsl(var(--thinking-bubble-border))] hover:bg-[hsl(var(--thinking-bubble-hover-bg))] transition-colors duration-200 text-[hsl(var(--thinking-bubble-text))] z-10"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>{toolName ? `${toolName} Response` : 'Tool Response'}</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="flex items-start gap-4 rounded-lg p-4 mt-1 mb-1 bg-[hsl(var(--thinking-bubble-content-bg))] border border-[hsl(var(--thinking-bubble-content-border))] shadow-sm transition-all overflow-hidden">
          <div className="flex-1 space-y-2">
            <pre className="whitespace-pre-wrap break-all text-sm">{responseContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
