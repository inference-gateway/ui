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
        name: 'test_tool',
        arguments: '{"param":"value"}',
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
    const button = screen.getByRole('button');

    expect(screen.queryByTestId('code-block')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByTestId('code-block')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByTestId('code-block')).not.toBeInTheDocument();
  });

  test('displays formatted JSON when expanded', () => {
    render(<ToolCallBubble toolCalls={mockToolCalls} />);
    fireEvent.click(screen.getByRole('button'));

    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent(/test_tool/);
    expect(codeBlock).toHaveTextContent(/param/);
    expect(codeBlock).toHaveTextContent(/value/);
  });

  test('handles multiple tool calls correctly', () => {
    const multipleToolCalls: SchemaChatCompletionMessageToolCall[] = [
      ...mockToolCalls,
      {
        id: 'call_2',
        type: 'function' as ChatCompletionToolType.function,
        function: {
          name: 'another_tool',
          arguments: '{"another":"value"}',
        },
      },
    ];

    render(<ToolCallBubble toolCalls={multipleToolCalls} />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Tool Calls (2)');

    fireEvent.click(button);
    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toHaveTextContent(/test_tool/);
    expect(codeBlock).toHaveTextContent(/another_tool/);
  });
});
