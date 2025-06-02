'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MCPToolsDialog } from './mcp-tools-dialog';
import { fetchMCPTools } from '@/lib/api';

interface MCPToolsButtonProps {
  className?: string;
  isMobile?: boolean;
}

export function MCPToolsButton({ className, isMobile = false }: MCPToolsButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toolsCount, setToolsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadToolsCount = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchMCPTools();
      setToolsCount(response.data?.length || 0);
    } catch {
      setToolsCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToolsCount();
  }, [loadToolsCount]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        loadToolsCount();
      }
    },
    [loadToolsCount]
  );

  const handleButtonClick = useCallback(() => {
    if (toolsCount === 0) {
      return;
    }
    setDialogOpen(true);
  }, [toolsCount]);

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={cn(
          'flex items-center gap-1 rounded-lg mx-1',
          isMobile ? 'px-3 py-1.5' : 'px-3 py-1',
          'text-chat-input-text-muted hover:bg-chat-input-hover-bg',
          'transition-colors text-sm',
          toolsCount === 0 && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label="MCP Tools"
        data-testid="mcp-tools-button"
        disabled={toolsCount === 0}
      >
        <Wrench className={cn(isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
        <span>Tools</span>
        {!loading && toolsCount !== null && (
          <span
            className={cn(
              'ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium',
              'min-w-[1.25rem] h-5 flex items-center justify-center',
              'text-muted-foreground'
            )}
          >
            {toolsCount}
          </span>
        )}
      </button>

      <MCPToolsDialog open={dialogOpen} onOpenChange={handleDialogOpenChange} />
    </>
  );
}
