import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft, Wrench, CheckCircle, XCircle, Bot } from 'lucide-react';
import { CodeBlock } from './code-block';
import logger from '@/lib/logger';
import { isMCPTool, isA2ATool } from '@/lib/tools';

interface ToolResponse {
  query: string;
  results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  error?: string;
}

interface MCPToolResponse {
  content?: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
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

  const isMCP = isMCPTool(toolName || '');
  const isA2A = isA2ATool(toolName || '');
  let formattedResponse = null;
  let mcpResponse: MCPToolResponse | null = null;
  let isError = false;

  try {
    if (isMCP || isA2A) {
      try {
        mcpResponse = JSON.parse(response) as MCPToolResponse;
        isError = mcpResponse.isError || false;

        if (mcpResponse.content && mcpResponse.content.length > 0) {
          formattedResponse = mcpResponse.content.map(item => item.text).join('\n');
        } else {
          formattedResponse = response;
        }
      } catch {
        formattedResponse = response;
      }
    } else {
      const parsedResponse: ToolResponse = JSON.parse(response);
      if (parsedResponse.error) {
        logger.error('Tool response error:', parsedResponse.error);
        isError = true;
        formattedResponse = parsedResponse.error;
      } else {
        formattedResponse = JSON.stringify(parsedResponse.results, null, 2);
      }
    }
  } catch (err) {
    logger.error('Error parsing tool response:', err);
    formattedResponse = response;
  }

  if (!formattedResponse) {
    return null;
  }

  return (
    <div className="w-full relative mb-0.5">
      <div className="flex flex-col">
        <button
          onClick={toggleExpanded}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors duration-200 ${
            isError
              ? 'bg-red-50 border-red-200 hover:bg-red-100 text-red-800'
              : 'bg-[hsl(var(--thinking-bubble-bg))] border-[hsl(var(--thinking-bubble-border))] hover:bg-[hsl(var(--thinking-bubble-hover-bg))] text-[hsl(var(--thinking-bubble-text))]'
          }`}
        >
          <div className="flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            {isA2A && <Bot className="h-3 w-3 text-purple-500" />}
            {isMCP && <Wrench className="h-3 w-3 text-blue-500" />}
            {isError ? (
              <XCircle className="h-3 w-3 text-red-500" />
            ) : (
              <CheckCircle className="h-3 w-3 text-green-500" />
            )}
          </div>
          <span>
            {toolName ? `${toolName} Response` : 'Tool Response'}
            {isA2A && (
              <span className="ml-1 text-xs px-1 py-0.5 bg-purple-100 text-purple-800 rounded">
                A2A
              </span>
            )}
            {isMCP && (
              <span className="ml-1 text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded">
                MCP
              </span>
            )}
            {isError && (
              <span className="ml-1 text-xs px-1 py-0.5 bg-red-100 text-red-800 rounded">
                Error
              </span>
            )}
          </span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {isExpanded && (
        <div
          className={`mt-1 mb-1 rounded-lg p-4 shadow-sm transition-all ${
            isError
              ? 'bg-red-50 border border-red-200'
              : 'bg-[hsl(var(--thinking-bubble-content-bg))] border border-[hsl(var(--thinking-bubble-content-border))]'
          }`}
        >
          <div className="space-y-2">
            {isA2A && !isError && (
              <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                A2A Tool executed successfully
              </div>
            )}
            {isMCP && !isError && (
              <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                MCP Tool executed successfully
              </div>
            )}

            <div className="overflow-x-auto">
              {(isMCP || isA2A) && formattedResponse && !formattedResponse.startsWith('{') ? (
                <div className="text-sm whitespace-pre-wrap font-mono bg-[hsl(var(--thinking-bubble-bg))] p-3 rounded border">
                  {formattedResponse}
                </div>
              ) : (
                <CodeBlock className="language-json text-xs">{formattedResponse}</CodeBlock>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
