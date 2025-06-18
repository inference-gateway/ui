/**
 * A2A (Agent-to-Agent) types for the Inference Gateway UI
 */

export interface A2AAgent {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  homepage?: string;
  license?: string;
  capabilities: A2ACapability[];
  endpoints: A2AEndpoint[];
  metadata?: Record<string, unknown>;
  status: 'available' | 'unavailable' | 'error';
  lastUpdated?: string;
}

export interface A2ACapability {
  name: string;
  description: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
}

export interface A2AEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description?: string;
  parameters?: A2AParameter[];
}

export interface A2AParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface A2AAgentsResponse {
  agents: A2AAgent[];
  total_count: number;
  available_count: number;
}

export interface A2AAgentDetails {
  agent: A2AAgent;
  health_status: 'healthy' | 'unhealthy' | 'unknown';
  response_time_ms?: number;
  last_health_check?: string;
}
