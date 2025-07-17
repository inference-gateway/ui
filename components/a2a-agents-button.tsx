'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Loader2 } from 'lucide-react';
import { fetchA2AAgents } from '@/lib/api';
import { A2AAgentsDialog } from './a2a-agents-dialog';
import { A2AErrorBoundary } from './a2a-error-boundary';
import type { A2AAgent } from '@/types/a2a';

export function A2AAgentsButton() {
  const [agents, setAgents] = useState<A2AAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const availableAgents = agents.filter(agent => agent.status === 'available');

  const loadAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchA2AAgents();
      setAgents(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load A2A agents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleClick = () => {
    setDialogOpen(true);
  };

  return (
    <A2AErrorBoundary>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className="h-8 gap-2"
        title={
          error
            ? `Error loading A2A agents: ${error}`
            : `${availableAgents.length} A2A agent${availableAgents.length === 1 ? '' : 's'} available`
        }
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
        <span className="text-sm">A2A</span>
        {!isLoading && !error && (
          <Badge variant={availableAgents.length > 0 ? 'default' : 'secondary'} className="ml-1">
            {availableAgents.length}
          </Badge>
        )}
      </Button>

      <A2AAgentsDialog
        open={dialogOpen}
        onOpenChangeAction={setDialogOpen}
        agents={agents}
        isLoading={isLoading}
        error={error}
        onRefreshAction={loadAgents}
      />
    </A2AErrorBoundary>
  );
}
