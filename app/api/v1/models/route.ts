import { auth } from '@/lib/auth';
import logger from '@/lib/logger';
import { InferenceGatewayClient } from '@inference-gateway/sdk';
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
    logger.debug('[Models] Starting list request');
    const gatewayUrl = process.env.INFERENCE_GATEWAY_URL;

    if (!gatewayUrl) {
      logger.error('[Models] INFERENCE_GATEWAY_URL environment variable is not set');
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
      const models = await client.listModels();
      logger.debug('[Models] Successfully fetched models', {
        count: models.data?.length || 0,
      });
      return NextResponse.json(models);
    } catch (error) {
      if (error instanceof Error && error.message === 'unauthorized') {
        logger.warn('[Models] Authentication failed, redirecting to login');
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }

      logger.error('[Models] Error fetching models from gateway', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        { error: 'Failed to fetch models from inference gateway' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('[Models] Error connecting to inference gateway', { error });
    return NextResponse.json({ error: 'Failed to connect to inference gateway' }, { status: 500 });
  }
}
