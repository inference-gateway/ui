import { render, screen, fireEvent } from '@testing-library/react';
import ToolResponseBubble from '@/components/tool-response-bubble';

jest.mock('@/components/code-block', () => ({
  CodeBlock: ({ children }: { children: string }) => <pre data-testid="code-block">{children}</pre>,
}));

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
});
