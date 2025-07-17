import { GET } from '@/app/api/v1/a2a/agents/route';
import { NextRequest } from 'next/server';

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/v1/a2a/agents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.INFERENCE_GATEWAY_URL;
  });

  test('successfully fetches agents from inference gateway', async () => {
    const mockResponse = {
      data: [
        {
          id: 'agent1',
          name: 'Test Agent 1',
          description: 'Test description 1',
          url: 'https://agent1.example.com',
          status: 'available',
          version: '1.0.0',
        },
        {
          id: 'agent2',
          name: 'Test Agent 2',
          description: 'Test description 2',
          url: 'https://agent2.example.com',
          status: 'unavailable',
          version: '1.0.0',
        },
      ],
      object: 'list',
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await GET();
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/v1/a2a/agents', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResponse);
  });

  test('uses custom INFERENCE_GATEWAY_URL when provided', async () => {
    process.env.INFERENCE_GATEWAY_URL = 'https://custom-gateway.example.com';

    const mockResponse = {
      data: [],
      object: 'list',
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await GET();

    expect(fetch).toHaveBeenCalledWith('https://custom-gateway.example.com/v1/a2a/agents', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('handles inference gateway errors', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch A2A agents from inference gateway',
    });
  });

  test('handles inference gateway 404 errors', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      error: 'Failed to fetch A2A agents from inference gateway',
    });
  });

  test('handles network errors', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch A2A agents',
    });
  });

  test('handles fetch timeout', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Request timeout'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch A2A agents',
    });
  });

  test('handles malformed JSON response', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch A2A agents',
    });
  });

  test('handles empty response from inference gateway', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({});
  });

  test('handles null response from inference gateway', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => null,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeNull();
  });
});