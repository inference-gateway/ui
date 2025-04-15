import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatHistory } from '@/components/chat-history';
import { mockChatSessions, mockHandlers } from '@/tests/mocks/chat-data';

const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true);
  jest.clearAllMocks();
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
});

afterEach(() => {
  window.confirm = originalConfirm;
});

test('renders chat sessions correctly', () => {
  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
      onDeleteChatAction={mockHandlers.onDeleteChatAction}
    />
  );

  expect(screen.getByText('First Chat')).toBeInTheDocument();
  expect(screen.getByText('Second Chat')).toBeInTheDocument();
  expect(screen.getByText('New Chat')).toBeInTheDocument();
});

test('calls onNewChatAction when New Chat button is clicked', () => {
  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  const newChatButton = screen.getByText('New Chat');
  fireEvent.click(newChatButton);

  expect(mockHandlers.onNewChatAction).toHaveBeenCalledTimes(1);
});

test('calls onSelectChatAction when a chat is clicked', () => {
  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  const secondChat = screen.getByText('Second Chat');
  fireEvent.click(secondChat);

  expect(mockHandlers.onSelectChatAction).toHaveBeenCalledWith('2');
});

test('calls onDeleteChatAction when delete button is clicked and confirmed', () => {
  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
      onDeleteChatAction={mockHandlers.onDeleteChatAction}
    />
  );

  const deleteButtons = screen.getAllByLabelText('Delete chat');
  const firstDeleteButton = deleteButtons[0];

  fireEvent.click(firstDeleteButton);

  expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this chat?');
  expect(mockHandlers.onDeleteChatAction).toHaveBeenCalledWith('1');
});

test('does not call onDeleteChatAction when deletion is not confirmed', () => {
  window.confirm = jest.fn(() => false);

  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
      onDeleteChatAction={mockHandlers.onDeleteChatAction}
    />
  );

  const deleteButtons = screen.getAllByLabelText('Delete chat');
  fireEvent.click(deleteButtons[0]);

  expect(window.confirm).toHaveBeenCalled();
  expect(mockHandlers.onDeleteChatAction).not.toHaveBeenCalled();
});

test('shows mobile menu button on mobile devices', async () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 600,
  });

  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  fireEvent(window, new Event('resize'));

  await waitFor(() => {
    const mobileMenuButton = screen.getByLabelText('Toggle menu');
    expect(mobileMenuButton).toBeInTheDocument();
  });
});

test('closes mobile sidebar when a chat is selected on mobile', async () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 600,
  });

  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
      isMobileOpen={true}
      setIsMobileOpen={mockHandlers.setIsMobileOpen}
    />
  );

  fireEvent(window, new Event('resize'));

  await waitFor(() => {
    const secondChat = screen.getByText('Second Chat');
    fireEvent.click(secondChat);

    expect(mockHandlers.onSelectChatAction).toHaveBeenCalledWith('2');
    expect(mockHandlers.setIsMobileOpen).toHaveBeenCalledWith(false);
  });
});

test('renders empty state when no chats exist', () => {
  render(
    <ChatHistory
      chatSessions={[]}
      activeChatId=""
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  const emptyMessage = screen.getByTestId('empty-message');
  expect(emptyMessage).toBeInTheDocument();
  expect(emptyMessage).toHaveTextContent('No chats yet');
  expect(screen.getByText('New Chat')).toBeInTheDocument();
});

test('handles long chat titles gracefully', () => {
  const longTitleChats = [
    {
      id: '3',
      title: 'This is a very long chat title that should be truncated properly in the UI',
      messages: [],
    },
  ];

  render(
    <ChatHistory
      chatSessions={longTitleChats}
      activeChatId="3"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  const chatTitle = screen.getByText(/This is a very long chat title/);
  expect(chatTitle).toBeInTheDocument();
  expect(chatTitle).toHaveClass('truncate');
});

test('displays active chat with different styling', () => {
  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="2"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  const activeChat = screen.getByText('Second Chat');
  const inactiveChat = screen.getByText('First Chat');

  const activeChatItem = activeChat.closest('[data-testid^="chat-item-"]');
  const inactiveChatItem = inactiveChat.closest('[data-testid^="chat-item-"]');

  expect(activeChatItem).toHaveClass('bg-neutral-100');
  expect(activeChatItem).toHaveClass('dark:bg-neutral-700');
  expect(activeChatItem).toHaveClass('border-l-4');
  expect(activeChatItem).toHaveClass('border-blue-500');

  expect(inactiveChatItem).not.toHaveClass('bg-neutral-100');
  expect(inactiveChatItem).not.toHaveClass('dark:bg-neutral-700');
  expect(inactiveChatItem).not.toHaveClass('border-l-4');
  expect(inactiveChatItem).not.toHaveClass('border-blue-500');
});

test('displays model information for chats with messages', () => {
  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  const firstChatModel = screen.getByTestId('chat-model-1');
  const secondChatModel = screen.getByTestId('chat-model-2');
  const emptyChatModel = screen.queryByTestId('chat-model-3');

  expect(firstChatModel).toHaveTextContent('gpt-4o');
  expect(secondChatModel).toHaveTextContent('claude-3-opus');
  expect(emptyChatModel).not.toBeInTheDocument();
});

test('handles special characters in chat titles', () => {
  const specialChats = [
    {
      id: '6',
      title: 'Chat with emoji 😊 and 日本語',
      messages: [],
    },
  ];

  render(
    <ChatHistory
      chatSessions={specialChats}
      activeChatId="6"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  expect(screen.getByText('Chat with emoji 😊 and 日本語')).toBeInTheDocument();
});

test('handles long lists of chats with scroll', () => {
  const longChatList = Array.from({ length: 50 }, (_, i) => ({
    id: `chat-${i}`,
    title: `Chat ${i + 1}`,
    messages: [],
  }));

  render(
    <ChatHistory
      chatSessions={longChatList}
      activeChatId="chat-0"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  const container = screen.getByTestId('chat-history-container');
  expect(container).toHaveStyle('overflow-y: auto');
});

test('supports keyboard navigation', async () => {
  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  const firstChat = screen
    .getByText('First Chat')
    .closest('[data-testid^="chat-item-"][data-focusable="true"]') as HTMLElement;
  const secondChat = screen
    .getByText('Second Chat')
    .closest('[data-testid^="chat-item-"][data-focusable="true"]') as HTMLElement;

  firstChat.focus();
  await waitFor(() => expect(firstChat).toHaveFocus());

  fireEvent.keyDown(firstChat, { key: 'ArrowDown' });
  await waitFor(() => expect(secondChat).toHaveFocus());

  fireEvent.keyDown(secondChat, { key: 'Enter' });
  expect(mockHandlers.onSelectChatAction).toHaveBeenCalledWith('2');

  fireEvent.keyDown(secondChat, { key: 'ArrowUp' });
  await waitFor(() => expect(firstChat).toHaveFocus());
});

test('toggles mobile sidebar when menu button is clicked', async () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 600,
  });

  const { rerender } = render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
      isMobileOpen={false}
      setIsMobileOpen={mockHandlers.setIsMobileOpen}
    />
  );

  fireEvent(window, new Event('resize'));

  await waitFor(() => {
    const toggleButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(toggleButton);
    expect(mockHandlers.setIsMobileOpen).toHaveBeenCalledWith(true);
  });

  rerender(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
      isMobileOpen={true}
      setIsMobileOpen={mockHandlers.setIsMobileOpen}
    />
  );

  const toggleButton = screen.getByLabelText('Toggle menu');
  fireEvent.click(toggleButton);
  expect(mockHandlers.setIsMobileOpen).toHaveBeenCalledWith(false);
});
