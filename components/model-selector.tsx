'use client';

import { useEffect, useState, useRef } from 'react';
import type { Model } from '@/types/model';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchModels } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import logger from '@/lib/logger';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModelAction: (modelId: string) => void;
}

export default function ModelSelector({ selectedModel, onSelectModelAction }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadModels() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchModels();
        setModels(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load models';
        logger.error('Error loading models', { error: errorMessage });
        setError(errorMessage);
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

  const filteredModels =
    models?.filter(model => model.id.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const handleModelSelect = (modelId: string) => {
    onSelectModelAction(modelId);
    setOpen(false);
  };

  const getDisplayName = (modelId: string) => {
    if (!modelId) return isLoading ? 'Loading...' : 'Select a model';
    return modelId;
  };

  return (
    <Select
      value={selectedModel}
      onValueChange={handleModelSelect}
      disabled={isLoading}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className="bg-transparent border-none text-white hover:bg-[#1e1e20] md:min-w-[330px] focus:ring-0 focus:ring-offset-0 focus:outline-none min-w-0 h-auto flex justify-center items-center text-center">
        <SelectValue className="w-full text-center">
          <span
            className="text-lg font-normal text-center w-full block"
            data-testid="selector-display-text"
          >
            {getDisplayName(selectedModel)}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-[#1e1e20] border-[#3e3f44] text-white w-[240px] md:min-w-[330px] md:w-[350px] max-h-[300px] mx-auto">
        <div className="flex items-center px-3 pb-2 sticky top-0 bg-[#1e1e20] z-10">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={searchInputRef}
            placeholder="Search models..."
            className="h-8 bg-transparent border-[#3e3f44] text-white placeholder:text-gray-400"
            value={searchQuery}
            onChange={e => {
              const query = e.target.value;
              setSearchQuery(query);
            }}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            data-testid="search-input"
          />
        </div>
        {error ? (
          <SelectItem value="error" disabled data-testid="error-message">
            Failed to load models
          </SelectItem>
        ) : isLoading ? (
          <SelectItem value="loading" disabled data-testid="loading-message">
            Loading...
          </SelectItem>
        ) : filteredModels.length > 0 ? (
          <SelectGroup>
            {filteredModels.map(model => (
              <SelectItem
                key={model.id}
                value={model.id}
                className="text-gray-200 focus:bg-[#2a2a2d] focus:text-white"
                data-testid={`model-option-${model.id}`}
              >
                {model.id}
              </SelectItem>
            ))}
          </SelectGroup>
        ) : (
          <SelectItem value="none" disabled className="text-gray-400">
            {searchQuery ? 'No matching models' : 'No models available'}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
