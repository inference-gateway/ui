import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputArea } from '@/components/input-area';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';

describe('InputArea Component', () => {
  const mockProps = {
    inputValue: '',
    isLoading: false,
    selectedModel: 'gpt-4o',
    tokenUsage: {
      prompt_tokens: 10,
      completion_tokens: 15,
      total_tokens: 25,
    } as SchemaCompletionUsage,
    onInputChangeAction: jest.fn(),
    onKeyDownAction: jest.fn(),
    onSendMessageAction: jest.fn(),
  };

  test('renders correctly with model selected', () => {
    render(<InputArea {...mockProps} />);

    expect(screen.getByPlaceholderText('Ask anything')).toBeInTheDocument();
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
    render(<InputArea {...mockProps} inputValue="Hello world" />);

    const sendButton = screen.getByTestId('mock-send-button');
    expect(sendButton).not.toBeDisabled();
  });

  test('calls onSendMessageAction when send button is clicked', () => {
    render(<InputArea {...mockProps} inputValue="Hello world" />);

    const sendButton = screen.getByTestId('mock-send-button');
    fireEvent.click(sendButton);

    expect(mockProps.onSendMessageAction).toHaveBeenCalled();
  });

  test('shows Plus and Circle buttons', () => {
    render(<InputArea {...mockProps} />);

    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'button' &&
          element?.querySelector('svg[class*="lucide-plus"]') !== null
        );
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'button' &&
          element?.querySelector('svg[class*="lucide-circle"]') !== null
        );
      })
    ).toBeInTheDocument();
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
});
