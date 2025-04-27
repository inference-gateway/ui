import { render, screen } from '@testing-library/react';
import ToolResponseBubble from '@/components/tool-response-bubble';

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
    render(<ToolResponseBubble response="Test content" toolName="web_search" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('web_search Response');
  });
});
