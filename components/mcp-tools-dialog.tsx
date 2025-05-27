import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Search, Wrench, AlertCircle, RefreshCw, X } from 'lucide-react';
import { fetchMCPTools } from '@/lib/api';
import type { MCPTool } from '@/types/mcp';

interface MCPToolsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MCPToolsDialog({ open, onOpenChange }: MCPToolsDialogProps) {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const loadTools = useCallback(async () => {
    if (!open) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchMCPTools();
      setTools(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tools');
    } finally {
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const filteredTools = tools.filter(
    tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderToolSchema = (schema: Record<string, unknown>) => {
    return (
      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
        {JSON.stringify(schema, null, 2)}
      </pre>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            MCP Tools
            {!loading && !error && (
              <Badge variant="secondary" className="ml-2">
                {filteredTools.length} tools available
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Available Model Context Protocol (MCP) tools from connected servers.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading MCP tools...</span>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="text-center">
                  <p className="font-medium">Error loading MCP tools</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
                <Button onClick={loadTools} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}

            {!loading && !error && tools.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Wrench className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">No MCP tools available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect MCP servers to see available tools here.
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && tools.length > 0 && (
              <div className="space-y-3">
                {filteredTools.map(tool => (
                  <Card key={tool.name}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-medium">{tool.name}</CardTitle>
                          {tool.description && (
                            <CardDescription className="mt-1">{tool.description}</CardDescription>
                          )}
                        </div>

                        {tool.input_schema && (
                          <Collapsible
                            open={expandedTools.has(tool.name)}
                            onOpenChange={open => {
                              if (open) {
                                setExpandedTools(prev => new Set([...prev, tool.name]));
                              } else {
                                setExpandedTools(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(tool.name);
                                  return newSet;
                                });
                              }
                            }}
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={`View schema for ${tool.name}`}
                              >
                                {expandedTools.has(tool.name) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                Schema
                              </Button>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <CardContent className="pt-3">
                                {renderToolSchema(tool.input_schema)}
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}

                {searchQuery && filteredTools.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No tools found matching &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogClose asChild>
          <Button variant="outline" className="self-end">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
