import { auth } from '@/lib/auth';
import logger from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const isAuthEnabled = process.env.AUTH_ENABLE === 'true';
  const session = isAuthEnabled ? await auth() : null;

  if (isAuthEnabled && !session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  logger.debug('[Chat Completions] Starting request');
  const gatewayUrl = process.env.INFERENCE_GATEWAY_URL;

  if (!gatewayUrl) {
    logger.error('[Chat Completions] INFERENCE_GATEWAY_URL environment variable is not set');
    return NextResponse.json({ error: 'Gateway URL configuration missing' }, { status: 500 });
  }

  const body = await req.json();
  const { stream } = body;

  if (!stream) {
    logger.debug('[Chat Completions] Non-streaming request');
    return NextResponse.json({ error: 'Streaming is required' }, { status: 400 });
  }

  const backendResponse = await fetch(gatewayUrl + '/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
    body: JSON.stringify(body),
  });
  if (!backendResponse.ok) {
    logger.error(
      `[Chat Completions] Backend error: ${backendResponse.status} ${backendResponse.statusText}`
    );
    return NextResponse.json({ error: 'Backend error' }, { status: backendResponse.status });
  }
  if (!backendResponse.body) {
    return NextResponse.json({ error: 'No body' }, { status: 500 });
  }

  return new Response(backendResponse.body, {
    headers: {
      'Content-Type': backendResponse.headers.get('Content-Type') || 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
