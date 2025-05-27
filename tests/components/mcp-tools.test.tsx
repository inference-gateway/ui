import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MCPToolsButton } from '@/components/mcp-tools-button';
import { MCPToolsDialog } from '@/components/mcp-tools-dialog';
import { fetchMCPTools } from '@/lib/api';
import type { MCPTool } from '@/types/mcp';

jest.mock('@/lib/api', () => ({
  fetchMCPTools: jest.fn(),
}));

const mockFetchMCPTools = fetchMCPTools as jest.MockedFunction<typeof fetchMCPTools>;
const mockTools: MCPTool[] = [
  {
    name: 'filesystem_read',
    description: 'Read file contents from the filesystem',
    server: 'https://localhost:3000/mcp',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to read',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'web_search',
    description: 'Search the web for information',
    server: 'https://localhost:3001/mcp',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
];

describe('MCPToolsButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: [],
    });
  });

  it('renders MCP tools button with correct label', async () => {
    await act(async () => {
      render(<MCPToolsButton />);
    });

    const button = screen.getByRole('button', { name: /mcp tools/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'MCP Tools');
  });

  it('displays tools icon', async () => {
    await act(async () => {
      render(<MCPToolsButton />);
    });

    const button = screen.getByRole('button', { name: /mcp tools/i });
    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('opens MCP tools dialog when clicked', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: mockTools,
    });

    await act(async () => {
      render(<MCPToolsButton />);
    });

    const button = screen.getByRole('button', { name: /mcp tools/i });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('MCP Tools')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockFetchMCPTools.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<MCPToolsButton />);
    });

    const button = screen.getByRole('button', { name: /mcp tools/i });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByText(/error loading mcp tools/i)).toBeInTheDocument();
    });
  });
});

describe('MCPToolsDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state while fetching tools', async () => {
    mockFetchMCPTools.mockImplementation(() => new Promise(() => {}));

    render(<MCPToolsDialog open={true} onOpenChange={() => {}} />);

    expect(screen.getByText(/loading mcp tools/i)).toBeInTheDocument();
  });

  it('displays tools list when loaded successfully', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: mockTools,
    });

    render(<MCPToolsDialog open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('filesystem_read')).toBeInTheDocument();
      expect(screen.getByText('web_search')).toBeInTheDocument();
      expect(screen.getByText('Read file contents from the filesystem')).toBeInTheDocument();
      expect(screen.getByText('Search the web for information')).toBeInTheDocument();
    });
  });

  it('displays tool schemas in expandable sections', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: mockTools,
    });

    render(<MCPToolsDialog open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading mcp tools/i)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('filesystem_read')).toBeInTheDocument();
    });

    const expandButton = await screen.findByRole('button', {
      name: /view schema for filesystem_read/i,
    });
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText(/properties/)).toBeInTheDocument();
      expect(screen.getByText(/path/)).toBeInTheDocument();
      expect(screen.getByText(/string/)).toBeInTheDocument();
    });
  });

  it('displays empty state when no tools available', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: [],
    });

    render(<MCPToolsDialog open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/no mcp tools available/i)).toBeInTheDocument();
    });
  });

  it('displays error state when API call fails', async () => {
    mockFetchMCPTools.mockRejectedValue(new Error('Failed to fetch tools'));

    render(<MCPToolsDialog open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/error loading mcp tools/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch tools/i)).toBeInTheDocument();
    });
  });

  it('allows retrying after error', async () => {
    mockFetchMCPTools.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce({
      object: 'list',
      data: mockTools,
    });

    render(<MCPToolsDialog open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/error loading mcp tools/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('filesystem_read')).toBeInTheDocument();
      expect(screen.getByText('web_search')).toBeInTheDocument();
    });
  });

  it('calls onOpenChange when dialog is closed', async () => {
    const onOpenChange = jest.fn();
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: mockTools,
    });

    render(<MCPToolsDialog open={true} onOpenChange={onOpenChange} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading mcp tools/i)).not.toBeInTheDocument();
    });

    const closeButtons = screen.getAllByRole('button');
    const footerCloseButton = closeButtons.find(button => {
      const textContent = button.textContent;
      return textContent?.includes('Close') && !button.querySelector('[class*="sr-only"]');
    });

    expect(footerCloseButton).toBeInTheDocument();
    fireEvent.click(footerCloseButton!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('filters tools based on search input', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: mockTools,
    });

    render(<MCPToolsDialog open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading mcp tools/i)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('filesystem_read')).toBeInTheDocument();
      expect(screen.getByText('web_search')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search tools/i);
    fireEvent.change(searchInput, { target: { value: 'filesystem' } });

    expect(screen.getByText('filesystem_read')).toBeInTheDocument();
    expect(screen.queryByText('web_search')).not.toBeInTheDocument();
  });

  it('displays tool count in header', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: mockTools,
    });

    render(<MCPToolsDialog open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading mcp tools/i)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('2 tools available')).toBeInTheDocument();
    });
  });
});
