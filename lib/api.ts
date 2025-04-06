import type { ListModelsResponse } from "@/types/model";
import { Session } from "next-auth";

export async function fetchModels(
  session?: Session
): Promise<ListModelsResponse> {
  const headers: Record<string, string> = {};

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch("/api/v1/models", {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  return response.json();
}
