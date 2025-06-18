/**
 * A2A (Agent-to-Agent) types for the Inference Gateway UI
 * Based on the actual Inference Gateway API response format
 */

export interface A2AAgent {
  id: string;
  name: string;
  description: string;
  url: string;
  status?: 'available' | 'unavailable' | 'error';
  lastUpdated?: string;
  capabilities?: A2ACapabilities;
  endpoints?: A2AEndpoint[];
  version?: string;
  author?: string;
  homepage?: string;
  license?: string;
}

export interface A2ACapabilities {
  skills: A2ASkill[];
}

export interface A2ASkill {
  id: string;
  name: string;
  description: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
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
  data: A2AAgent[];
  object: string;
}

export interface A2AAgentDetails {
  agent: A2AAgent;
  health_status: 'healthy' | 'unhealthy' | 'unknown';
  response_time_ms?: number;
  last_health_check?: string;
}
