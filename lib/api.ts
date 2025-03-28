import type { ListModelsResponse } from "@/types/model";

export async function fetchModels(): Promise<ListModelsResponse> {
  const response = await fetch("/api/v1/models");

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  return response.json();
}
