import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputArea } from '@/components/input-area';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';
import * as UseMobileModule from '@/hooks/use-mobile';

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(),
}));

describe('InputArea Component', () => {
  const mockProps = {
    isLoading: false,
    selectedModel: 'gpt-4o',
    tokenUsage: {
      prompt_tokens: 10,
      completion_tokens: 15,
      total_tokens: 25,
    } as SchemaCompletionUsage,
    onSendMessageAction: jest.fn(),
    onSearchAction: jest.fn(),
    isSearchActive: false,
  };

  beforeEach(() => {
    jest.spyOn(UseMobileModule, 'useIsMobile').mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with model selected', () => {
    render(<InputArea {...mockProps} />);

    expect(screen.getByPlaceholderText('Ask anything or type / for commands')).toBeInTheDocument();
    expect(screen.getByTestId('mock-send-button')).toBeInTheDocument();
  });

  test('shows different placeholder when no model selected', () => {
    render(<InputArea {...mockProps} selectedModel="" />);

    const input = screen.getByTestId('mock-input');
    expect(input).toBeDisabled();
  });

  test('disables input when loading', () => {
    render(<InputArea {...mockProps} isLoading={true} />);

    const input = screen.getByTestId('mock-input');
    expect(input).toBeDisabled();
  });

  test('disables send button when input is empty', () => {
    render(<InputArea {...mockProps} />);

    const sendButton = screen.getByTestId('mock-send-button');
    expect(sendButton).toBeDisabled();
  });

  test('enables send button when input has text', () => {
    render(<InputArea {...mockProps} />);

    const input = screen.getByTestId('mock-input');
    fireEvent.change(input, { target: { value: 'Hello world' } });

    const sendButton = screen.getByTestId('mock-send-button');
    expect(sendButton).not.toBeDisabled();
  });

  test('calls onSendMessage when send button is clicked', () => {
    const onSendMessage = jest.fn();
    render(<InputArea {...mockProps} onSendMessageAction={onSendMessage} />);

    const input = screen.getByTestId('mock-input');
    fireEvent.change(input, { target: { value: 'Hello world' } });

    const sendButton = screen.getByTestId('mock-send-button');
    fireEvent.click(sendButton);

    expect(onSendMessage).toHaveBeenCalledWith('Hello world');
  });

  test('shows all UI elements from the screenshot design', () => {
    render(<InputArea {...mockProps} />);

    expect(
      screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'button' &&
          element?.querySelector('svg[class*="lucide-plus"]') !== null
        );
      })
    ).toBeInTheDocument();

    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();

    expect(screen.getByTestId('mic-button')).toBeInTheDocument();

    expect(screen.getByTestId('more-options-button')).toBeInTheDocument();

    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });

  test('calls onSearchAction when Search button is clicked', () => {
    render(<InputArea {...mockProps} />);

    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    expect(mockProps.onSearchAction).toHaveBeenCalled();
  });

  test('displays token usage when totalTokens > 0', () => {
    const tokenUsage = {
      prompt_tokens: 50,
      completion_tokens: 75,
      total_tokens: 125,
    } as SchemaCompletionUsage;

    render(<InputArea {...mockProps} tokenUsage={tokenUsage} />);

    expect(screen.getByText('Tokens: 125')).toBeInTheDocument();
    expect(screen.getByText('(50 prompt / 75 completion)')).toBeInTheDocument();
  });

  test('shows active state for search button when isSearchActive is true', () => {
    render(<InputArea {...mockProps} isSearchActive={true} />);

    const searchButton = screen.getByTestId('search-button');
    expect(searchButton).toHaveClass('bg-button-active');
    expect(searchButton).toHaveClass('text-button-active-text');
    expect(searchButton).toHaveClass('font-medium');
  });

  test('shows inactive state for search button when isSearchActive is false', () => {
    render(<InputArea {...mockProps} isSearchActive={false} />);

    const searchButton = screen.getByTestId('search-button');
    expect(searchButton).not.toHaveClass('bg-chat-input-hover-bg');
    expect(searchButton).toHaveClass('text-chat-input-text-muted');
    expect(searchButton).not.toHaveClass('font-medium');
  });

  test('sends message on Enter key press', () => {
    const onSendMessage = jest.fn();
    render(<InputArea {...mockProps} onSendMessageAction={onSendMessage} />);

    const input = screen.getByTestId('mock-input');
    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSendMessage).toHaveBeenCalledWith('Hello world');
  });

  test('does not send message on Shift+Enter key press', () => {
    const onSendMessage = jest.fn();
    render(<InputArea {...mockProps} onSendMessageAction={onSendMessage} />);

    const input = screen.getByTestId('mock-input');
    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(onSendMessage).not.toHaveBeenCalled();
  });
});
