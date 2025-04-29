'use client';

import { SendHorizonal, Plus, Globe, Mic, MoreHorizontal, X } from 'lucide-react';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRef, useState, useEffect } from 'react';
import { TokenUsage } from './token-usage';

interface InputAreaProps {
  isLoading: boolean;
  selectedModel: string;
  tokenUsage: SchemaCompletionUsage;
  onSendMessageAction: (message: string) => void;
  onClearChatAction?: () => void;
  onSearchAction?: () => void;
  onDeepResearchAction?: () => void;
  isSearchActive?: boolean;
  isDeepResearchActive?: boolean;
  editingMessageId?: string | null;
  editMessageContent?: string;
  onCancelEdit?: () => void;
  onEditLastUserMessage?: () => void;
}

export function InputArea({
  isLoading,
  selectedModel,
  tokenUsage,
  onSendMessageAction,
  onClearChatAction,
  onSearchAction,
  onDeepResearchAction,
  isSearchActive = false,
  isDeepResearchActive = false,
  editingMessageId = null,
  editMessageContent = '',
  onCancelEdit,
  onEditLastUserMessage,
}: InputAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      (
        textareaRef.current as HTMLTextAreaElement & { setInputValue: (value: string) => void }
      ).setInputValue = setInputValue;
    }
  }, []);

  useEffect(() => {
    if (editingMessageId && editMessageContent) {
      setInputValue(editMessageContent);
    }
  }, [editingMessageId, editMessageContent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape' && editingMessageId && onCancelEdit) {
      e.preventDefault();
      onCancelEdit();
    } else if (e.key === 'ArrowUp' && !inputValue.trim() && !editingMessageId) {
      e.preventDefault();
      onEditLastUserMessage?.();
    }
  };

  const processCommand = (input: string) => {
    const trimmedInput = input.trim();

    if (trimmedInput === '/clear' || trimmedInput === '/reset') {
      if (onClearChatAction) {
        onClearChatAction();
        return true;
      }
    }

    return false;
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading && selectedModel) {
      if (inputValue.startsWith('/')) {
        const isCommand = processCommand(inputValue);
        if (isCommand) {
          setInputValue('');
          return;
        }
      }

      onSendMessageAction(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={cn('py-4', isMobile && 'pb-6')}>
      <div className="w-full">
        <div className="mb-2 flex justify-between">
          <TokenUsage tokenUsage={tokenUsage} />
          {editingMessageId && (
            <div className="text-blue-500 font-medium flex items-center text-xs">
              <span>Editing message</span>
              {onCancelEdit && (
                <button
                  onClick={onCancelEdit}
                  className="ml-2 hover:text-blue-700"
                  aria-label="Cancel editing"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="relative rounded-xl bg-chat-input-bg border border-chat-input-border shadow-lg">
          <div className={cn('pb-10', isMobile && 'pb-11')}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                editingMessageId ? 'Edit your message...' : 'Ask anything or type / for commands'
              }
              rows={2}
              disabled={isLoading || !selectedModel}
              className={cn(
                'w-full py-3 px-14 resize-none',
                'min-h-[55px] max-h-[120px]',
                'bg-transparent text-chat-input-text',
                'focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'placeholder:text-chat-input-placeholder',
                editingMessageId && 'border-l-2 border-blue-500'
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
              {!editingMessageId && (
                <>
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
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {!editingMessageId && (
                <>
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
                </>
              )}

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
      <div className="mt-2 text-xs text-[hsl(var(--chat-footer-subtext))] dark:text-gray-400">
        <span>Try typing a message or commands like /clear or /reset</span>
      </div>
    </div>
  );
}
