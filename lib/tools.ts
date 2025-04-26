import logger from './logger';

export const WebSearchTool = {
  type: 'function',
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
      } as unknown as Record<string, never>,
      required: ['query'],
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
      return new Promise(resolve => {
        logger.debug('Web search query:', query);
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
