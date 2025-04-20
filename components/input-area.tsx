'use client';

import { SendHorizonal, Plus, Globe, Mic, MoreHorizontal } from 'lucide-react';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useRef, useState } from 'react';

interface InputAreaProps {
  inputValue: string;
  isLoading: boolean;
  selectedModel: string;
  tokenUsage: SchemaCompletionUsage;
  onInputChangeAction: (value: string) => void;
  onKeyDownAction: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessageAction: () => void;
  onSearchAction?: () => void;
  onDeepResearchAction?: () => void;
  isSearchActive?: boolean;
  isDeepResearchActive?: boolean;
}

export function InputArea({
  inputValue,
  isLoading,
  selectedModel,
  tokenUsage,
  onInputChangeAction,
  onKeyDownAction,
  onSendMessageAction,
  onSearchAction,
  onDeepResearchAction,
  isSearchActive = false,
  isDeepResearchActive = false,
}: InputAreaProps) {
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setTextareaHeight] = useState<number>(0);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';

      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;

      setTextareaHeight(scrollHeight);
    }
  }, [inputValue]);

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
          {/* Main textarea */}
          <div className="pb-12">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => onInputChangeAction(e.target.value)}
              onKeyDown={onKeyDownAction}
              placeholder="Ask anything"
              rows={isMobile ? 2 : 1}
              disabled={isLoading || !selectedModel}
              className={cn(
                'w-full py-3 px-14 resize-none',
                'min-h-[44px] max-h-[200px]',
                'bg-transparent text-chat-input-text',
                'focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'placeholder:text-chat-input-placeholder'
              )}
              aria-label="Message input"
              data-testid="mock-input"
            />
          </div>

          {/* Plus button on the left */}
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

          {/* Bottom buttons container - fixed position at the bottom */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 flex justify-between items-center px-3 py-2',
              'border-t border-chat-input-border bg-chat-input-bg'
            )}
          >
            {/* Search and Deep Research Buttons - centered */}
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

            {/* Right-aligned buttons */}
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
                onClick={onSendMessageAction}
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
