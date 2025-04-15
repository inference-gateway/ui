import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputArea } from '@/components/input-area';
import { MessageRole } from '@inference-gateway/sdk';

describe('InputArea Component', () => {
  const mockProps = {
    inputValue: '',
    isLoading: false,
    selectedModel: 'gpt-4o',
    tokenUsage: {
      promptTokens: 10,
      completionTokens: 15,
      totalTokens: 25,
    },
    messages: [],
    onInputChange: jest.fn(),
    onKeyDown: jest.fn(),
    onSendMessage: jest.fn(),
    onClearMessages: jest.fn(),
  };

  test('renders correctly with model selected', () => {
    render(<InputArea {...mockProps} />);

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('Prompt: 10 tokens')).toBeInTheDocument();
    expect(screen.getByText('Completion: 15 tokens')).toBeInTheDocument();
    expect(screen.getByText('Total: 25 tokens')).toBeInTheDocument();
  });

  test('shows different placeholder when no model selected', () => {
    render(<InputArea {...mockProps} selectedModel="" />);

    expect(screen.getByPlaceholderText('Please select a model first...')).toBeInTheDocument();
  });

  test('disables input when loading', () => {
    render(<InputArea {...mockProps} isLoading={true} />);

    const input = screen.getByPlaceholderText('Type a message...');
    expect(input).toBeDisabled();
  });

  test('disables send button when input is empty', () => {
    render(<InputArea {...mockProps} />);

    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });

  test('enables send button when input has text', () => {
    render(<InputArea {...mockProps} inputValue="Hello world" />);

    const sendButton = screen.getByText('Send');
    expect(sendButton).not.toBeDisabled();
  });

  test('shows loading state when isLoading is true', () => {
    render(<InputArea {...mockProps} isLoading={true} />);

    expect(screen.getByText('Sending...')).toBeInTheDocument();
  });

  test('calls onSendMessage when send button is clicked', () => {
    render(<InputArea {...mockProps} inputValue="Hello world" />);

    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

    expect(mockProps.onSendMessage).toHaveBeenCalled();
  });

  test('shows clear button when messages exist', () => {
    render(
      <InputArea
        {...mockProps}
        messages={[{ id: '1', role: MessageRole.user, content: 'Hello' }]}
      />
    );

    const clearButton = screen.getByTitle('Clear chat');
    expect(clearButton).toBeInTheDocument();
  });

  test('calls onClearMessages when clear button is clicked', () => {
    render(
      <InputArea
        {...mockProps}
        messages={[{ id: '1', role: MessageRole.user, content: 'Hello' }]}
      />
    );

    const clearButton = screen.getByTitle('Clear chat');
    fireEvent.click(clearButton);

    expect(mockProps.onClearMessages).toHaveBeenCalled();
  });
});
