export interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content?: string;
  reasoning_content?: string;
}

export interface CreateChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
}

export interface CreateChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string | null;
  }>;
  usage?: CompletionUsage;
  prompt_tokens_details?: CompletionPromptTokensDetails;
}

export interface CompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  queue_time?: number;
  prompt_time?: number;
  completion_time?: number;
  total_time?: number;
}

export interface CompletionPromptTokensDetails {
  cached_tokens: number;
  prompt_cache_hit_tokens: number;
  prompt_cache_miss_tokens: number;
}

export interface CreateChatCompletionStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  service_tier?: string;
  system_fingerprint?: string;
  choices: Array<{
    index: number;
    delta: Message;
    finish_reason: string | null;
  }>;
  usage?: CompletionUsage;
  prompt_tokens_details?: CompletionPromptTokensDetails;
}
