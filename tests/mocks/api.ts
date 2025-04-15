import { Model } from '@/types/model';

export const mockModels: Model[] = [
  {
    id: 'openai/gpt-4o',
    object: 'model',
    created: 1698478425,
    owned_by: 'openai',
    served_by: 'openai',
  },
  {
    id: 'anthropic/claude-3-opus',
    object: 'model',
    created: 1709051887,
    owned_by: 'anthropic',
    served_by: 'anthropic',
  },
  {
    id: 'anthropic/claude-3-sonnet',
    object: 'model',
    created: 1708888769,
    owned_by: 'anthropic',
    served_by: 'anthropic',
  },
  {
    id: 'google/gemini-1.5-pro',
    object: 'model',
    created: 1710341589,
    owned_by: 'google',
    served_by: 'google',
  },
];

export const mockFetchModelsSuccess = jest.fn().mockResolvedValue({
  data: mockModels,
});

export const mockFetchModelsLoading = jest.fn().mockReturnValue(new Promise(() => {}));

export const mockFetchModelsError = jest.fn().mockRejectedValue(new Error('Failed to load models'));
