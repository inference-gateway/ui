import { SchemaCompletionUsage } from '@inference-gateway/sdk';

/**
 * Generates a unique ID for a new chat
 */
export const createNewChatId = (): string =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

/**
 * Creates an empty token usage object with all counts set to 0
 */
export const createEmptyTokenUsage = (): SchemaCompletionUsage => ({
  prompt_tokens: 0,
  completion_tokens: 0,
  total_tokens: 0,
});
