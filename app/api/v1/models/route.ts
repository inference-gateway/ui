import { auth } from "@/lib/auth";
import { InferenceGatewayClient } from "@inference-gateway/sdk";
import { NextResponse } from "next/server";

export async function GET() {
  const isAuthEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
  const session = isAuthEnabled ? await auth() : null;

  if (isAuthEnabled && !session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const gatewayUrl = process.env.INFERENCE_GATEWAY_URL;

    if (!gatewayUrl) {
      console.error("INFERENCE_GATEWAY_URL environment variable is not set");
      return NextResponse.json(
        { error: "Gateway URL configuration missing" },
        { status: 500 }
      );
    }

    const client = new InferenceGatewayClient({
      baseURL: gatewayUrl,
      fetch: fetch.bind(globalThis),
    });

    try {
      const models = await client.listModels();
      return NextResponse.json(models);
    } catch (error) {
      console.error(error);
      console.error(
        `Error fetching models from gateway: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return NextResponse.json(
        { error: "Failed to fetch models from inference gateway" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error connecting to inference gateway:", error);
    return NextResponse.json(
      { error: "Failed to connect to inference gateway" },
      { status: 500 }
    );
  }
}
