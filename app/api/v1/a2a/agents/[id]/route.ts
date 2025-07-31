import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const inferenceGatewayUrl = process.env.INFERENCE_GATEWAY_URL || 'http://localhost:8080';
    const url = `${inferenceGatewayUrl}/v1/a2a/agents/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      console.error(
        `Failed to fetch A2A agent details from inference gateway: ${response.statusText}`
      );
      return NextResponse.json(
        { error: 'Failed to fetch agent details from inference gateway' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching A2A agent details:', error);
    return NextResponse.json({ error: 'Failed to fetch agent details' }, { status: 500 });
  }
}
