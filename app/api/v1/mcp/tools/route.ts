import { auth } from '@/lib/auth';
import logger from '@/lib/logger';
import { InferenceGatewayClient } from '@inference-gateway/sdk';
import { ListToolsResponse } from '@/types/mcp';
import { NextResponse } from 'next/server';

export async function GET() {
  const isAuthEnabled = process.env.ENABLE_AUTH === 'true';
  const session = isAuthEnabled ? await auth() : null;

  if (isAuthEnabled && !session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    logger.debug('[MCP Tools] Starting list request');
    const gatewayUrl = process.env.INFERENCE_GATEWAY_URL;

    if (!gatewayUrl) {
      logger.error('[MCP Tools] INFERENCE_GATEWAY_URL environment variable is not set');
      return NextResponse.json({ error: 'Gateway URL configuration missing' }, { status: 500 });
    }

    const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
      const authInit = {
        ...init,
        headers: {
          ...init?.headers,
          ...(isAuthEnabled ? { Authorization: `Bearer ${session?.accessToken}` } : {}),
        },
      };
      return fetch(input, authInit);
    };

    const client = new InferenceGatewayClient({
      baseURL: gatewayUrl,
      fetch: fetchWithAuth,
    });

    try {
      const tools = await client.listTools();
      logger.debug('[MCP Tools] Successfully fetched tools', {
        count: tools.data?.length || 0,
      });
      const compatibleResponse: ListToolsResponse = {
        object: tools.object,
        data: tools.data.map(tool => ({
          name: tool.name,
          description: tool.description,
          server: tool.server,
          input_schema: tool.input_schema as Record<string, unknown>,
        })) as ListToolsResponse['data'],
      };
      return NextResponse.json(compatibleResponse);
    } catch (error) {
      if (error instanceof Error && error.message === 'unauthorized') {
        logger.warn('[MCP Tools] Authentication failed, redirecting to login');
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }

      if (error instanceof Error && error.message.includes('mcp tools endpoint is not exposed')) {
        logger.warn('[MCP Tools] MCP tools endpoint not exposed');
        return NextResponse.json({ error: 'mcp tools endpoint is not exposed' }, { status: 403 });
      }

      logger.error('[MCP Tools] Error fetching tools from gateway', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        { error: 'Failed to fetch MCP tools from inference gateway' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('[MCP Tools] Error connecting to inference gateway', { error });
    return NextResponse.json({ error: 'Failed to connect to inference gateway' }, { status: 500 });
  }
}
