'use client';

import { SendHorizonal, Plus, Circle, SquareArrowUp, RotateCcw } from 'lucide-react';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface InputAreaProps {
  inputValue: string;
  isLoading: boolean;
  selectedModel: string;
  tokenUsage: SchemaCompletionUsage;
  onInputChangeAction: (value: string) => void;
  onKeyDownAction: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessageAction: () => void;
  onResendLastMessageAction?: () => void;
}

export function InputArea({
  inputValue,
  isLoading,
  selectedModel,
  tokenUsage,
  onInputChangeAction,
  onKeyDownAction,
  onSendMessageAction,
  onResendLastMessageAction,
}: InputAreaProps) {
  return (
    <div className="py-4">
      <div className="w-full">
        <div className="mb-2 text-xs text-chat-input-text-muted flex justify-between">
          <div>
            {onResendLastMessageAction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResendLastMessageAction}
                className="text-xs text-chat-input-text-muted hover:text-chat-input-text"
                title="Resend last message"
                data-testid="resend-message-button"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div>
            <span className="mr-2">Tokens: {tokenUsage.total_tokens || 0}</span>
            <span>
              ({tokenUsage.prompt_tokens || 0} prompt / {tokenUsage.completion_tokens || 0}{' '}
              completion)
            </span>
          </div>
        </div>
        <div className="relative rounded-xl bg-chat-input-bg border border-chat-input-border shadow-lg">
          <textarea
            value={inputValue}
            onChange={e => onInputChangeAction(e.target.value)}
            onKeyDown={onKeyDownAction}
            placeholder="Ask anything"
            rows={1}
            disabled={isLoading || !selectedModel}
            className={cn(
              'w-full min-h-[44px] max-h-[200px] py-3 px-14',
              'bg-transparent text-chat-input-text resize-none',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-chat-input-placeholder'
            )}
            aria-label="Message input"
            data-testid="mock-input"
          />

          <div className="absolute left-3 bottom-3 flex gap-1.5">
            <button className="text-chat-input-text-muted hover:text-chat-input-text p-1">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute right-3 bottom-2 flex items-center gap-1">
            <button className="text-chat-input-text-muted hover:text-chat-input-text p-1">
              <Circle className="h-4 w-4" />
            </button>

            <button
              onClick={onSendMessageAction}
              disabled={!inputValue.trim() || isLoading || !selectedModel}
              className={cn(
                'p-1.5 rounded-md',
                'text-chat-input-text-muted hover:bg-chat-input-hover-bg hover:text-chat-input-text',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
              aria-label="Send message"
              data-testid="mock-send-button"
            >
              {inputValue.trim() ? (
                <SendHorizonal className="h-4 w-4" />
              ) : (
                <SquareArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
