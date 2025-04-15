import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import ModelSelector from '@/components/model-selector';
import { fetchModels } from '@/lib/api';
import { mockModels, mockFetchModelsSuccess, mockFetchModelsError } from '@/tests/mocks/api';

describe('ModelSelector Component', () => {
  const mockOnSelectModelAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Element.prototype.scrollIntoView = jest.fn();
  });

  test('displays loading state initially', async () => {
    (fetchModels as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<ModelSelector selectedModel="" onSelectModelAction={mockOnSelectModelAction} />);

    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toHaveTextContent('Loading...');
  });

  test('loads and displays models', async () => {
    (fetchModels as jest.Mock).mockImplementation(mockFetchModelsSuccess);

    render(<ModelSelector selectedModel="" onSelectModelAction={mockOnSelectModelAction} />);

    expect(fetchModels).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const selectTrigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(selectTrigger);
    });

    for (const model of mockModels) {
      expect(screen.getByText(model.id)).toBeInTheDocument();
    }
  });

  test('shows error message when API fails', async () => {
    (fetchModels as jest.Mock).mockImplementation(mockFetchModelsError);

    render(<ModelSelector selectedModel="" onSelectModelAction={mockOnSelectModelAction} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const selectTrigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(selectTrigger);
    });

    expect(screen.getByText('Failed to load models')).toBeInTheDocument();
  });

  test('filters models based on search query', async () => {
    (fetchModels as jest.Mock).mockImplementation(mockFetchModelsSuccess);

    render(<ModelSelector selectedModel="" onSelectModelAction={mockOnSelectModelAction} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const selectTrigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(selectTrigger);
    });

    const searchInput = screen.getByPlaceholderText('Search models...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'claude' } });
    });

    expect(screen.getByText('anthropic/claude-3-opus')).toBeInTheDocument();
    expect(screen.getByText('anthropic/claude-3-sonnet')).toBeInTheDocument();
    expect(screen.queryByText('openai/gpt-4o')).not.toBeInTheDocument();
  });

  test('calls onSelectModelAction with correct model ID when selected', async () => {
    (fetchModels as jest.Mock).mockImplementation(mockFetchModelsSuccess);

    render(<ModelSelector selectedModel="" onSelectModelAction={mockOnSelectModelAction} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const selectTrigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(selectTrigger);
    });

    const modelOption = screen.getByText('openai/gpt-4o');
    await act(async () => {
      fireEvent.click(modelOption);
    });

    expect(mockOnSelectModelAction).toHaveBeenCalledWith('openai/gpt-4o');
  });
});
