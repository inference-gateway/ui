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
      const limit = args.limit as number | undefined;
      return new Promise(resolve => {
        logger.debug('Web search query:', query);
        logger.debug('Limit:', limit);

        // Mock search results for now
        setTimeout(() => {
          const results = {
            query,
            results: [
              { title: 'Result 1', url: 'http://example.com/1' },
              { title: 'Result 2', url: 'http://example.com/2' },
              { title: 'Result 3', url: 'http://example.com/3' },
            ],
          };
          resolve(JSON.stringify(results) as unknown as JSON);
        }, 1000);
      });
    },
  },
};
