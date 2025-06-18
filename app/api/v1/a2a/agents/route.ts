import { NextResponse } from 'next/server';
import type { A2AAgentsResponse } from '@/types/a2a';

// Mock data for A2A agents
const mockAgents: A2AAgentsResponse = {
  agents: [
    {
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
          input_schema: {
            type: 'object',
            properties: {
              location: { type: 'string' },
              days: { type: 'number', maximum: 14 },
            },
          },
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
    {
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
          input_schema: {
            type: 'object',
            properties: {
              data: { type: 'array' },
              analysis_type: { type: 'string', enum: ['descriptive', 'predictive', 'diagnostic'] },
            },
          },
        },
        {
          name: 'create_visualization',
          description: 'Generate charts and graphs from data',
        },
        {
          name: 'ml_insights',
          description: 'Apply machine learning models for pattern recognition',
        },
        {
          name: 'trend_analysis',
          description: 'Identify trends and anomalies in time series data',
        },
      ],
      endpoints: [
        {
          name: 'analyze',
          method: 'POST',
          path: '/api/analyze',
          description: 'Data analysis endpoint',
        },
        {
          name: 'visualize',
          method: 'POST',
          path: '/api/visualize',
          description: 'Data visualization endpoint',
        },
      ],
      status: 'available',
      lastUpdated: '2024-12-14T16:45:00Z',
    },
    {
      id: 'translation-agent-1',
      name: 'Multi-Language Translation Agent',
      description:
        'Professional-grade translation service supporting 100+ languages with context awareness',
      version: '3.0.1',
      author: 'LinguaTech',
      license: 'Commercial',
      capabilities: [
        {
          name: 'translate_text',
          description: 'Translate text between any supported language pair',
          input_schema: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              source_lang: { type: 'string' },
              target_lang: { type: 'string' },
            },
          },
        },
        {
          name: 'detect_language',
          description: 'Automatically detect the language of input text',
        },
        {
          name: 'batch_translate',
          description: 'Translate multiple texts in a single request',
        },
      ],
      endpoints: [
        {
          name: 'translate',
          method: 'POST',
          path: '/api/translate',
          description: 'Translation endpoint',
        },
      ],
      status: 'unavailable',
      lastUpdated: '2024-12-10T09:15:00Z',
    },
    {
      id: 'research-agent-1',
      name: 'Academic Research Assistant',
      description:
        'Comprehensive research capabilities including paper analysis, citation management, and knowledge synthesis',
      version: '1.5.0',
      author: 'ResearchBot Labs',
      homepage: 'https://researchbot.example.com',
      license: 'GPL-3.0',
      capabilities: [
        {
          name: 'search_papers',
          description: 'Search academic databases for relevant research papers',
        },
        {
          name: 'analyze_paper',
          description: 'Extract key insights and summaries from research papers',
        },
        {
          name: 'generate_citations',
          description: 'Generate properly formatted citations in multiple styles',
        },
        {
          name: 'synthesize_knowledge',
          description: 'Combine information from multiple sources into coherent summaries',
        },
      ],
      endpoints: [
        {
          name: 'search',
          method: 'GET',
          path: '/api/search',
          description: 'Paper search endpoint',
        },
        {
          name: 'analyze',
          method: 'POST',
          path: '/api/analyze',
          description: 'Paper analysis endpoint',
        },
      ],
      status: 'error',
      lastUpdated: '2024-12-12T14:20:00Z',
    },
  ],
  total_count: 4,
  available_count: 2,
};

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(mockAgents);
  } catch (error) {
    console.error('Error fetching A2A agents:', error);
    return NextResponse.json({ error: 'Failed to fetch A2A agents' }, { status: 500 });
  }
}
