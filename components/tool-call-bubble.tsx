import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal, Wrench, Bot } from 'lucide-react';
import { SchemaChatCompletionMessageToolCall } from '@inference-gateway/sdk';
import { CodeBlock } from './code-block';
import { isMCPTool, isA2ATool } from '@/lib/tools';

interface ToolCallBubbleProps {
  toolCalls: SchemaChatCompletionMessageToolCall[] | undefined;
}

export default function ToolCallBubble({ toolCalls }: ToolCallBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedToolIds, setExpandedToolIds] = useState<Set<string>>(new Set());

  const toggleExpanded = () => setIsExpanded(prev => !prev);

  const toggleToolExpanded = (toolId: string) => {
    setExpandedToolIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  const hasMCPTools = toolCalls.some(call => isMCPTool(call.function.name));
  const hasA2ATools = toolCalls.some(call => isA2ATool(call.function.name));

  const getToolTypeLabel = () => {
    if (hasA2ATools && hasMCPTools) return 'Tool Calls';
    if (hasA2ATools) return 'A2A Tool Calls';
    if (hasMCPTools) return 'MCP Tool Calls';
    return 'Tool Calls';
  };

  const getToolIcon = () => {
    if (hasA2ATools && hasMCPTools) return <Terminal className="h-3 w-3" />;
    if (hasA2ATools) return <Bot className="h-3 w-3" />;
    if (hasMCPTools) return <Wrench className="h-3 w-3" />;
    return <Terminal className="h-3 w-3" />;
  };

  return (
    <div className="w-full relative mb-0.5">
      <div className="flex flex-col">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[hsl(var(--thinking-bubble-bg))] border border-[hsl(var(--thinking-bubble-border))] hover:bg-[hsl(var(--thinking-bubble-hover-bg))] transition-colors duration-200 text-[hsl(var(--thinking-bubble-text))]"
        >
          {getToolIcon()}
          <span>
            {getToolTypeLabel()} ({toolCalls.length})
          </span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-1 mb-1 space-y-2">
          {toolCalls.map((toolCall, index) => {
            const isToolExpanded = expandedToolIds.has(toolCall.id || `tool-${index}`);
            const isMCP = isMCPTool(toolCall.function.name);
            const isA2A = isA2ATool(toolCall.function.name);

            let parsedArguments: Record<string, unknown> = {};
            try {
              if (typeof toolCall.function.arguments === 'string') {
                parsedArguments = JSON.parse(toolCall.function.arguments);
              } else {
                parsedArguments = toolCall.function.arguments as Record<string, unknown>;
              }
            } catch {
              parsedArguments = { raw: toolCall.function.arguments };
            }

            return (
              <div
                key={toolCall.id || `${toolCall.function.name}-${index}`}
                className="bg-[hsl(var(--thinking-bubble-content-bg))] border border-[hsl(var(--thinking-bubble-content-border))] rounded-lg shadow-sm"
              >
                <button
                  onClick={() =>
                    toggleToolExpanded(toolCall.id || `${toolCall.function.name}-${index}`)
                  }
                  className="w-full flex items-center justify-between p-3 hover:bg-[hsl(var(--thinking-bubble-hover-bg))] transition-colors duration-200"
                >
                  <div className="flex items-center gap-2">
                    {isA2A ? (
                      <Bot className="h-4 w-4 text-purple-500" />
                    ) : isMCP ? (
                      <Wrench className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Terminal className="h-4 w-4" />
                    )}
                    <span className="font-medium text-sm">{toolCall.function.name}</span>
                    {isA2A && (
                      <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                        A2A
                      </span>
                    )}
                    {isMCP && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                        MCP
                      </span>
                    )}
                  </div>
                  {isToolExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {isToolExpanded && (
                  <div className="px-3 pb-3 space-y-3">
                    {toolCall.id && (
                      <div>
                        <span className="text-xs font-medium text-[hsl(var(--thinking-bubble-text))] opacity-70">
                          Call ID:
                        </span>
                        <div className="text-xs font-mono bg-[hsl(var(--thinking-bubble-bg))] px-2 py-1 rounded mt-1">
                          {toolCall.id}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-xs font-medium text-[hsl(var(--thinking-bubble-text))] opacity-70">
                        Arguments:
                      </span>
                      <div className="mt-1">
                        {(isMCP || isA2A) && typeof parsedArguments === 'object' ? (
                          <div className="space-y-1">
                            {Object.entries(parsedArguments).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium">{key}:</span>
                                <span className="ml-2 font-mono bg-[hsl(var(--thinking-bubble-bg))] px-1.5 py-0.5 rounded">
                                  {typeof value === 'string' ? value : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <CodeBlock className="language-json text-xs" data-testid="code-block">
                            {JSON.stringify(parsedArguments, null, 2)}
                          </CodeBlock>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
