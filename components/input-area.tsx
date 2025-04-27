'use client';

import { SendHorizonal, Plus, Globe, Mic, MoreHorizontal } from 'lucide-react';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLayoutEffect, useRef, useState } from 'react';

interface InputAreaProps {
  isLoading: boolean;
  selectedModel: string;
  tokenUsage: SchemaCompletionUsage;
  onSendMessageAction: (message: string) => void;
  onSearchAction?: () => void;
  onDeepResearchAction?: () => void;
  isSearchActive?: boolean;
  isDeepResearchActive?: boolean;
}

export function InputArea({
  isLoading,
  selectedModel,
  tokenUsage,
  onSendMessageAction,
  onSearchAction,
  onDeepResearchAction,
  isSearchActive = false,
  isDeepResearchActive = false,
}: InputAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setTextareaHeight] = useState<number>(0);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';

      const defaultHeight = isMobile ? '58px' : '44px';

      const scrollHeight = inputValue.trim()
        ? Math.min(textareaRef.current.scrollHeight, isMobile ? 150 : 120)
        : parseInt(defaultHeight);

      textareaRef.current.style.height = `${scrollHeight}px`;
      setTextareaHeight(scrollHeight);
    }
  }, [inputValue, isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading && selectedModel) {
      onSendMessageAction(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={cn('py-4', isMobile && 'pb-6')}>
      <div className="w-full">
        <div className="mb-2 text-xs text-chat-input-text-muted flex justify-between">
          <div>
            <span className="mr-2">Tokens: {tokenUsage.total_tokens || 0}</span>
            <span className={cn(isMobile ? 'hidden' : 'inline')}>
              ({tokenUsage.prompt_tokens || 0} prompt / {tokenUsage.completion_tokens || 0}{' '}
              completion)
            </span>
          </div>
        </div>
        <div className="relative rounded-xl bg-chat-input-bg border border-chat-input-border shadow-lg">
          <div className={cn('pb-10', isMobile && 'pb-11')}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              rows={isMobile ? 2 : 1}
              disabled={isLoading || !selectedModel}
              className={cn(
                'w-full py-3 px-14 resize-none',
                'min-h-[44px] max-h-[120px]',
                'bg-transparent text-chat-input-text',
                'focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'placeholder:text-chat-input-placeholder'
              )}
              aria-label="Message input"
              data-testid="mock-input"
            />
          </div>

          <div className="absolute left-3 top-3 flex gap-1.5">
            <button
              className={cn(
                'text-chat-input-text-muted hover:text-chat-input-text',
                isMobile ? 'p-1.5' : 'p-1'
              )}
              aria-label="Add content"
            >
              <Plus className={cn(isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
            </button>
          </div>

          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 flex justify-between items-center px-3 py-2',
              'border-t border-chat-input-border bg-chat-input-bg'
            )}
          >
            <div className="flex-1 flex justify-center items-center">
              <button
                onClick={onSearchAction}
                className={cn(
                  'flex items-center gap-1 rounded-lg mx-1',
                  isMobile ? 'px-3 py-1.5' : 'px-3 py-1',
                  isSearchActive
                    ? 'bg-button-active text-button-active-text font-medium'
                    : 'text-chat-input-text-muted hover:bg-chat-input-hover-bg',
                  'transition-colors text-sm'
                )}
                aria-label="Search"
                data-testid="search-button"
              >
                <Globe className={cn(isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
                <span>Search</span>
              </button>
              <button
                onClick={onDeepResearchAction}
                className={cn(
                  'flex items-center gap-1 rounded-lg mx-1',
                  isMobile ? 'px-3 py-1.5' : 'px-3 py-1',
                  isDeepResearchActive
                    ? 'bg-button-active text-button-active-text font-medium'
                    : 'text-chat-input-text-muted hover:bg-chat-input-hover-bg',
                  'transition-colors text-sm'
                )}
                aria-label="Deep research"
                data-testid="deep-research-button"
              >
                <span>Deep research</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                className={cn(
                  'text-chat-input-text-muted hover:text-chat-input-text',
                  isMobile ? 'p-1.5' : 'p-1'
                )}
                aria-label="Voice input"
                data-testid="mic-button"
              >
                <Mic className={cn(isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
              </button>

              <button
                className={cn(
                  'text-chat-input-text-muted hover:text-chat-input-text',
                  isMobile ? 'p-1.5' : 'p-1'
                )}
                aria-label="More options"
                data-testid="more-options-button"
              >
                <MoreHorizontal className={cn(isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !selectedModel}
                className={cn(
                  isMobile ? 'p-2 rounded-lg' : 'p-1.5 rounded-md',
                  'text-chat-input-text-muted hover:bg-chat-input-hover-bg hover:text-chat-input-text',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors'
                )}
                aria-label="Send message"
                data-testid="mock-send-button"
              >
                <SendHorizonal className={cn(isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
