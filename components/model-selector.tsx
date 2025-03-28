"use client"

import type { Model } from "@/types/model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModelSelectorProps {
  models: Model[]
  selectedModel: string
  onSelectModel: (modelId: string) => void
}

export default function ModelSelector({ models, selectedModel, onSelectModel }: ModelSelectorProps) {
  return (
    <Select value={selectedModel} onValueChange={onSelectModel}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {models.length > 0 ? (
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
  )
}

