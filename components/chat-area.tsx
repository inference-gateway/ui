'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ThinkingBubble from '@/components/thinking-bubble';
import ToolCallBubble from '@/components/tool-call-bubble';
import ToolResponseBubble from '@/components/tool-response-bubble';
import RequestBubble from '@/components/request-bubble';
import type { Message } from '@/types/chat';
import { CodeBlock } from '@/components/code-block';
import { cn } from '@/lib/utils';

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  selectedModel?: string;
}

export function ChatArea({ messages, isStreaming, selectedModel }: ChatAreaProps) {
  const [streamedTokens, setStreamedTokens] = useState<string>('');
  const [streamedMessageIds, setStreamedMessageIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isStreaming) {
      setStreamedTokens('');
    }
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role !== 'user') {
        setStreamedMessageIds(prev => {
          const updated = new Set(prev);
          updated.add(lastMessage.id);
          return updated;
        });
      }
    }
  }, [isStreaming, messages]);

  const getToolNameForResponse = (toolCallId: string | undefined): string | undefined => {
    if (!toolCallId) return undefined;

    for (const msg of messages) {
      if (msg.tool_calls) {
        for (const toolCall of msg.tool_calls) {
          if (toolCall.id === toolCallId) {
            return toolCall.function.name;
          }
        }
      }
    }
    return undefined;
  };

  const createRequestObject = (message: Message, index: number) => {
    const messageHistory = messages.slice(0, index + 1).map(msg => ({
      role: msg.role,
      content: msg.content || '',
      ...(msg.tool_call_id && { tool_call_id: msg.tool_call_id }),
    }));

    const getFullUrl = () => {
      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        return `${origin}/api/v1/chat/completions`;
      }
      return '/api/v1/chat/completions';
    };

    return {
      method: 'POST',
      url: getFullUrl(),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: {
        model: message.model || selectedModel || 'default-model',
        messages: messageHistory,
        stream: true,
      },
    };
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className={cn('mx-auto max-w-2xl px-4', messages.length > 0 ? 'py-6' : 'py-2')}>
        {messages.length > 0 ? (
          <div className="flex flex-col space-y-4 pb-14">
            {messages.map((message, index) => {
              const isUser = message.role === 'user';
              const showReasoning = !isUser && message.reasoning_content;
              const showToolCalls = !isUser && message.tool_calls;
              const showToolResponse = message.role === 'tool' && message.content;
              const isLastMessage = index === messages.length - 1;
              const wasStreamed = streamedMessageIds.has(message.id);
              const showThinking =
                !isUser && (showReasoning || (isLastMessage && isStreaming) || wasStreamed);

              const isThinkingModel = !!message.reasoning_content;
              const toolName = getToolNameForResponse(message.tool_call_id);

              if (message.role === 'tool' && !message.content) {
                return null;
              }

              return (
                <div key={`${message.role + message.id}`} className="flex flex-col">
                  <div className={cn('w-full flex flex-col', isUser ? 'items-end' : 'items-start')}>
                    {isStreaming && isLastMessage && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="h-2 w-2 rounded-full bg-[hsl(var(--chat-typing-indicator))] animate-pulse"></div>
                        <div className="h-2 w-2 rounded-full bg-[hsl(var(--chat-typing-indicator))] animate-pulse delay-150"></div>
                        <div className="h-2 w-2 rounded-full bg-[hsl(var(--chat-typing-indicator))] animate-pulse delay-300"></div>
                      </div>
                    )}
                    {showThinking && (
                      <div className="mb-1">
                        <ThinkingBubble
                          content={message.reasoning_content || ''}
                          isVisible={!!showThinking}
                          isStreaming={isLastMessage && isStreaming}
                          streamTokens={streamedTokens}
                          isThinkingModel={isThinkingModel}
                        />
                      </div>
                    )}
                    {showToolCalls && (
                      <div className="mb-1 w-full">
                        <ToolCallBubble toolCalls={message.tool_calls} />
                      </div>
                    )}
                    {showToolResponse && (
                      <div className="mb-1 w-full">
                        <ToolResponseBubble response={message.content} toolName={toolName} />
                      </div>
                    )}

                    {isUser && (
                      <div className="mb-1 w-full">
                        <RequestBubble request={createRequestObject(message, index)} />
                      </div>
                    )}

                    {(isUser ||
                      (message.role === 'assistant' &&
                        message.content &&
                        !message.tool_call_id)) && (
                      <div
                        className={cn(
                          'rounded-lg px-4 py-3',
                          isUser
                            ? 'bg-[hsl(var(--chat-user-message-bg))] text-[hsl(var(--chat-user-message-text))]'
                            : 'bg-[hsl(var(--chat-ai-message-bg))] text-[hsl(var(--chat-ai-message-text))]',
                          'max-w-[85%]'
                        )}
                      >
                        {isUser ? (
                          <div>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        ) : (
                          <div>
                            <div className="prose prose-invert max-w-none">
                              <ReactMarkdown
                                components={{
                                  code: CodeBlock,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-350px)]">
            <div className="text-center mb-32">
              <h3 className="text-2xl font-normal text-[hsl(var(--chat-empty-title-text))]">
                Start a conversation
              </h3>
              <p className="text-[hsl(var(--chat-empty-desc-text))] mt-2">
                Type a message to begin chatting with the AI assistant
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
