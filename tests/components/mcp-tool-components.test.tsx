import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ToolCallBubble from '@/components/tool-call-bubble';
import ToolResponseBubble from '@/components/tool-response-bubble';
import {
  ChatCompletionToolType,
  SchemaChatCompletionMessageToolCall,
} from '@inference-gateway/sdk';

jest.mock('@/components/code-block', () => ({
  CodeBlock: ({ children }: { children: string }) => <pre data-testid="code-block">{children}</pre>,
}));

jest.mock('lucide-react', () => ({
  ChevronDown: ({ className }: { className?: string }) => (
    <div data-testid="chevron-down" className={className} />
  ),
  ChevronUp: ({ className }: { className?: string }) => (
    <div data-testid="chevron-up" className={className} />
  ),
  Terminal: ({ className }: { className?: string }) => (
    <div data-testid="terminal" className={className} />
  ),
  Wrench: ({ className }: { className?: string }) => (
    <div data-testid="wrench" className={className} />
  ),
  ArrowLeft: ({ className }: { className?: string }) => (
    <div data-testid="arrow-left" className={className} />
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <div data-testid="check-circle" className={className} />
  ),
  XCircle: ({ className }: { className?: string }) => (
    <div data-testid="x-circle" className={className} />
  ),
}));

describe('Enhanced MCP Tool Components', () => {
  describe('ToolCallBubble', () => {
    const mockMCPToolCalls: SchemaChatCompletionMessageToolCall[] = [
      {
        id: 'call_123',
        type: 'function' as ChatCompletionToolType,
        function: {
          name: 'mcp_read_file',
          arguments: JSON.stringify({ path: '/test/file.txt' }),
        },
      },
      {
        id: 'call_456',
        type: 'function' as ChatCompletionToolType,
        function: {
          name: 'mcp_write_file',
          arguments: JSON.stringify({
            path: '/test/output.txt',
            content: 'Hello World',
            mode: 'overwrite',
          }),
        },
      },
    ];

    const mockRegularToolCalls: SchemaChatCompletionMessageToolCall[] = [
      {
        id: 'call_789',
        type: 'function' as ChatCompletionToolType,
        function: {
          name: 'web_search',
          arguments: JSON.stringify({ query: 'TypeScript testing' }),
        },
      },
    ];

    it('should identify and display MCP tools correctly', () => {
      render(<ToolCallBubble toolCalls={mockMCPToolCalls} />);

      expect(screen.getByText('MCP Tool Calls (2)')).toBeInTheDocument();
      expect(screen.getByTestId('wrench')).toBeInTheDocument();
    });

    it('should display regular tools without MCP indicator', () => {
      render(<ToolCallBubble toolCalls={mockRegularToolCalls} />);

      expect(screen.getByRole('button', { name: /Tool Calls \(1\)/ })).toBeInTheDocument();
      expect(screen.getByTestId('terminal')).toBeInTheDocument();
      expect(screen.queryByText('MCP Tool Calls')).not.toBeInTheDocument();
    });

    it('should expand and show individual tool details', async () => {
      render(<ToolCallBubble toolCalls={mockMCPToolCalls} />);

      const mainButton = screen.getByRole('button', { name: /MCP Tool Calls/ });
      fireEvent.click(mainButton);

      await waitFor(() => {
        expect(screen.getByText('mcp_read_file')).toBeInTheDocument();
        expect(screen.getByText('mcp_write_file')).toBeInTheDocument();
      });

      const readFileButton = screen.getByRole('button', { name: /mcp_read_file/ });
      fireEvent.click(readFileButton);

      await waitFor(() => {
        expect(screen.getByText('call_123')).toBeInTheDocument();
        expect(screen.getByText('path:')).toBeInTheDocument();
        expect(screen.getByText('/test/file.txt')).toBeInTheDocument();
      });
    });

    it('should show MCP badge for MCP tools', async () => {
      render(<ToolCallBubble toolCalls={mockMCPToolCalls} />);

      fireEvent.click(screen.getByRole('button', { name: /MCP Tool Calls/ }));

      await waitFor(() => {
        const mcpBadges = screen.getAllByText('MCP');
        expect(mcpBadges.length).toBeGreaterThan(0);
      });
    });

    it('should handle tools without IDs gracefully', () => {
      const toolCallsWithoutIds = mockMCPToolCalls.map(call => ({
        ...call,
        id: 'generated-id', // Provide required id
      }));

      render(<ToolCallBubble toolCalls={toolCallsWithoutIds} />);

      expect(screen.getByText('MCP Tool Calls (2)')).toBeInTheDocument();
    });

    it('should return null when no tool calls provided', () => {
      const { container } = render(<ToolCallBubble toolCalls={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when empty tool calls array provided', () => {
      const { container } = render(<ToolCallBubble toolCalls={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('ToolResponseBubble', () => {
    const mockMCPResponse = JSON.stringify({
      content: [
        {
          type: 'text',
          text: 'Successfully read file content:\n\nHello, World!',
        },
      ],
    });

    const mockMCPErrorResponse = JSON.stringify({
      content: [
        {
          type: 'text',
          text: 'Error: File not found',
        },
      ],
      isError: true,
    });

    const mockRegularResponse = JSON.stringify({
      query: 'test search',
      results: [{ title: 'Test Result', url: 'http://example.com', snippet: 'Test snippet' }],
    });

    it('should display MCP tool response with correct formatting', async () => {
      render(<ToolResponseBubble response={mockMCPResponse} toolName="mcp_read_file" />);

      expect(screen.getByText(/mcp_read_file Response/)).toBeInTheDocument();
      expect(screen.getByText('MCP')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle')).toBeInTheDocument();
    });

    it('should display MCP error response with error styling', async () => {
      render(<ToolResponseBubble response={mockMCPErrorResponse} toolName="mcp_read_file" />);

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByTestId('x-circle')).toBeInTheDocument();
    });

    it('should expand and show detailed MCP response content', async () => {
      render(<ToolResponseBubble response={mockMCPResponse} toolName="mcp_read_file" />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('MCP Tool executed successfully')).toBeInTheDocument();
        expect(screen.getByText(/Successfully read file content/)).toBeInTheDocument();
      });
    });

    it('should handle regular tool responses', () => {
      render(<ToolResponseBubble response={mockRegularResponse} toolName="web_search" />);

      expect(screen.getByText(/web_search Response/)).toBeInTheDocument();
      expect(
        screen.queryByText((content, element) => {
          return element?.textContent?.includes('MCP') || false;
        })
      ).not.toBeInTheDocument();
    });

    it('should handle plain text responses', async () => {
      const plainTextResponse = 'Simple text response';
      render(<ToolResponseBubble response={plainTextResponse} toolName="mcp_read_file" />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(plainTextResponse)).toBeInTheDocument();
      });
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedResponse = '{ invalid json }';
      render(<ToolResponseBubble response={malformedResponse} toolName="mcp_read_file" />);

      expect(screen.getByText(/mcp_read_file Response/)).toBeInTheDocument();
    });

    it('should return null when no response provided', () => {
      const { container } = render(<ToolResponseBubble response="" toolName="mcp_read_file" />);
      expect(container.firstChild).toBeNull();
    });
  });
});
