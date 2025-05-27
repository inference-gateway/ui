/**
 * @jest-environment node
 */
import { GET } from '@/app/api/v1/mcp/tools/route';
import { auth } from '@/lib/auth';
import { InferenceGatewayClient } from '@inference-gateway/sdk';
import { ListToolsResponse } from '@/types/mcp';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));
jest.mock('@inference-gateway/sdk');
jest.mock('@/lib/logger', () => ({
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockInferenceGatewayClient = InferenceGatewayClient as jest.MockedClass<
  typeof InferenceGatewayClient
>;

describe('/api/v1/mcp/tools GET', () => {
  let mockClient: jest.Mocked<InferenceGatewayClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      listTools: jest.fn(),
    } as unknown as jest.Mocked<InferenceGatewayClient>;
    mockInferenceGatewayClient.mockImplementation(() => mockClient);
  });

  afterEach(() => {
    delete process.env.ENABLE_AUTH;
    delete process.env.INFERENCE_GATEWAY_URL;
  });

  describe('authentication', () => {
    it('should require authentication when ENABLE_AUTH is true', async () => {
      process.env.ENABLE_AUTH = 'true';
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should allow access when ENABLE_AUTH is false', async () => {
      process.env.ENABLE_AUTH = 'false';
      process.env.INFERENCE_GATEWAY_URL = 'http://localhost:8080';

      const mockTools: ListToolsResponse = {
        object: 'list',
        data: [
          {
            name: 'read_file',
            description: 'Read content from a file',
            server: 'file-server',
            input_schema: {} as Record<string, never>,
          },
        ],
      };

      mockClient.listTools.mockResolvedValue(mockTools);

      const expectedResponse: ListToolsResponse = {
        object: 'list',
        data: [
          {
            name: 'read_file',
            description: 'Read content from a file',
            server: 'file-server',
            input_schema: {},
          },
        ],
      };

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedResponse);
    });

    it('should allow access when authenticated', async () => {
      process.env.ENABLE_AUTH = 'true';
      process.env.INFERENCE_GATEWAY_URL = 'http://localhost:8080';

      const mockSession = {
        user: { email: 'test@example.com' },
        accessToken: 'test-token',
      };
      mockAuth.mockResolvedValue(mockSession);

      const mockTools: ListToolsResponse = {
        object: 'list',
        data: [
          {
            name: 'web_search',
            description: 'Search the web for information',
            server: 'web-search-server',
            input_schema: {} as Record<string, never>,
          },
        ],
      };

      mockClient.listTools.mockResolvedValue(mockTools);

      const expectedResponse: ListToolsResponse = {
        object: 'list',
        data: [
          {
            name: 'web_search',
            description: 'Search the web for information',
            server: 'web-search-server',
            input_schema: {},
          },
        ],
      };

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedResponse);
    });
  });

  describe('gateway integration', () => {
    beforeEach(() => {
      process.env.ENABLE_AUTH = 'false';
      process.env.INFERENCE_GATEWAY_URL = 'http://localhost:8080';
    });

    it('should return 500 when INFERENCE_GATEWAY_URL is not set', async () => {
      delete process.env.INFERENCE_GATEWAY_URL;

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Gateway URL configuration missing');
    });

    it('should successfully fetch MCP tools from gateway', async () => {
      const mockSDKResponse: ListToolsResponse = {
        object: 'list',
        data: [
          {
            name: 'fetch_url',
            description: 'Fetch content from a URL',
            server: 'http-server',
            input_schema: {} as Record<string, never>,
          },
          {
            name: 'execute_code',
            description: 'Execute code in a sandbox',
            server: 'code-execution-server',
            input_schema: {} as Record<string, never>,
          },
        ],
      };

      const expectedResponse: ListToolsResponse = {
        object: 'list',
        data: [
          {
            name: 'fetch_url',
            description: 'Fetch content from a URL',
            server: 'http-server',
            input_schema: {},
          },
          {
            name: 'execute_code',
            description: 'Execute code in a sandbox',
            server: 'code-execution-server',
            input_schema: {},
          },
        ],
      };

      mockClient.listTools.mockResolvedValue(mockSDKResponse);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedResponse);
      expect(mockClient.listTools).toHaveBeenCalledTimes(1);
    });

    it('should handle SDK errors gracefully', async () => {
      const error = new Error('Failed to fetch tools');
      mockClient.listTools.mockRejectedValue(error);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch MCP tools from inference gateway');
    });

    it('should handle unauthorized errors from SDK', async () => {
      const error = new Error('unauthorized');
      mockClient.listTools.mockRejectedValue(error);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('unauthorized');
    });

    it('should create client with proper authentication headers', async () => {
      process.env.ENABLE_AUTH = 'true';
      const mockSession = {
        user: { email: 'test@example.com' },
        accessToken: 'test-token',
      };
      mockAuth.mockResolvedValue(mockSession);

      const mockTools = {
        object: 'list',
        data: [],
      } as unknown as jest.Mocked<ListToolsResponse>;
      mockClient.listTools.mockResolvedValue(mockTools);

      await GET();

      expect(mockInferenceGatewayClient).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8080',
        fetch: expect.any(Function),
      });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      process.env.ENABLE_AUTH = 'false';
      process.env.INFERENCE_GATEWAY_URL = 'http://localhost:8080';
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockInferenceGatewayClient.mockImplementation(() => {
        throw networkError;
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to connect to inference gateway');
    });

    it('should handle empty tools response', async () => {
      const emptyResponse = {
        object: 'list',
        data: [],
      } as unknown as jest.Mocked<ListToolsResponse>;

      mockClient.listTools.mockResolvedValue(emptyResponse);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(emptyResponse);
      expect(data.data).toHaveLength(0);
    });
  });
});
