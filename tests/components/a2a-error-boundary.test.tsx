import React, { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { A2AErrorBoundary } from '@/components/a2a-error-boundary';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: ReactNode }) => (
    <div data-testid="error-card">{children}</div>
  ),
  CardHeader: ({ children }: { children: ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardDescription: ({ children }: { children: ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children, open }: { children: ReactNode; open: boolean }) => (
    <div data-testid="collapsible" data-open={open}>
      {children}
    </div>
  ),
  CollapsibleContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="collapsible-content">{children}</div>
  ),
  CollapsibleTrigger: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button data-testid="collapsible-trigger" onClick={onClick}>
      {children}
    </button>
  ),
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div data-testid="working-component">Working component</div>;
};

describe('A2AErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when no error occurs', () => {
    render(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={false} />
      </A2AErrorBoundary>
    );

    expect(screen.getByTestId('working-component')).toBeInTheDocument();
    expect(screen.queryByTestId('error-card')).not.toBeInTheDocument();
  });

  test('renders error UI when error occurs', () => {
    render(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={true} />
      </A2AErrorBoundary>
    );

    expect(screen.getByTestId('error-card')).toBeInTheDocument();
    expect(screen.getByText('A2A Component Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong with the A2A component.')).toBeInTheDocument();
    expect(screen.queryByTestId('working-component')).not.toBeInTheDocument();
  });

  test('shows retry button when error occurs', () => {
    render(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={true} />
      </A2AErrorBoundary>
    );

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveAttribute('data-testid', 'button');
  });

  test('retries rendering when retry button is clicked', () => {
    let shouldThrow = true;
    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;

    const { rerender } = render(
      <A2AErrorBoundary>
        <TestComponent />
      </A2AErrorBoundary>
    );

    // Initially shows error
    expect(screen.getByTestId('error-card')).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // After retry, should still show error since shouldThrow is still true
    expect(screen.getByTestId('error-card')).toBeInTheDocument();

    // Now fix the error and rerender
    shouldThrow = false;
    rerender(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </A2AErrorBoundary>
    );

    // Should show working component now
    expect(screen.getByTestId('working-component')).toBeInTheDocument();
    expect(screen.queryByTestId('error-card')).not.toBeInTheDocument();
  });

  test('shows error details toggle button', () => {
    render(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={true} />
      </A2AErrorBoundary>
    );

    const toggleButton = screen.getByText('Show Error Details');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('data-testid', 'collapsible-trigger');
  });

  test('toggles error details when clicked', () => {
    render(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={true} />
      </A2AErrorBoundary>
    );

    const toggleButton = screen.getByText('Show Error Details');
    const collapsible = screen.getByTestId('collapsible');

    // Initially closed
    expect(collapsible).toHaveAttribute('data-open', 'false');

    // Click to open
    fireEvent.click(toggleButton);
    expect(collapsible).toHaveAttribute('data-open', 'true');

    // Should show error details
    expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
    expect(screen.getByText('Hide Error Details')).toBeInTheDocument();
  });

  test('shows error message in details', () => {
    render(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={true} />
      </A2AErrorBoundary>
    );

    // Open error details
    const toggleButton = screen.getByText('Show Error Details');
    fireEvent.click(toggleButton);

    // Should show the error message
    expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
  });

  test('shows stack trace in details', () => {
    render(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={true} />
      </A2AErrorBoundary>
    );

    // Open error details
    const toggleButton = screen.getByText('Show Error Details');
    fireEvent.click(toggleButton);

    // Should show stack trace (containing the error location)
    expect(screen.getByText(/ThrowError/)).toBeInTheDocument();
  });

  test('resets error state when retry is clicked', () => {
    const { rerender } = render(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={true} />
      </A2AErrorBoundary>
    );

    expect(screen.getByTestId('error-card')).toBeInTheDocument();

    // Click retry
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // Rerender with non-throwing component
    rerender(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={false} />
      </A2AErrorBoundary>
    );

    // Should show working component
    expect(screen.getByTestId('working-component')).toBeInTheDocument();
    expect(screen.queryByTestId('error-card')).not.toBeInTheDocument();
  });

  test('handles errors without error info', () => {
    // Create a component that throws an error without componentStack
    class ErrorComponent extends React.Component {
      componentDidMount() {
        throw new Error('Test error');
      }

      render() {
        return <div>Should not render</div>;
      }
    }

    render(
      <A2AErrorBoundary>
        <ErrorComponent />
      </A2AErrorBoundary>
    );

    expect(screen.getByTestId('error-card')).toBeInTheDocument();
    expect(screen.getByText('A2A Component Error')).toBeInTheDocument();
  });

  test('handles multiple error states correctly', () => {
    let shouldThrow = true;
    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;

    const { rerender } = render(
      <A2AErrorBoundary>
        <TestComponent />
      </A2AErrorBoundary>
    );

    // First error
    expect(screen.getByTestId('error-card')).toBeInTheDocument();

    // Fix error
    shouldThrow = false;
    rerender(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </A2AErrorBoundary>
    );

    // Should show working component
    expect(screen.getByTestId('working-component')).toBeInTheDocument();

    // Throw error again
    shouldThrow = true;
    rerender(
      <A2AErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </A2AErrorBoundary>
    );

    // Should show error again
    expect(screen.getByTestId('error-card')).toBeInTheDocument();
  });
});