import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { A2AAgentsDialog } from '@/components/a2a-agents-dialog';
import type { A2AAgent } from '@/types/a2a';

// Mock the UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className, ...props }: any) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick, onKeyDown, tabIndex, role, ...props }: any) => (
    <div
      data-testid="agent-card"
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role={role}
      {...props}
    >
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ orientation }: { orientation?: string }) => (
    <hr data-testid="separator" data-orientation={orientation} />
  ),
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert">{children}</div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

const mockAgents: A2AAgent[] = [
  {
    id: 'agent1',
    name: 'Test Agent 1',
    description: 'Test description 1',
    url: 'https://agent1.example.com',
    status: 'available',
    version: '1.0.0',
    skills: [
      {
        id: 'skill1',
        name: 'Test Skill 1',
        description: 'Test skill description 1',
        examples: ['Example 1', 'Example 2'],
        inputModes: ['text'],
        outputModes: ['text'],
        tags: ['tag1', 'tag2'],
      },
    ],
    capabilities: {
      streaming: true,
      pushNotifications: false,
      stateTransitionHistory: true,
    },
    provider: {
      organization: 'Test Org',
      url: 'https://testorg.example.com',
    },
    author: 'Test Author',
    homepage: 'https://homepage.example.com',
    license: 'MIT',
  },
  {
    id: 'agent2',
    name: 'Test Agent 2',
    description: 'Test description 2',
    url: 'https://agent2.example.com',
    status: 'unavailable',
    version: '2.0.0',
    skills: [
      {
        id: 'skill2',
        name: 'Test Skill 2',
        description: 'Test skill description 2',
      },
    ],
  },
];

describe('A2AAgentsDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChangeAction: jest.fn(),
    agents: mockAgents,
    isLoading: false,
    error: null,
    onRefreshAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dialog when open is true', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('A2A Agents');
  });

  test('does not render dialog when open is false', () => {
    render(<A2AAgentsDialog {...defaultProps} open={false} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  test('renders search input', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search agents by name, description, or skills...');
  });

  test('filters agents based on search query', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Agent 1' } });

    const agentCards = screen.getAllByTestId('agent-card');
    expect(agentCards).toHaveLength(1);
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument();
  });

  test('filters agents based on skill search', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Skill 1' } });

    const agentCards = screen.getAllByTestId('agent-card');
    expect(agentCards).toHaveLength(1);
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<A2AAgentsDialog {...defaultProps} isLoading={true} />);

    expect(screen.getByText('Loading A2A agents...')).toBeInTheDocument();
  });

  test('shows error state', () => {
    const errorMessage = 'Failed to load agents';
    render(<A2AAgentsDialog {...defaultProps} error={errorMessage} />);

    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('shows empty state when no agents', () => {
    render(<A2AAgentsDialog {...defaultProps} agents={[]} />);

    expect(screen.getByText('No A2A agents configured')).toBeInTheDocument();
  });

  test('selects agent when clicked', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const agentCards = screen.getAllByTestId('agent-card');
    fireEvent.click(agentCards[0]);

    // Should show agent details
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  test('selects agent with keyboard navigation', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const agentCards = screen.getAllByTestId('agent-card');
    fireEvent.keyDown(agentCards[0], { key: 'Enter' });

    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
  });

  test('shows agent capabilities correctly', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const agentCards = screen.getAllByTestId('agent-card');
    fireEvent.click(agentCards[0]);

    expect(screen.getByText('Capabilities')).toBeInTheDocument();
    expect(screen.getByText('Streaming')).toBeInTheDocument();
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('State Transition History')).toBeInTheDocument();
  });

  test('shows agent skills correctly', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const agentCards = screen.getAllByTestId('agent-card');
    fireEvent.click(agentCards[0]);

    expect(screen.getByText('Skills (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Skill 1')).toBeInTheDocument();
    expect(screen.getByText('Test skill description 1')).toBeInTheDocument();
  });

  test('shows agent provider information', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const agentCards = screen.getAllByTestId('agent-card');
    fireEvent.click(agentCards[0]);

    expect(screen.getByText('Provider:')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();
  });

  test('shows agent URL', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const agentCards = screen.getAllByTestId('agent-card');
    fireEvent.click(agentCards[0]);

    expect(screen.getByText('Agent URL')).toBeInTheDocument();
    expect(screen.getByText('https://agent1.example.com')).toBeInTheDocument();
  });

  test('calls onRefreshAction when refresh button is clicked', () => {
    const mockRefresh = jest.fn();
    render(<A2AAgentsDialog {...defaultProps} onRefreshAction={mockRefresh} />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  test('separates available and unavailable agents', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const dialogDescription = screen.getByTestId('dialog-description');
    expect(dialogDescription).toHaveTextContent('1 available, 1 unavailable');
  });

  test('handles agents without skills', () => {
    const agentsWithoutSkills = [
      {
        id: 'agent3',
        name: 'Agent Without Skills',
        description: 'Test description',
        url: 'https://agent3.example.com',
        status: 'available' as const,
        version: '1.0.0',
      },
    ];

    render(<A2AAgentsDialog {...defaultProps} agents={agentsWithoutSkills} />);

    const agentCards = screen.getAllByTestId('agent-card');
    fireEvent.click(agentCards[0]);

    expect(screen.getByText('Skills (0)')).toBeInTheDocument();
    expect(screen.getByText('No skills configured for this agent')).toBeInTheDocument();
  });

  test('handles keyboard navigation with Space key', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const agentCards = screen.getAllByTestId('agent-card');
    fireEvent.keyDown(agentCards[0], { key: ' ' });

    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
  });

  test('trims whitespace from search query', () => {
    render(<A2AAgentsDialog {...defaultProps} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: '  Agent 1  ' } });

    const agentCards = screen.getAllByTestId('agent-card');
    expect(agentCards).toHaveLength(1);
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
  });
});