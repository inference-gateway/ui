import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ModelSelector from '@/components/model-selector';
import { fetchModels } from '@/lib/api';
import { mockModels, mockFetchModelsSuccess, mockFetchModelsError } from '@/tests/mocks/api';

interface SelectProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectGroupProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface SelectValueProps {
  children: React.ReactNode;
  className?: string;
}

jest.mock('@/components/ui/select', () => {
  return {
    Select: ({ children, open, onOpenChange, value, onValueChange, disabled }: SelectProps) => {
      React.useEffect(() => {
        const handleItemSelected = (e: CustomEvent<{ value: string }>) => {
          if (onValueChange && e.detail && e.detail.value) {
            onValueChange(e.detail.value);
          }
        };

        document.addEventListener('item-selected', handleItemSelected as EventListener);
        return () => {
          document.removeEventListener('item-selected', handleItemSelected as EventListener);
        };
      }, [onValueChange]);

      return (
        <div data-testid="select">
          {React.Children.map(children, child =>
            React.cloneElement(
              child as React.ReactElement<{
                open?: boolean;
                onOpenChange?: (open: boolean) => void;
                value?: string;
                onValueChange?: (value: string) => void;
                disabled?: boolean;
              }>,
              { open, onOpenChange, value, onValueChange, disabled }
            )
          )}
        </div>
      );
    },
    SelectContent: ({ children, className }: SelectContentProps) => (
      <div data-testid="select-content" className={className} style={{ display: 'block' }}>
        {children}
      </div>
    ),
    SelectGroup: ({ children }: SelectGroupProps) => (
      <div data-testid="select-group">{children}</div>
    ),
    SelectItem: ({
      children,
      value,
      disabled,
      className,
      'data-testid': testId,
    }: SelectItemProps) => (
      <div
        data-testid={testId || `model-option-${value}`}
        data-value={value}
        data-disabled={disabled ? 'true' : 'false'}
        className={className}
        onClick={() =>
          !disabled &&
          document.dispatchEvent(
            new CustomEvent('item-selected', {
              detail: { value },
            })
          )
        }
      >
        {children}
      </div>
    ),
    SelectTrigger: ({ children, className, disabled }: SelectTriggerProps) => (
      <button
        data-testid="select-trigger"
        className={className}
        disabled={disabled}
        role="combobox"
        aria-expanded={false}
        aria-controls="select-content"
        onClick={() => document.dispatchEvent(new CustomEvent('trigger-clicked'))}
      >
        {children}
      </button>
    ),
    SelectValue: ({ children, className }: SelectValueProps) => (
      <span data-testid="select-value" className={className}>
        {children}
      </span>
    ),
  };
});

describe('ModelSelector Component', () => {
  const mockOnSelectModelAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Element.prototype.scrollIntoView = jest.fn();
  });

  test('displays loading state initially', async () => {
    (fetchModels as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<ModelSelector selectedModel="" onSelectModelAction={mockOnSelectModelAction} />);

    expect(screen.getByTestId('selector-display-text')).toHaveTextContent('Loading...');
  });

  test('loads and displays models', async () => {
    (fetchModels as jest.Mock).mockImplementation(mockFetchModelsSuccess);

    render(<ModelSelector selectedModel="" onSelectModelAction={mockOnSelectModelAction} />);

    expect(fetchModels).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByTestId('selector-display-text')).toHaveTextContent('Select a model');
    });

    document.dispatchEvent(new CustomEvent('trigger-clicked'));

    for (const model of mockModels) {
      await waitFor(() => {
        expect(screen.getByTestId(`model-option-${model.id}`)).toHaveTextContent(model.id);
      });
    }
  });

  test('shows error message when API fails', async () => {
    (fetchModels as jest.Mock).mockImplementation(mockFetchModelsError);

    render(<ModelSelector selectedModel="" onSelectModelAction={mockOnSelectModelAction} />);

    await waitFor(() => {
      expect(screen.getByTestId('selector-display-text')).toHaveTextContent('Select a model');
    });

    document.dispatchEvent(new CustomEvent('trigger-clicked'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load models');
    });
  });

  test('filters models based on search query', async () => {
    (fetchModels as jest.Mock).mockImplementation(mockFetchModelsSuccess);

    render(<ModelSelector selectedModel="" onSelectModelAction={mockOnSelectModelAction} />);

    await waitFor(() => {
      expect(screen.getByTestId('selector-display-text')).toHaveTextContent('Select a model');
    });

    document.dispatchEvent(new CustomEvent('trigger-clicked'));

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'claude' } });

    await waitFor(() => {
      expect(screen.getByTestId('model-option-anthropic/claude-3-opus')).toBeInTheDocument();
      expect(screen.getByTestId('model-option-anthropic/claude-3-sonnet')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('model-option-openai/gpt-4o')).not.toBeInTheDocument();
    });
  });

  test('calls onSelectModelAction with correct model ID when selected', async () => {
    (fetchModels as jest.Mock).mockImplementation(mockFetchModelsSuccess);

    render(<ModelSelector selectedModel="" onSelectModelAction={mockOnSelectModelAction} />);

    await waitFor(() => {
      expect(screen.getByTestId('selector-display-text')).toHaveTextContent('Select a model');
    });

    document.dispatchEvent(new CustomEvent('trigger-clicked'));

    const modelOption = await screen.findByTestId('model-option-openai/gpt-4o');
    fireEvent.click(modelOption);

    expect(mockOnSelectModelAction).toHaveBeenCalledWith('openai/gpt-4o');
  });
});
