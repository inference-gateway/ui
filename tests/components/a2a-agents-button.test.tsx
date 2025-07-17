import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { A2AAgentsButton } from '@/components/a2a-agents-button';
import { fetchA2AAgents } from '@/lib/api';
import type { A2AAgent } from '@/types/a2a';

// Mock the API module
jest.mock('@/lib/api', () => ({
  fetchA2AAgents: jest.fn(),
}));

// Mock the dialog components
jest.mock('@/components/a2a-agents-dialog', () => ({
  A2AAgentsDialog: ({ open, onOpenChangeAction, agents, isLoading, error, onRefreshAction }: {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    agents: A2AAgent[];
    isLoading: boolean;
    error: string | null;
    onRefreshAction: () => void;
  }) => {
    return open ? (
      <div data-testid="a2a-dialog">
        <div data-testid="agent-count">{agents.length}</div>
        <div data-testid="loading-state">{isLoading ? 'loading' : 'not-loading'}</div>
        <div data-testid="error-state">{error || 'no-error'}</div>
        <button onClick={() => onOpenChangeAction(false)}>Close</button>
        <button onClick={onRefreshAction}>Refresh</button>
      </div>
    ) : null;
  },
}));

// Mock the error boundary
jest.mock('@/components/a2a-error-boundary', () => ({
  A2AErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockFetchA2AAgents = fetchA2AAgents as jest.MockedFunction<typeof fetchA2AAgents>;

describe('A2AAgentsButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAgents: A2AAgent[] = [
    {
      id: 'agent1',
      name: 'Test Agent 1',
      description: 'Test description 1',
      url: 'https://agent1.example.com',
      status: 'available',
      version: '1.0.0',
    },
    {
      id: 'agent2',
      name: 'Test Agent 2',
      description: 'Test description 2',
      url: 'https://agent2.example.com',
      status: 'unavailable',
      version: '1.0.0',
    },
  ];

  test('renders button with loading state initially', () => {
    mockFetchA2AAgents.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<A2AAgentsButton />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Error loading A2A agents: ');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
  });

  test('renders button with agent count after successful load', async () => {
    mockFetchA2AAgents.mockResolvedValue({
      data: mockAgents,
      object: 'list',
    });

    render(<A2AAgentsButton />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', '1 A2A agent available');
    expect(screen.getByText('1')).toBeInTheDocument(); // Badge count
  });

  test('renders button with error state when API fails', async () => {
    const errorMessage = 'Failed to fetch agents';
    mockFetchA2AAgents.mockRejectedValue(new Error(errorMessage));

    render(<A2AAgentsButton />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', `Error loading A2A agents: ${errorMessage}`);
    expect(screen.queryByText('1')).not.toBeInTheDocument(); // No badge
  });

  test('opens dialog when button is clicked', async () => {
    mockFetchA2AAgents.mockResolvedValue({
      data: mockAgents,
      object: 'list',
    });

    render(<A2AAgentsButton />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('a2a-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('agent-count')).toHaveTextContent('2');
  });

  test('closes dialog when close button is clicked', async () => {
    mockFetchA2AAgents.mockResolvedValue({
      data: mockAgents,
      object: 'list',
    });

    render(<A2AAgentsButton />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    // Open dialog
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('a2a-dialog')).toBeInTheDocument();

    // Close dialog
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('a2a-dialog')).not.toBeInTheDocument();
  });

  test('handles refresh action from dialog', async () => {
    mockFetchA2AAgents.mockResolvedValue({
      data: mockAgents,
      object: 'list',
    });

    render(<A2AAgentsButton />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    // Open dialog
    fireEvent.click(screen.getByRole('button'));
    
    // Clear previous calls
    mockFetchA2AAgents.mockClear();
    
    // Trigger refresh
    fireEvent.click(screen.getByText('Refresh'));

    expect(mockFetchA2AAgents).toHaveBeenCalledTimes(1);
  });

  test('shows correct badge count for available agents only', async () => {
    const allUnavailableAgents = mockAgents.map(agent => ({
      ...agent,
      status: 'unavailable' as const,
    }));

    mockFetchA2AAgents.mockResolvedValue({
      data: allUnavailableAgents,
      object: 'list',
    });

    render(<A2AAgentsButton />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('displays plural form in title correctly', async () => {
    const multipleAvailableAgents = [
      ...mockAgents,
      {
        id: 'agent3',
        name: 'Test Agent 3',
        description: 'Test description 3',
        url: 'https://agent3.example.com',
        status: 'available' as const,
        version: '1.0.0',
      },
    ];

    mockFetchA2AAgents.mockResolvedValue({
      data: multipleAvailableAgents,
      object: 'list',
    });

    render(<A2AAgentsButton />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', '2 A2A agents available');
  });

  test('handles empty agents list', async () => {
    mockFetchA2AAgents.mockResolvedValue({
      data: [],
      object: 'list',
    });

    render(<A2AAgentsButton />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('aborts request on component unmount', async () => {
    const mockAbortController = {
      abort: jest.fn(),
      signal: { aborted: false } as AbortSignal,
    };

    jest.spyOn(global, 'AbortController').mockImplementation(() => mockAbortController as any);

    mockFetchA2AAgents.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { unmount } = render(<A2AAgentsButton />);

    unmount();

    expect(mockAbortController.abort).toHaveBeenCalled();
  });

  test('handles API response with invalid data gracefully', async () => {
    mockFetchA2AAgents.mockRejectedValue(new Error('Invalid response format from A2A agents API'));

    render(<A2AAgentsButton />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Error loading A2A agents: Invalid response format from A2A agents API');
  });
});