'use client';

import { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  Bot,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Info,
  Clock,
  Zap,
  Bell,
  History,
  Package,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
} from 'lucide-react';
import type { A2AAgent, A2ASkill } from '@/types/a2a';

interface A2AAgentsDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  agents: A2AAgent[];
  isLoading: boolean;
  error: string | null;
  onRefreshAction: () => void;
}

export function A2AAgentsDialog({
  open,
  onOpenChangeAction,
  agents,
  isLoading,
  error,
  onRefreshAction,
}: A2AAgentsDialogProps) {
  const [selectedAgent, setSelectedAgent] = useState<A2AAgent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;

    const query = searchQuery.toLowerCase().trim();
    return agents.filter(
      agent =>
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.skills?.some(
          skill =>
            skill.name.toLowerCase().includes(query) ||
            skill.description.toLowerCase().includes(query)
        )
    );
  }, [agents, searchQuery]);

  const availableAgents = useMemo(() => 
    filteredAgents.filter(agent => agent.status === 'available'),
    [filteredAgents]
  );
  
  const unavailableAgents = useMemo(() => 
    filteredAgents.filter(agent => agent.status !== 'available'),
    [filteredAgents]
  );

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
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
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
              onClick={onRefreshAction}
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

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name, description, or skills..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search A2A agents"
          />
        </div>

        <div className="flex gap-4 h-[60vh]">
          {/* Agent List */}
          <div className="flex-1" role="listbox" aria-label="A2A agents list">
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
                    className={`cursor-pointer transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary ${
                      selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedAgent(agent);
                      }
                    }}
                    tabIndex={0}
                    role="option"
                    aria-selected={selectedAgent?.id === agent.id}
                    aria-label={`Select ${agent.name} agent`}
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
                        <span>{agent.skills?.length || 0} skills</span>
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
                    className={`cursor-pointer transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary opacity-60 ${
                      selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedAgent(agent);
                      }
                    }}
                    tabIndex={0}
                    role="option"
                    aria-selected={selectedAgent?.id === agent.id}
                    aria-label={`Select ${agent.name} agent (unavailable)`}
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
                        <span>{agent.skills?.length || 0} skills</span>
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
                      <p className="text-sm text-muted-foreground mb-3">
                        {selectedAgent.description}
                      </p>

                      {selectedAgent.provider && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-medium">Provider:</span>
                          <a
                            href={selectedAgent.provider.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                            aria-label={`Visit ${selectedAgent.provider.organization} website (opens in new tab)`}
                          >
                            {selectedAgent.provider.organization}
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        </div>
                      )}
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
                            aria-label={`Visit ${selectedAgent.name} homepage (opens in new tab)`}
                          >
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            Link
                          </a>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {selectedAgent.capabilities && (
                      <>
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Capabilities
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Streaming</span>
                              </div>
                              <Badge
                                variant={
                                  selectedAgent.capabilities.streaming ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {selectedAgent.capabilities.streaming ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Push Notifications</span>
                              </div>
                              <Badge
                                variant={
                                  selectedAgent.capabilities.pushNotifications
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {selectedAgent.capabilities.pushNotifications
                                  ? 'Enabled'
                                  : 'Disabled'}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-medium">
                                  State Transition History
                                </span>
                              </div>
                              <Badge
                                variant={
                                  selectedAgent.capabilities.stateTransitionHistory
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {selectedAgent.capabilities.stateTransitionHistory
                                  ? 'Enabled'
                                  : 'Disabled'}
                              </Badge>
                            </div>

                            {selectedAgent.capabilities.extensions &&
                              selectedAgent.capabilities.extensions.length > 0 && (
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-medium">Extensions</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {selectedAgent.capabilities.extensions.length} available
                                  </Badge>
                                </div>
                              )}
                          </div>

                          {(selectedAgent.defaultInputModes &&
                            selectedAgent.defaultInputModes.length > 0) ||
                          (selectedAgent.defaultOutputModes &&
                            selectedAgent.defaultOutputModes.length > 0) ? (
                            <div className="mt-4 grid grid-cols-1 gap-3">
                              {selectedAgent.defaultInputModes &&
                                selectedAgent.defaultInputModes.length > 0 && (
                                  <div className="p-3 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <ArrowRight className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm font-medium">
                                        Default Input Modes
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {selectedAgent.defaultInputModes.map((mode, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {mode}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              {selectedAgent.defaultOutputModes &&
                                selectedAgent.defaultOutputModes.length > 0 && (
                                  <div className="p-3 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <ArrowLeft className="h-4 w-4 text-green-500" />
                                      <span className="text-sm font-medium">
                                        Default Output Modes
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {selectedAgent.defaultOutputModes.map((mode, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {mode}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ) : null}
                        </div>
                        <Separator />
                      </>
                    )}

                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Skills ({selectedAgent.skills?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {(selectedAgent.skills || []).map((skill: A2ASkill, index: number) => (
                          <Card key={skill.id || index} className="border-l-4 border-l-primary/20">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-sm font-medium">
                                    {skill.name}
                                  </CardTitle>
                                  <CardDescription className="text-xs mt-1">
                                    {skill.description}
                                  </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {skill.id}
                                </Badge>
                              </div>

                              {skill.tags && skill.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {skill.tags.map((tag, tagIndex) => (
                                    <Badge
                                      key={tagIndex}
                                      variant="secondary"
                                      className="text-xs px-2 py-0"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {skill.examples && skill.examples.length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-xs font-medium mb-1">Examples:</h5>
                                  <div className="space-y-1">
                                    {skill.examples.slice(0, 3).map((example, exampleIndex) => (
                                      <div
                                        key={exampleIndex}
                                        className="text-xs text-muted-foreground bg-muted/50 p-2 rounded italic"
                                      >
                                        &ldquo;{example}&rdquo;
                                      </div>
                                    ))}
                                    {skill.examples.length > 3 && (
                                      <div className="text-xs text-muted-foreground text-center py-1">
                                        ... and {skill.examples.length - 3} more examples
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                {skill.inputModes && skill.inputModes.length > 0 && (
                                  <div>
                                    <span className="font-medium">Input:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {skill.inputModes.map((mode, modeIndex) => (
                                        <Badge
                                          key={modeIndex}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {mode}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {skill.outputModes && skill.outputModes.length > 0 && (
                                  <div>
                                    <span className="font-medium">Output:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {skill.outputModes.map((mode, modeIndex) => (
                                        <Badge
                                          key={modeIndex}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {mode}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardHeader>
                          </Card>
                        ))}

                        {(!selectedAgent.skills || selectedAgent.skills.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No skills configured for this agent</p>
                          </div>
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
