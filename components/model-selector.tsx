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
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModelAction: (modelId: string) => void;
  isMobile?: boolean;
}

export default function ModelSelector({
  selectedModel,
  onSelectModelAction,
  isMobile = false,
}: ModelSelectorProps) {
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

        if (selectedModel) {
          onSelectModelAction('');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadModels();
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoading && models.length > 0 && selectedModel) {
      const modelExists = models.some(model => model.id === selectedModel);
      if (!modelExists) {
        onSelectModelAction('');
      }
    }
  }, [models, selectedModel, isLoading, onSelectModelAction]);

  useEffect(() => {
    if (open && searchInputRef.current) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 10);
      return () => clearTimeout(timer);
    } else if (!open) {
      setSearchQuery('');
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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchQuery(e.target.value);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstModelItem = document.querySelector(
        '[data-testid^="model-option-"]'
      ) as HTMLElement;
      if (firstModelItem) {
        firstModelItem.focus();
      }
    }

    if (e.key === 'Enter') {
      if (filteredModels.length === 1) {
        handleModelSelect(filteredModels[0].id);
        e.preventDefault();
      }
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Select
      value={selectedModel}
      onValueChange={handleModelSelect}
      disabled={isLoading}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger
        className={cn(
          'bg-transparent border-none text-[hsl(var(--model-selector-text))] hover:bg-[hsl(var(--model-selector-bg))] focus:ring-0 focus:ring-offset-0 focus:outline-none h-auto flex justify-center items-center text-center',
          isMobile ? 'w-full' : 'md:min-w-[330px] min-w-0'
        )}
      >
        <SelectValue className="w-full text-center">
          <span
            className="text-lg font-normal text-center w-full block"
            data-testid="selector-display-text"
          >
            {getDisplayName(selectedModel)}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className={cn(
          'bg-[hsl(var(--model-selector-bg))] border-[hsl(var(--model-selector-border))] text-[hsl(var(--model-selector-text))] max-h-[300px] mx-auto',
          isMobile ? 'w-[90vw]' : 'w-[240px] md:min-w-[330px] md:w-[350px]'
        )}
        onCloseAutoFocus={e => {
          if (searchQuery) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex items-center px-3 pb-2 sticky top-0 bg-[hsl(var(--model-selector-bg))] z-10">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={searchInputRef}
            placeholder="Search models..."
            className="h-8 bg-transparent border-[hsl(var(--model-selector-border))] text-[hsl(var(--model-selector-text))] placeholder:text-[hsl(var(--model-selector-disabled-text))]"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onClick={handleInputClick}
            onKeyDown={handleSearchKeyDown}
            autoComplete="off"
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
                className="text-[hsl(var(--model-selector-option-text))] focus:bg-[hsl(var(--model-selector-focus-bg))] focus:text-[hsl(var(--model-selector-text))]"
                data-testid={`model-option-${model.id}`}
              >
                {model.id}
              </SelectItem>
            ))}
          </SelectGroup>
        ) : (
          <SelectItem
            value="none"
            disabled
            className="text-[hsl(var(--model-selector-disabled-text))]"
          >
            {searchQuery ? 'No matching models' : 'No models available'}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
