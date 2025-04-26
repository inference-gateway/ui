import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SchemaChatCompletionMessageToolCallChunk } from '@inference-gateway/sdk';

interface ToolCallBubbleProps {
  toolCall: SchemaChatCompletionMessageToolCallChunk;
  toolCallResult?: string;
}

export default function ToolCallBubble({ toolCall, toolCallResult }: ToolCallBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!toolCall) return null;

  const toggleExpanded = () => setIsExpanded(prev => !prev);

  const getSearchQuery = () => {
    try {
      const args = JSON.parse(toolCall.function?.arguments || '{}');
      return args.query || 'Unknown search query';
    } catch {
      return toolCall.function?.arguments || 'Unknown search query';
    }
  };

  const searchQuery = getSearchQuery();

  return (
    <div className="w-full relative mb-2">
      <div className="flex flex-col">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-200 text-blue-600 dark:text-blue-400 z-10"
        >
          <Search className="h-3 w-3" />
          <span>
            {toolCall.function?.name === 'web_search' ? 'Web Search' : toolCall.function?.name}
          </span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {/* Preview of search query when collapsed */}
        {!isExpanded && (
          <div className="mt-1 relative overflow-hidden max-w-[90%] ml-6">
            <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 overflow-hidden">
              Searching for: <span className="font-medium">{searchQuery}</span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="flex flex-col rounded-lg p-4 mt-1 mb-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-sm transition-all overflow-hidden">
          {/* Tool call details section */}
          <div className="mb-3">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
              Tool Call
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p>
                Function:{' '}
                <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded">
                  {toolCall.function?.name}
                </span>
              </p>
              <p className="mt-1">Arguments:</p>
              <pre className="mt-1 text-xs bg-blue-100 dark:bg-blue-900/50 p-2 rounded overflow-x-auto">
                {JSON.stringify(JSON.parse(toolCall.function?.arguments || '{}'), null, 2)}
              </pre>
            </div>
          </div>

          {/* Tool result section */}
          {toolCallResult && (
            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                Search Results
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{toolCallResult}</ReactMarkdown>
              </div>
            </div>
          )}

          {!toolCallResult && (
            <div className="text-sm text-slate-500 dark:text-slate-400 italic">
              Waiting for search results...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
