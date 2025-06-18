import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const inferenceGatewayUrl = process.env.INFERENCE_GATEWAY_URL || 'http://localhost:8080/v1';
    const url = `${inferenceGatewayUrl}/a2a/agents`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch A2A agents from inference gateway: ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch A2A agents from inference gateway' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching A2A agents:', error);
    return NextResponse.json({ error: 'Failed to fetch A2A agents' }, { status: 500 });
  }
}
