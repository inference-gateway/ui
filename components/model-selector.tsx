"use client";

import logger from "@/lib/logger";
import { useEffect, useState, useRef } from "react";
import type { Model } from "@/types/model";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchModels } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Check, Search } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModelAction: (modelId: string) => void;
}

export default function ModelSelector({
  selectedModel,
  onSelectModelAction,
}: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadModels() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchModels();
        logger.debug("Successfully loaded models", {
          count: response.data.length,
        });
        setModels(response.data);
      } catch (err) {
        const error =
          err instanceof Error ? err.message : "Failed to load models";
        logger.error("Error loading models", { error });
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadModels();
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  const filteredModels = models.filter((model) =>
    model.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleModelSelect = (modelId: string) => {
    logger.debug("User selected model", { modelId });
    onSelectModelAction(modelId);
    setOpen(false);
  };

  return (
    <Select
      value={selectedModel}
      onValueChange={handleModelSelect}
      disabled={isLoading}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className="w-full min-w-[320px] max-w-[380px]">
        <SelectValue
          placeholder={isLoading ? "Loading..." : "Select a model"}
        />
      </SelectTrigger>
      <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-[300px]">
        <div className="flex items-center px-3 pb-2 sticky top-0 bg-background z-10">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={searchInputRef}
            placeholder="Search models..."
            className="h-9"
            value={searchQuery}
            onChange={(e) => {
              const query = e.target.value;
              logger.debug("Searching models", { query });
              setSearchQuery(query);
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        {error ? (
          <SelectItem value="error" disabled>
            {error}
          </SelectItem>
        ) : filteredModels.length > 0 ? (
          <SelectGroup>
            {filteredModels.map((model) => (
              <SelectItem
                key={model.id}
                value={model.id}
                className="flex justify-between"
              >
                <div className="flex justify-between w-full items-center">
                  <span className="truncate">{model.id}</span>
                  {selectedModel === model.id && (
                    <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ) : (
          <SelectItem value="none" disabled>
            {searchQuery ? "No matching models" : "No models available"}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
