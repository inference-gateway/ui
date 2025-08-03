import { render, screen, fireEvent } from '@testing-library/react';
import ToolResponseBubble from '@/components/tool-response-bubble';

jest.mock('@/components/code-block', () => ({
  CodeBlock: ({ children }: { children: string }) => <pre data-testid="code-block">{children}</pre>,
}));

// Note: Not mocking @/lib/tools anymore since we're using real prefix-based detection

describe('ToolResponseBubble', () => {

  const jsonResponse = JSON.stringify({
    results: [
      {
        title: 'Test Result',
        url: 'https://example.com',
        snippet: 'This is a test snippet',
      },
    ],
  });

  describe('Regular Tools', () => {
    test('renders tool response header', () => {
      render(<ToolResponseBubble response={jsonResponse} toolName="web_search" />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('web_search Response');
    });

    test('renders nothing for empty content', () => {
      const { container } = render(<ToolResponseBubble response="" toolName="web_search" />);
      expect(container.firstChild).toBeNull();
    });

    test('renders collapsible content', () => {
      const validResponse = JSON.stringify({
        results: [
          {
            title: 'Test Result',
            url: 'https://example.com',
            snippet: 'This is a test result',
          },
        ],
      });

      render(<ToolResponseBubble response={validResponse} toolName="web_search" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('web_search Response');
    });

    test('expands and shows content when clicked', () => {
      render(<ToolResponseBubble response={jsonResponse} toolName="web_search" />);
      const button = screen.getByRole('button');

      expect(screen.queryByTestId('code-block')).not.toBeInTheDocument();

      fireEvent.click(button);
      expect(screen.getByTestId('code-block')).toBeInTheDocument();
      expect(screen.getByTestId('code-block')).toHaveTextContent(/Test Result/);
    });

    test('handles error responses for regular tools', () => {
      const errorResponse = JSON.stringify({
        error: 'Tool execution failed',
      });

      render(<ToolResponseBubble response={errorResponse} toolName="web_search" />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('bg-red-50', 'border-red-200');
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('A2A Tools', () => {
    test('renders A2A tool badge and success message', () => {
      const a2aResponse = JSON.stringify({
        content: [{ type: 'text', text: 'Task completed successfully' }],
        isError: false,
      });

      render(<ToolResponseBubble response={a2aResponse} toolName="a2a_submit_task_to_agent" />);

      expect(screen.getByText('A2A')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('A2A Tool executed successfully')).toBeInTheDocument();
    });

    test('handles A2A tool errors', () => {
      const a2aErrorResponse = JSON.stringify({
        content: [{ type: 'text', text: 'Agent execution failed' }],
        isError: true,
      });

      render(<ToolResponseBubble response={a2aErrorResponse} toolName="a2a_submit_task_to_agent" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-50', 'border-red-200');
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('A2A')).toBeInTheDocument();
    });

    test('handles plain text A2A responses', () => {
      const plainTextResponse = 'Task completed successfully';

      render(<ToolResponseBubble response={plainTextResponse} toolName="a2a_submit_task_to_agent" />);

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('A2A Tool executed successfully')).toBeInTheDocument();
      expect(screen.getByText(plainTextResponse)).toBeInTheDocument();
    });

    test('handles malformed A2A JSON responses', () => {
      const malformedResponse = 'invalid json {';

      render(<ToolResponseBubble response={malformedResponse} toolName="a2a_submit_task_to_agent" />);

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('A2A Tool executed successfully')).toBeInTheDocument();
      expect(screen.getByText(malformedResponse)).toBeInTheDocument();
    });
  });

  describe('MCP Tools', () => {
    test('renders MCP tool badge and success message', () => {
      const mcpResponse = JSON.stringify({
        content: [{ type: 'text', text: 'MCP operation completed' }],
        isError: false,
      });

      render(<ToolResponseBubble response={mcpResponse} toolName="mcp_filesystem_read" />);

      expect(screen.getByText('MCP')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('MCP Tool executed successfully')).toBeInTheDocument();
    });

    test('handles MCP tool errors', () => {
      const mcpErrorResponse = JSON.stringify({
        content: [{ type: 'text', text: 'MCP operation failed' }],
        isError: true,
      });

      render(<ToolResponseBubble response={mcpErrorResponse} toolName="mcp_filesystem_read" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-50', 'border-red-200');
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('MCP')).toBeInTheDocument();
    });

    test('handles MCP responses without content', () => {
      const mcpResponse = JSON.stringify({
        isError: false,
      });

      render(<ToolResponseBubble response={mcpResponse} toolName="mcp_filesystem_read" />);

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('MCP Tool executed successfully')).toBeInTheDocument();
    });

    test('handles plain text MCP responses', () => {
      const plainTextResponse = 'MCP operation completed';

      render(<ToolResponseBubble response={plainTextResponse} toolName="mcp_filesystem_read" />);

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('MCP Tool executed successfully')).toBeInTheDocument();
      expect(screen.getByText(plainTextResponse)).toBeInTheDocument();
    });
  });

  describe('Response Formatting', () => {
    test('displays formatted JSON for complex responses', () => {
      const complexResponse = JSON.stringify({
        content: [{ type: 'text', text: '{"result": "complex data"}' }],
        isError: false,
      });

      render(<ToolResponseBubble response={complexResponse} toolName="mcp_filesystem_read" />);

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByTestId('code-block')).toBeInTheDocument();
    });

    test('displays plain text for simple responses', () => {
      const simpleResponse = 'Simple text response';

      render(<ToolResponseBubble response={simpleResponse} toolName="a2a_submit_task_to_agent" />);

      fireEvent.click(screen.getByRole('button'));
      expect(screen.queryByTestId('code-block')).not.toBeInTheDocument();
      expect(screen.getByText(simpleResponse)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty response gracefully', () => {
      const { container } = render(<ToolResponseBubble response="" />);
      expect(container.firstChild).toBeNull();
    });

    test('handles null response gracefully', () => {
      const { container } = render(<ToolResponseBubble response={null as unknown as string} />);
      expect(container.firstChild).toBeNull();
    });

    test('handles undefined toolName', () => {
      render(<ToolResponseBubble response="test response" />);
      expect(screen.getByText('Tool Response')).toBeInTheDocument();
    });

    test('toggles expansion state correctly', () => {
      render(<ToolResponseBubble response="test response" toolName="test_tool" />);

      const button = screen.getByRole('button');

      expect(screen.queryByText('test response')).not.toBeInTheDocument();

      fireEvent.click(button);
      expect(screen.getByText('test response')).toBeInTheDocument();

      fireEvent.click(button);
      expect(screen.queryByText('test response')).not.toBeInTheDocument();
    });
  });
});
