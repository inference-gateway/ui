import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const gatewayUrl = process.env.INFERENCE_GATEWAY_URL;

    if (!gatewayUrl) {
      console.error("INFERENCE_GATEWAY_URL environment variable is not set");
      return NextResponse.json(
        { error: "Gateway URL configuration missing" },
        { status: 500 }
      );
    }

    const completionsEndpoint = `${gatewayUrl}/chat/completions`;

    const headers = new Headers();
    for (const [key, value] of req.headers.entries()) {
      if (key.toLowerCase() !== "host") {
        headers.set(key, value);
      }
    }

    const body = await req.json();
    const { stream } = body;

    const response = await fetch(completionsEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from inference gateway: ${errorText}`);
      return NextResponse.json(
        { error: "Failed to get completion from inference gateway" },
        { status: response.status }
      );
    }

    if (stream) {
      const responseStream = response.body;
      return new Response(responseStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      const completionData = await response.json();
      return NextResponse.json(completionData);
    }
  } catch (error) {
    console.error("Error in chat completions API:", error);
    return NextResponse.json(
      { error: "Failed to connect to inference gateway" },
      { status: 500 }
    );
  }
}
