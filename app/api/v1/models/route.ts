import type { ListModelsResponse } from "@/types/model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const gatewayUrl = process.env.INFERENCE_GATEWAY_URL;

    if (!gatewayUrl) {
      console.error("INFERENCE_GATEWAY_URL environment variable is not set");
      return NextResponse.json(
        { error: "Gateway URL configuration missing" },
        { status: 500 }
      );
    }

    const modelsEndpoint = `${gatewayUrl}/models`;
    const response = await fetch(modelsEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching models from gateway: ${errorText}`);
      return NextResponse.json(
        { error: "Failed to fetch models from inference gateway" },
        { status: response.status }
      );
    }

    const models: ListModelsResponse = await response.json();
    return NextResponse.json(models);
  } catch (error) {
    console.error("Error connecting to inference gateway:", error);
    return NextResponse.json(
      { error: "Failed to connect to inference gateway" },
      { status: 500 }
    );
  }
}
