import { render, screen, fireEvent } from '@testing-library/react';
import {
  SchemaChatCompletionMessageToolCall,
  ChatCompletionToolType,
} from '@inference-gateway/sdk';
import ToolCallBubble from '@/components/tool-call-bubble';

jest.mock('@/components/code-block', () => ({
  CodeBlock: ({ children }: { children: string }) => <pre data-testid="code-block">{children}</pre>,
}));

describe('ToolCallBubble', () => {
  const mockToolCalls: SchemaChatCompletionMessageToolCall[] = [
    {
      id: 'call_1',
      type: 'function' as ChatCompletionToolType.function,
      function: {
        name: 'web_search',
        arguments: '{"query":"test search"}',
      },
    },
  ];

  test('renders nothing when no tool calls provided', () => {
    const { container } = render(<ToolCallBubble toolCalls={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when empty tool calls array', () => {
    const { container } = render(<ToolCallBubble toolCalls={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('shows correct tool call count in header', () => {
    render(<ToolCallBubble toolCalls={mockToolCalls} />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Tool Calls (1)');
  });

  test('toggles expand/collapse state', () => {
    render(<ToolCallBubble toolCalls={mockToolCalls} />);
    const mainButton = screen.getByRole('button', { name: /Tool Calls/ });

    expect(screen.queryByText('Call ID:')).not.toBeInTheDocument();

    fireEvent.click(mainButton);

    const toolButton = screen.getByRole('button', { name: /web_search/ });
    expect(toolButton).toBeInTheDocument();

    fireEvent.click(toolButton);
    expect(screen.getByText('Call ID:')).toBeInTheDocument();
    expect(screen.getByTestId('code-block')).toBeInTheDocument();

    fireEvent.click(toolButton);
    expect(screen.queryByTestId('code-block')).not.toBeInTheDocument();
  });

  test('displays formatted JSON when expanded', () => {
    render(<ToolCallBubble toolCalls={mockToolCalls} />);

    fireEvent.click(screen.getByRole('button', { name: /Tool Calls/ }));

    const toolButton = screen.getByRole('button', { name: /web_search/ });
    fireEvent.click(toolButton);

    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent(/query/);
    expect(codeBlock).toHaveTextContent(/test search/);
  });

  test('handles multiple tool calls correctly', () => {
    const multipleToolCalls: SchemaChatCompletionMessageToolCall[] = [
      ...mockToolCalls,
      {
        id: 'call_2',
        type: 'function' as ChatCompletionToolType.function,
        function: {
          name: 'fetch_page',
          arguments: '{"url":"https://example.com"}',
        },
      },
    ];

    render(<ToolCallBubble toolCalls={multipleToolCalls} />);
    const mainButton = screen.getByRole('button', { name: /Tool Calls/ });
    expect(mainButton).toHaveTextContent('Tool Calls (2)');

    fireEvent.click(mainButton);

    expect(screen.getByRole('button', { name: /web_search/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fetch_page/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /web_search/ }));
    const codeBlocks = screen.getAllByTestId('code-block');
    expect(codeBlocks.length).toBe(1);
    expect(codeBlocks[0]).toHaveTextContent(/query/);
  });
});
