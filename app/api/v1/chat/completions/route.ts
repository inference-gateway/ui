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

    // Get the content type to properly handle streaming
    // const contentType = req.headers.get("Content-Type") || "application/json";

    // Clone headers but remove host
    const headers = new Headers();
    for (const [key, value] of req.headers.entries()) {
      if (key.toLowerCase() !== "host") {
        headers.set(key, value);
      }
    }

    // Get the request body
    const body = await req.json();
    const { stream } = body;

    // Forward the request to the gateway
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

    // If this is a streaming response, we need to forward the stream
    if (stream) {
      // Create a new readable stream from the response body
      const responseStream = response.body;

      // Return a new streaming response
      return new Response(responseStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // For non-streaming responses, just forward the JSON
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
