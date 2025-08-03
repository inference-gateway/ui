import { ChatCompletionToolType, SchemaChatCompletionTool } from '@inference-gateway/sdk';
import logger from './logger';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  error?: string;
}

interface PageContent {
  title: string;
  url: string;
  content: string;
  error?: string;
}

// Note: BUILTIN_TOOLS kept for potential future use, currently not needed for prefix-based detection
// const BUILTIN_TOOLS = ['web_search', 'fetch_page'];

/**
 * Centralized function to detect if a tool is an A2A (Agent-to-Agent) tool
 * Uses prefix-based detection for tools starting with "a2a_"
 * @param toolName - The name of the tool to check
 * @returns true if the tool is an A2A tool, false otherwise
 */
export const isA2ATool = (toolName: string): boolean => {
  return toolName.startsWith('a2a_');
};

/**
 * Centralized function to detect if a tool is an MCP tool
 * Uses prefix-based detection for tools starting with "mcp_"
 * @param toolName - The name of the tool to check
 * @param tools - Optional array of available tools (deprecated, kept for backward compatibility)
 * @returns true if the tool is an MCP tool, false otherwise
 */
export const isMCPTool = (toolName: string, _tools?: SchemaChatCompletionTool[]): boolean => {
  return toolName.startsWith('mcp_');
};

export const WebSearchTool: SchemaChatCompletionTool = {
  type: 'function' as ChatCompletionToolType,
  function: {
    name: 'web_search',
    description: 'Search the web for information.',
    strict: false,
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
      additionalProperties: false,
    },
  },
};

export const FetchPageTool: SchemaChatCompletionTool = {
  type: 'function' as ChatCompletionToolType,
  function: {
    name: 'fetch_page',
    description: 'Fetch content from a specific URL.',
    strict: false,
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to fetch content from.',
        },
      } as unknown as Record<string, never>,
      required: ['url'],
      additionalProperties: false,
    },
  },
};

export const ToolHandlers: Record<
  string,
  { call: (args: Record<string, unknown>) => Promise<unknown> }
> = {
  web_search: {
    call: async function (args: Record<string, unknown>): Promise<unknown> {
      const query = args.query as string;
      const limit = (args.limit as number) || 5;

      logger.debug('Web search query:', query);
      logger.debug('Limit:', limit);

      try {
        const url = new URL('/api/v1/tools/search', window.location.origin);
        url.searchParams.append('query', query);
        url.searchParams.append('limit', limit.toString());

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Search request failed with status: ${response.status}`);
        }

        const data = await response.json();
        logger.debug('Search API response:', response.status);

        return {
          query,
          results: (data.results as SearchResult[]) || [],
        };
      } catch (error) {
        logger.error('Error during web search:', error);
        return {
          query,
          error: 'Failed to fetch search results',
          results: [],
        };
      }
    },
  },
  fetch_page: {
    call: async function (args: Record<string, unknown>): Promise<unknown> {
      const url = args.url as string;

      logger.debug('Fetching page content from:', url);

      try {
        const apiUrl = new URL('/api/v1/tools/fetch-page', window.location.origin);
        apiUrl.searchParams.append('url', url);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Page fetch request failed with status: ${response.status}`);
        }

        const data = await response.json();
        logger.debug('Fetch page API response status:', response.status);

        return {
          query: {
            url,
          },
          results: {
            title: data.title || '',
            content: data.content || '',
          } as PageContent,
        };
      } catch (error) {
        logger.error('Error during page fetching:', error);
        return {
          query: {
            url,
          },
          error: 'Failed to fetch page content',
          results: {
            title: '',
            content: '',
          } as PageContent,
        };
      }
    },
  },
};
