'use client';

import { SchemaCompletionUsage } from '@inference-gateway/sdk';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface TokenUsageProps {
  tokenUsage: SchemaCompletionUsage;
  className?: string;
  showDetailedBreakdown?: boolean;
}

export function TokenUsage({
  tokenUsage,
  className,
  showDetailedBreakdown = true,
}: TokenUsageProps) {
  const isMobile = useIsMobile();
  const { prompt_tokens = 0, completion_tokens = 0, total_tokens = 0 } = tokenUsage;

  return (
    <div className={cn('text-xs text-chat-input-text-muted', className)}>
      <span className="mr-2">Tokens: {total_tokens}</span>
      {showDetailedBreakdown && !isMobile && (
        <span>
          ({prompt_tokens} prompt / {completion_tokens} completion)
        </span>
      )}
    </div>
  );
}
