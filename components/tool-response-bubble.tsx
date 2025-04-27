import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { CodeBlock } from './code-block';
import logger from '@/lib/logger';

interface ToolResponse {
  query: string;
  results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  error?: string;
}

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

  let formattedResponse = null;
  try {
    const parsedResponse: ToolResponse = JSON.parse(response);
    if (parsedResponse.error) {
      logger.error('Tool response error:', parsedResponse.results);
      return null;
    }
    formattedResponse = JSON.stringify(parsedResponse.results, null, 2);
  } catch (err) {
    logger.error('Error parsing tool response:', err);
    return null;
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
        <div className="flex items-start gap-4 rounded-lg p-4 mt-1 mb-1 bg-[hsl(var(--thinking-bubble-content-bg))] border border-[hsl(var(--thinking-bubble-content-border))] shadow-sm transition-all overflow-x-auto">
          <div className="flex-1 space-y-2 min-w-0">
            <div className="overflow-x-auto">
              <CodeBlock className="language-json">{formattedResponse}</CodeBlock>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
