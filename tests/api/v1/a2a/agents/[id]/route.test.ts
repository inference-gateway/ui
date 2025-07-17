import { GET } from '@/app/api/v1/a2a/agents/[id]/route';
import { NextRequest } from 'next/server';

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/v1/a2a/agents/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.INFERENCE_GATEWAY_URL;
  });

  const mockAgentDetails = {
    agent: {
      id: 'agent1',
      name: 'Test Agent 1',
      description: 'Test description 1',
      url: 'https://agent1.example.com',
      status: 'available',
      version: '1.0.0',
      skills: [
        {
          id: 'skill1',
          name: 'Test Skill',
          description: 'Test skill description',
        },
      ],
    },
    health_status: 'healthy',
    response_time_ms: 150,
    last_health_check: '2024-01-01T00:00:00Z',
  };

  test('successfully fetches agent details from inference gateway', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAgentDetails,
    });

    const response = await GET(
      {} as NextRequest,
      { params: { id: 'agent1' } }
    );
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/v1/a2a/agents/agent1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);
    expect(data).toEqual(mockAgentDetails);
  });

  test('uses custom INFERENCE_GATEWAY_URL when provided', async () => {
    process.env.INFERENCE_GATEWAY_URL = 'https://custom-gateway.example.com';

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAgentDetails,
    });

    await GET(
      {} as NextRequest,
      { params: { id: 'agent1' } }
    );

    expect(fetch).toHaveBeenCalledWith('https://custom-gateway.example.com/v1/a2a/agents/agent1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('handles agent not found (404)', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const response = await GET(
      {} as NextRequest,
      { params: { id: 'nonexistent' } }
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      error: 'Failed to fetch A2A agent details from inference gateway',
    });
  });

  test('handles inference gateway server errors', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const response = await GET(
      {} as NextRequest,
      { params: { id: 'agent1' } }
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch A2A agent details from inference gateway',
    });
  });

  test('handles network errors', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const response = await GET(
      {} as NextRequest,
      { params: { id: 'agent1' } }
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch A2A agent details',
    });
  });

  test('handles malformed JSON response', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const response = await GET(
      {} as NextRequest,
      { params: { id: 'agent1' } }
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch A2A agent details',
    });
  });

  test('handles special characters in agent ID', async () => {
    const agentId = 'agent-with-special-chars_123';
    
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockAgentDetails,
        agent: {
          ...mockAgentDetails.agent,
          id: agentId,
        },
      }),
    });

    await GET(
      {} as NextRequest,
      { params: { id: agentId } }
    );

    expect(fetch).toHaveBeenCalledWith(`http://localhost:8080/v1/a2a/agents/${agentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('handles empty agent ID', async () => {
    const response = await GET(
      {} as NextRequest,
      { params: { id: '' } }
    );
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/v1/a2a/agents/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('handles agent with minimal data', async () => {
    const minimalAgent = {
      agent: {
        id: 'minimal-agent',
        name: 'Minimal Agent',
        description: 'Minimal description',
        url: 'https://minimal.example.com',
      },
      health_status: 'unknown',
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => minimalAgent,
    });

    const response = await GET(
      {} as NextRequest,
      { params: { id: 'minimal-agent' } }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(minimalAgent);
  });

  test('handles agent with complete data', async () => {
    const completeAgent = {
      agent: {
        id: 'complete-agent',
        name: 'Complete Agent',
        description: 'Complete description',
        url: 'https://complete.example.com',
        status: 'available',
        version: '2.0.0',
        skills: [
          {
            id: 'skill1',
            name: 'Skill 1',
            description: 'Skill 1 description',
            examples: ['example1', 'example2'],
            inputModes: ['text', 'json'],
            outputModes: ['text', 'json'],
            tags: ['tag1', 'tag2'],
          },
        ],
        capabilities: {
          streaming: true,
          pushNotifications: true,
          stateTransitionHistory: false,
        },
        provider: {
          organization: 'Test Org',
          url: 'https://testorg.example.com',
        },
        author: 'Test Author',
        homepage: 'https://homepage.example.com',
        license: 'MIT',
      },
      health_status: 'healthy',
      response_time_ms: 75,
      last_health_check: '2024-01-01T12:00:00Z',
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => completeAgent,
    });

    const response = await GET(
      {} as NextRequest,
      { params: { id: 'complete-agent' } }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(completeAgent);
  });
});