import logger from "@/lib/logger";
import { InferenceGatewayClient } from "@inference-gateway/sdk";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    logger.debug("Starting models list request");
    const gatewayUrl = process.env.INFERENCE_GATEWAY_URL;

    if (!gatewayUrl) {
      logger.error("INFERENCE_GATEWAY_URL environment variable is not set");
      return NextResponse.json(
        { error: "Gateway URL configuration missing" },
        { status: 500 }
      );
    }

    logger.debug("Creating InferenceGatewayClient", { gatewayUrl });
    const client = new InferenceGatewayClient({
      baseURL: gatewayUrl,
      fetch: fetch.bind(globalThis),
    });

    try {
      const models = await client.listModels();
      logger.debug("Successfully fetched models", {
        count: models.data?.length || 0,
      });
      return NextResponse.json(models);
    } catch (error) {
      logger.error("Error fetching models from gateway", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        { error: "Failed to fetch models from inference gateway" },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error("Error connecting to inference gateway", { error });
    return NextResponse.json(
      { error: "Failed to connect to inference gateway" },
      { status: 500 }
    );
  }
}
