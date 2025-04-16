'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ThinkingBubble from '@/components/thinking-bubble';
import type { Message } from '@/types/chat';
import { CodeBlock } from '@/components/code-block';
import { cn } from '@/lib/utils';

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
}

export function ChatArea({ messages, isStreaming }: ChatAreaProps) {
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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className={cn('mx-auto max-w-2xl px-4', messages.length > 0 ? 'py-6' : 'py-2')}>
        {messages.length > 0 ? (
          <div className="flex flex-col space-y-4 pb-14">
            {messages.map((message, index) => {
              const isUser = message.role === 'user';
              const showReasoning = !isUser && message.reasoning_content;
              const isLastMessage = index === messages.length - 1;
              const wasStreamed = streamedMessageIds.has(message.id);
              const showThinking =
                !isUser && (showReasoning || (isLastMessage && isStreaming) || wasStreamed);

              const isThinkingModel = !!message.reasoning_content;

              return (
                <div key={`${message.role + message.id}`} className="flex flex-col">
                  <div className={cn('w-full flex flex-col', isUser ? 'items-end' : 'items-start')}>
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

                    <div
                      className={cn(
                        'rounded-lg px-4 py-3',
                        isUser ? 'bg-gray-800 text-gray-200' : 'bg-gray-700 text-gray-200',
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
                            {message.content ? (
                              <ReactMarkdown
                                components={{
                                  code: CodeBlock,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            ) : isStreaming && isLastMessage ? (
                              <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse"></div>
                                <div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse delay-150"></div>
                                <div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse delay-300"></div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-350px)]">
            <div className="text-center mb-32">
              <h3 className="text-2xl font-normal text-gray-200">Start a conversation</h3>
              <p className="text-gray-400 mt-2">
                Type a message to begin chatting with the AI assistant
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
