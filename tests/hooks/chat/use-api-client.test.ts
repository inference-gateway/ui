import { useApiClient } from '@/hooks/chat/use-api-client';
import { InferenceGatewayClient } from '@inference-gateway/sdk';
import { renderHook } from '@testing-library/react';

jest.mock('@inference-gateway/sdk', () => ({
  InferenceGatewayClient: jest.fn().mockImplementation(() => ({})),
}));

const MockInferenceGatewayClient = InferenceGatewayClient as jest.Mock;
interface ClientOptions {
  baseURL: string;
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

describe('useApiClient Hook', () => {
  let capturedOptions: ClientOptions;

  beforeEach(() => {
    jest.clearAllMocks();
    MockInferenceGatewayClient.mockImplementation((options: ClientOptions) => {
      capturedOptions = options;
      return { options };
    });

    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({ ok: true } as Response));
  });

  test('creates client with correct baseURL', () => {
    const { result } = renderHook(() => useApiClient());

    expect(MockInferenceGatewayClient).toHaveBeenCalledTimes(1);
    expect(capturedOptions.baseURL).toBe('/api/v1');
    expect(result.current).not.toBeNull();
  });

  test('custom fetch adds authorization header when token is provided', async () => {
    const mockAccessToken = 'test-token';

    renderHook(() => useApiClient(mockAccessToken));

    const customFetch = capturedOptions.fetch;
    expect(customFetch).toBeDefined();

    await customFetch('https://test.com/api', { headers: { 'Content-Type': 'application/json' } });

    expect(global.fetch).toHaveBeenCalledWith('https://test.com/api', {
      headers: expect.any(Headers),
    });

    const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers as Headers;

    expect(calledHeaders.get('Authorization')).toBe('Bearer test-token');
    expect(calledHeaders.get('Content-Type')).toBe('application/json');
  });

  test('custom fetch does not add authorization header when no token is provided', async () => {
    renderHook(() => useApiClient());

    const customFetch = capturedOptions.fetch;

    await customFetch('https://test.com/api', { headers: { 'Content-Type': 'application/json' } });

    const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers as Headers;

    expect(calledHeaders.has('Authorization')).toBeFalsy();
    expect(calledHeaders.get('Content-Type')).toBe('application/json');
  });

  test('client is recreated when access token changes', () => {
    const { rerender } = renderHook(({ token }) => useApiClient(token), {
      initialProps: { token: 'initial-token' },
    });

    expect(MockInferenceGatewayClient).toHaveBeenCalledTimes(1);

    rerender({ token: 'new-token' });

    expect(MockInferenceGatewayClient).toHaveBeenCalledTimes(2);
  });

  test('client is not recreated when same token is provided', () => {
    const { rerender } = renderHook(({ token }) => useApiClient(token), {
      initialProps: { token: 'test-token' },
    });

    expect(MockInferenceGatewayClient).toHaveBeenCalledTimes(1);

    rerender({ token: 'test-token' });

    expect(MockInferenceGatewayClient).toHaveBeenCalledTimes(1);
  });
});
