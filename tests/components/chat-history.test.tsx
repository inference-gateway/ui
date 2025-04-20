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

test('calls onDeleteChatAction when delete button is clicked', () => {
  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
      onDeleteChatAction={mockHandlers.onDeleteChatAction}
    />
  );

  const deleteButtons = screen.getAllByTitle('Delete chat');
  const firstDeleteButton = deleteButtons[0];

  fireEvent.click(firstDeleteButton);

  expect(mockHandlers.onDeleteChatAction).toHaveBeenCalledWith('1');
});

test('does not call onDeleteChatAction when no delete button is present', () => {
  render(
    <ChatHistory
      chatSessions={mockChatSessions}
      activeChatId="1"
      onNewChatAction={mockHandlers.onNewChatAction}
      onSelectChatAction={mockHandlers.onSelectChatAction}
    />
  );

  const deleteButtons = screen.queryAllByTitle('Delete chat');
  expect(deleteButtons.length).toBe(0);
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
    expect(screen.queryByLabelText('Toggle menu')).not.toBeInTheDocument();
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
  expect(container).toHaveClass('overflow-y-auto');
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

test('handles mobile open/close states correctly', async () => {
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
      isMobileOpen={false}
      setIsMobileOpen={mockHandlers.setIsMobileOpen}
    />
  );

  fireEvent(window, new Event('resize'));

  const chat = screen.getByText('Second Chat');
  fireEvent.click(chat);
  expect(mockHandlers.onSelectChatAction).toHaveBeenCalledWith('2');
  expect(mockHandlers.setIsMobileOpen).toHaveBeenCalledWith(false);
});
