import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * @returns 200 OK response with health status information
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ui',
    },
    { status: 200 }
  );
}
