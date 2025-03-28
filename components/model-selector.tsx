"use client";

import { useEffect, useState } from "react";
import type { Model } from "@/types/model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchModels } from "@/lib/api";

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export default function ModelSelector({
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModels() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchModels();
        setModels(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load models");
        console.error("Error loading models:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadModels();
  }, []);

  return (
    <Select
      value={selectedModel}
      onValueChange={onSelectModel}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue
          placeholder={isLoading ? "Loading..." : "Select a model"}
        />
      </SelectTrigger>
      <SelectContent>
        {error ? (
          <SelectItem value="error" disabled>
            {error}
          </SelectItem>
        ) : models.length > 0 ? (
          models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.id}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
