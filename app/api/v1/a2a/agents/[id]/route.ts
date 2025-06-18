import { NextResponse } from 'next/server';
import type { A2AAgentDetails } from '@/types/a2a';

// Mock agent details data
const mockAgentDetails: Record<string, A2AAgentDetails> = {
  'weather-agent-1': {
    agent: {
      id: 'weather-agent-1',
      name: 'Weather Intelligence Agent',
      description:
        'Provides comprehensive weather data, forecasts, and climate analysis using multiple data sources',
      version: '2.1.0',
      author: 'Weather Corp',
      homepage: 'https://weather-agent.example.com',
      license: 'MIT',
      capabilities: [
        {
          name: 'current_weather',
          description: 'Get current weather conditions for any location worldwide',
          input_schema: {
            type: 'object',
            properties: {
              location: { type: 'string', description: 'City name or coordinates' },
            },
          },
          output_schema: {
            type: 'object',
            properties: {
              temperature: { type: 'number' },
              conditions: { type: 'string' },
              humidity: { type: 'number' },
            },
          },
        },
        {
          name: 'weather_forecast',
          description: 'Get detailed weather forecast for up to 14 days',
        },
        {
          name: 'severe_alerts',
          description: 'Get active severe weather alerts for a region',
        },
      ],
      endpoints: [
        {
          name: 'weather',
          method: 'POST',
          path: '/api/weather',
          description: 'Main weather endpoint',
        },
        {
          name: 'health',
          method: 'GET',
          path: '/health',
          description: 'Health check endpoint',
        },
      ],
      status: 'available',
      lastUpdated: '2024-12-15T10:30:00Z',
    },
    health_status: 'healthy',
    response_time_ms: 150,
    last_health_check: '2024-12-15T11:00:00Z',
  },
  'data-analyst-1': {
    agent: {
      id: 'data-analyst-1',
      name: 'Data Analysis Agent',
      description:
        'Advanced data processing, analysis, and visualization capabilities with machine learning insights',
      version: '1.8.2',
      author: 'DataLab Inc',
      homepage: 'https://datalab.example.com',
      license: 'Apache-2.0',
      capabilities: [
        {
          name: 'analyze_dataset',
          description: 'Perform comprehensive statistical analysis on datasets',
        },
        {
          name: 'create_visualization',
          description: 'Generate charts and graphs from data',
        },
        {
          name: 'ml_insights',
          description: 'Apply machine learning models for pattern recognition',
        },
      ],
      endpoints: [
        {
          name: 'analyze',
          method: 'POST',
          path: '/api/analyze',
          description: 'Data analysis endpoint',
        },
      ],
      status: 'available',
      lastUpdated: '2024-12-14T16:45:00Z',
    },
    health_status: 'healthy',
    response_time_ms: 280,
    last_health_check: '2024-12-15T10:58:00Z',
  },
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const agentDetails = mockAgentDetails[id];

    if (!agentDetails) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agentDetails);
  } catch (error) {
    console.error('Error fetching A2A agent details:', error);
    return NextResponse.json({ error: 'Failed to fetch agent details' }, { status: 500 });
  }
}
