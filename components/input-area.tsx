'use client';

import { SendHorizonal, Plus, Circle, SquareArrowUp } from 'lucide-react';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';
import { cn } from '@/lib/utils';

interface InputAreaProps {
  inputValue: string;
  isLoading: boolean;
  selectedModel: string;
  tokenUsage: SchemaCompletionUsage;
  onInputChangeAction: (value: string) => void;
  onKeyDownAction: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessageAction: () => void;
}

export function InputArea({
  inputValue,
  isLoading,
  selectedModel,
  tokenUsage,
  onInputChangeAction,
  onKeyDownAction,
  onSendMessageAction,
}: InputAreaProps) {
  return (
    <div className="py-4">
      <div className="w-full">
        <div className="mb-2 text-xs text-gray-400 flex justify-end">
          <span className="mr-2">Tokens: {tokenUsage.total_tokens || 0}</span>
          <span>
            ({tokenUsage.prompt_tokens || 0} prompt / {tokenUsage.completion_tokens || 0}{' '}
            completion)
          </span>
        </div>
        <div className="relative rounded-xl bg-[#202123] border border-[#3e3f44] shadow-lg">
          <textarea
            value={inputValue}
            onChange={e => onInputChangeAction(e.target.value)}
            onKeyDown={onKeyDownAction}
            placeholder="Ask anything"
            rows={1}
            disabled={isLoading || !selectedModel}
            className={cn(
              'w-full min-h-[44px] max-h-[200px] py-3 px-14',
              'bg-transparent text-white resize-none',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-gray-500'
            )}
            aria-label="Message input"
            data-testid="mock-input"
          />

          <div className="absolute left-3 bottom-3 flex gap-1.5">
            <button className="text-gray-400 hover:text-gray-300 p-1">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute right-3 bottom-2 flex items-center gap-1">
            <button className="text-gray-400 hover:text-gray-300 p-1">
              <Circle className="h-4 w-4" />
            </button>

            <button
              onClick={onSendMessageAction}
              disabled={!inputValue.trim() || isLoading || !selectedModel}
              className={cn(
                'p-1.5 rounded-md',
                'text-gray-400 hover:bg-gray-700 hover:text-gray-300',
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
