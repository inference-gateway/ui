import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MCPToolsButton } from '@/components/mcp-tools-button';
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
  } as unknown as MCPTool,
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
  } as unknown as MCPTool,
  {
    name: 'execute_code',
    description: 'Execute code in a sandbox environment',
    server: 'https://localhost:3002/mcp',
    input_schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Code to execute',
        },
        language: {
          type: 'string',
          description: 'Programming language',
          enum: ['python', 'javascript', 'bash'],
        },
      },
      required: ['code'],
    },
  } as unknown as MCPTool,
];

describe('MCPToolsButton with tool count', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays tool count when tools are available', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: mockTools,
    });

    await act(async () => {
      render(<MCPToolsButton />);
    });

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /mcp tools/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('displays zero count when no tools are available', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: [],
    });

    await act(async () => {
      render(<MCPToolsButton />);
    });

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /mcp tools/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('hides count while loading tools', async () => {
    mockFetchMCPTools.mockImplementation(() => new Promise(() => {}));

    await act(async () => {
      render(<MCPToolsButton />);
    });

    const button = screen.getByRole('button', { name: /mcp tools/i });
    expect(button).toBeInTheDocument();
    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
  });

  it('hides count when API call fails', async () => {
    mockFetchMCPTools.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<MCPToolsButton />);
    });

    const button = screen.getByRole('button', { name: /mcp tools/i });
    expect(button).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });
  });

  it('updates count when tools data changes on dialog open/close', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: [mockTools[0]],
    });

    await act(async () => {
      render(<MCPToolsButton />);
    });

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: mockTools,
    });

    const button = screen.getByRole('button', { name: /mcp tools/i });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    const closeButton = closeButtons.find(button => button.textContent?.includes('Close'));
    expect(closeButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(closeButton!);
    });

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('maintains accessibility with tool count displayed', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: mockTools,
    });

    await act(async () => {
      render(<MCPToolsButton />);
    });

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /mcp tools/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'MCP Tools');

      const countElement = screen.getByText('3');
      expect(countElement).toBeInTheDocument();
    });
  });

  it('handles mobile vs desktop layouts correctly with count', async () => {
    mockFetchMCPTools.mockResolvedValue({
      object: 'list',
      data: mockTools,
    });

    let result;
    await act(async () => {
      result = render(<MCPToolsButton isMobile={true} />);
    });
    const { rerender } = result!;

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /mcp tools/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    await act(async () => {
      rerender(<MCPToolsButton isMobile={false} />);
    });

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /mcp tools/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});
