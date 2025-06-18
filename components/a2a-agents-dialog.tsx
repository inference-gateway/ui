'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RefreshCw,
  Bot,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Info,
  Clock,
} from 'lucide-react';
import type { A2AAgent, A2ASkill } from '@/types/a2a';

interface A2AAgentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: A2AAgent[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function A2AAgentsDialog({
  open,
  onOpenChange,
  agents,
  isLoading,
  error,
  onRefresh,
}: A2AAgentsDialogProps) {
  const [selectedAgent, setSelectedAgent] = useState<A2AAgent | null>(null);

  const availableAgents = agents.filter(agent => agent.status === 'available');
  const unavailableAgents = agents.filter(agent => agent.status !== 'available');

  const getStatusIcon = (status: A2AAgent['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: A2AAgent['status']) => {
    switch (status) {
      case 'available':
        return 'default' as const;
      case 'unavailable':
        return 'destructive' as const;
      case 'error':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <DialogTitle>A2A Agents</DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <DialogDescription>
            Agent-to-Agent communication endpoints for distributed AI workflows.
            {agents.length > 0 && (
              <span className="ml-2">
                {availableAgents.length} available, {unavailableAgents.length} unavailable
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[60vh]">
          {/* Agent List */}
          <div className="flex-1">
            <ScrollArea className="h-full">
              {error && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {agents.length === 0 && !isLoading && !error && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No A2A agents configured</p>
                  <p className="text-sm">Configure agents to enable Agent-to-Agent communication</p>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin opacity-50" />
                  <p>Loading A2A agents...</p>
                </div>
              )}

              <div className="space-y-3">
                {availableAgents.map(agent => (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(agent.status)}
                          <Badge variant={getStatusBadgeVariant(agent.status)} className="text-xs">
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-xs line-clamp-2">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{agent.capabilities?.skills?.length || 0} capabilities</span>
                        <span>v{agent.version}</span>
                        {agent.lastUpdated && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(agent.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {unavailableAgents.length > 0 && availableAgents.length > 0 && (
                  <Separator className="my-4" />
                )}

                {unavailableAgents.map(agent => (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 opacity-60 ${
                      selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(agent.status)}
                          <Badge variant={getStatusBadgeVariant(agent.status)} className="text-xs">
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-xs line-clamp-2">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{agent.capabilities?.skills?.length || 0} capabilities</span>
                        <span>v{agent.version}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Agent Details */}
          {selectedAgent && (
            <>
              <Separator orientation="vertical" />
              <div className="flex-1">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{selectedAgent.name}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedAgent.status)}
                          <Badge variant={getStatusBadgeVariant(selectedAgent.status)}>
                            {selectedAgent.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Version:</span> {selectedAgent.version}
                      </div>
                      {selectedAgent.author && (
                        <div>
                          <span className="font-medium">Author:</span> {selectedAgent.author}
                        </div>
                      )}
                      {selectedAgent.license && (
                        <div>
                          <span className="font-medium">License:</span> {selectedAgent.license}
                        </div>
                      )}
                      {selectedAgent.homepage && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Homepage:</span>
                          <a
                            href={selectedAgent.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Link
                          </a>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Capabilities ({selectedAgent.capabilities?.skills?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {(selectedAgent.capabilities?.skills || []).map(
                          (skill: A2ASkill, index: number) => (
                            <Card key={index}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{skill.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {skill.description}
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          )
                        )}
                      </div>
                    </div>

                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3">Agent URL</h4>
                      <div className="bg-muted/50 p-2 rounded">
                        <code className="text-xs">{selectedAgent.url}</code>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
