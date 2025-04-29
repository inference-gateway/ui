import { render, screen } from '@testing-library/react';
import { TokenUsage } from '@/components/token-usage';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(),
}));

describe('TokenUsage Component', () => {
  const mockTokenUsage: SchemaCompletionUsage = {
    prompt_tokens: 50,
    completion_tokens: 75,
    total_tokens: 125,
  };

  test('renders token usage information correctly', () => {
    require('@/hooks/use-mobile').useIsMobile.mockReturnValue(false);

    render(<TokenUsage tokenUsage={mockTokenUsage} />);

    expect(screen.getByText('Tokens: 125')).toBeInTheDocument();
    expect(screen.getByText('(50 prompt / 75 completion)')).toBeInTheDocument();
  });

  test('hides detailed breakdown on mobile', () => {
    require('@/hooks/use-mobile').useIsMobile.mockReturnValue(true);

    render(<TokenUsage tokenUsage={mockTokenUsage} />);

    expect(screen.getByText('Tokens: 125')).toBeInTheDocument();
    expect(screen.queryByText('(50 prompt / 75 completion)')).not.toBeInTheDocument();
  });

  test('applies custom class name when provided', () => {
    require('@/hooks/use-mobile').useIsMobile.mockReturnValue(false);

    const { container } = render(
      <TokenUsage tokenUsage={mockTokenUsage} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('respects showDetailedBreakdown prop', () => {
    require('@/hooks/use-mobile').useIsMobile.mockReturnValue(false);

    render(<TokenUsage tokenUsage={mockTokenUsage} showDetailedBreakdown={false} />);

    expect(screen.getByText('Tokens: 125')).toBeInTheDocument();
    expect(screen.queryByText('(50 prompt / 75 completion)')).not.toBeInTheDocument();
  });

  test('handles zero values gracefully', () => {
    require('@/hooks/use-mobile').useIsMobile.mockReturnValue(false);

    const emptyTokenUsage: SchemaCompletionUsage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    render(<TokenUsage tokenUsage={emptyTokenUsage} />);

    expect(screen.getByText('Tokens: 0')).toBeInTheDocument();
    expect(screen.getByText('(0 prompt / 0 completion)')).toBeInTheDocument();
  });
});
