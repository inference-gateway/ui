import { ChatCompletionToolType, SchemaChatCompletionTool } from '@inference-gateway/sdk';
import logger from './logger';

export const WebSearchTool: SchemaChatCompletionTool = {
  type: 'function' as ChatCompletionToolType,
  function: {
    name: 'web_search',
    description: 'Search the web for information.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query.',
        },
        limit: {
          type: 'number',
          description: 'The maximum number of results to return.',
        },
      } as unknown as Record<string, never>,
      required: ['query'],
      // additionalProperties: false, // TODO - Implement this field in the SDK and the inference-gateway (openai/o1-mini rejects the request if it's not there)
    },
  },
};

export const ToolHandlers: Record<
  string,
  { call: (args: Record<string, unknown>) => Promise<JSON> }
> = {
  web_search: {
    call: async function (args: Record<string, unknown>): Promise<JSON> {
      const query = args.query as string;
      const limit = (args.limit as number) || 5;

      logger.debug('Web search query:', query);
      logger.debug('Limit:', limit);

      try {
        const url = new URL('/api/v1/tools/search', window.location.origin);
        url.searchParams.append('query', query);
        url.searchParams.append('limit', limit.toString());

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Search request failed with status: ${response.status}`);
        }

        const data = await response.json();
        logger.debug('Search API response:', response.status);

        return JSON.stringify(data) as unknown as JSON;
      } catch (error) {
        logger.error('Error during web search:', error);
        return JSON.stringify({
          query,
          error: 'Failed to fetch search results',
          results: [],
        }) as unknown as JSON;
      }
    },
  },
};
