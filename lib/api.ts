import logger from '@/lib/logger';
import type { ListModelsResponse } from '@/types/model';
import type { ListToolsResponse } from '@/types/mcp';
import type { A2AAgentsResponse, A2AAgentDetails, A2AAgent } from '@/types/a2a';
import { Session } from 'next-auth';

export async function fetchModels(session?: Session): Promise<ListModelsResponse> {
  const headers: Record<string, string> = {};

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch('/api/v1/models', {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchMCPTools(session?: Session): Promise<ListToolsResponse> {
  const headers: Record<string, string> = {};

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch('/api/v1/mcp/tools', {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch MCP tools: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchA2AAgents(
  session?: Session,
  signal?: AbortSignal
): Promise<A2AAgentsResponse> {
  const headers: Record<string, string> = {};

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch('/api/v1/a2a/agents', {
    headers,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch A2A agents: ${response.statusText}`);
  }

  const data = await response.json();

  const transformedAgents = data.data.map((agent: A2AAgent) => ({
    ...agent,
    status: agent.status || 'available', // TODO - get an actual status from the inference gateway, the inference gateway should continuously check the status of the agents

    capabilities: {
      extensions: agent.capabilities?.extensions || [],
      pushNotifications: agent.capabilities?.pushNotifications || false,
      stateTransitionHistory: agent.capabilities?.stateTransitionHistory || false,
      streaming: agent.capabilities?.streaming || false,
    },
    skills: agent.skills || [],
  }));

  return {
    data: transformedAgents,
    object: data.object,
  };
}

export async function fetchA2AAgentDetails(
  agentId: string,
  session?: Session
): Promise<A2AAgentDetails> {
  const headers: Record<string, string> = {};

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`/api/v1/a2a/agents/${agentId}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch A2A agent details: ${response.statusText}`);
  }

  return response.json();
}

type ApiResponse = unknown;
type StreamChunk = Record<string, unknown>;

/**
 * Makes an authenticated API request to the Inference Gateway backend via our Next.js API routes
 * and handles authentication errors automatically
 */
export async function apiFetch<T = ApiResponse>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[API] Error response from ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.message === 'unauthorized') {
      throw error;
    }

    logger.error(`[API] Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Makes a streaming API request to the Inference Gateway backend
 * and handles authentication errors automatically
 */
export async function apiStreamFetch(
  endpoint: string,
  body: Record<string, unknown>,
  options: {
    onChunk?: (chunk: StreamChunk) => void;
    onError?: (error: Error | unknown) => void;
    onFinish?: () => void;
  } = {}
): Promise<void> {
  const { onChunk, onError, onFinish } = options;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ ...body, stream: true }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[API] Error streaming response from ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      if (onError) {
        onError(
          new Error(`API streaming request failed: ${response.status} ${response.statusText}`)
        );
      }
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      if (onError) {
        onError(new Error('No readable stream available'));
      }
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            if (onFinish) onFinish();
            return;
          }

          try {
            const parsedData = JSON.parse(data);
            if (onChunk) onChunk(parsedData);
          } catch (error) {
            logger.error('[API] Error parsing stream chunk:', error);
          }
        }
      }
    }

    if (onFinish) onFinish();
  } catch (error) {
    logger.error(`[API] Error in stream fetch to ${endpoint}:`, error);
    if (onError) {
      onError(error);
    }
  }
}
