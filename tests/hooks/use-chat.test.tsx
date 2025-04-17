import { renderHook, waitFor } from '@testing-library/react';
import { useChat } from '@/hooks/use-chat';
import { StorageServiceFactory } from '@/lib/storage';
import { InferenceGatewayClient, MessageRole } from '@inference-gateway/sdk';
import { act } from 'react';

describe('useChat Hook', () => {
  const mockGetChatSessions = jest.fn();
  const mockSaveChatSessions = jest.fn();
  const mockGetActiveChatId = jest.fn();
  const mockSaveActiveChatId = jest.fn();
  const mockClear = jest.fn();

  const mockStreamChatCompletion = jest.fn();
  const mockWithOptions = jest.fn();
  const mockCreateChatCompletion = jest.fn();

  const originalClassList = document.documentElement.classList;
  let mockClassList: {
    contains: jest.Mock;
    add: jest.Mock;
    remove: jest.Mock;
  };

  beforeAll(() => {
    Object.defineProperty(global, 'crypto', {
      value: {
        getRandomValues: jest.fn(),
        randomUUID: jest.fn().mockReturnValue('12345678-1234-1234-1234-123456789012'),
        subtle: {} as SubtleCrypto,
      },
    });

    mockClassList = {
      contains: jest.fn().mockImplementation(className => className === 'dark'),
      add: jest.fn(),
      remove: jest.fn(),
    };
    Object.defineProperty(document.documentElement, 'classList', {
      value: mockClassList,
      configurable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockClassList.contains.mockImplementation(className => className === 'dark');
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();

    const mockStorageService = {
      getChatSessions: mockGetChatSessions,
      saveChatSessions: mockSaveChatSessions,
      getActiveChatId: mockGetActiveChatId,
      saveActiveChatId: mockSaveActiveChatId,
      clear: mockClear,
    };

    (StorageServiceFactory.createService as jest.Mock).mockReturnValue(mockStorageService);

    const mockClient = {
      streamChatCompletion: mockStreamChatCompletion,
      withOptions: mockWithOptions,
      createChatCompletion: mockCreateChatCompletion,
    };

    (InferenceGatewayClient as unknown as jest.Mock).mockImplementation(() => mockClient);
    mockWithOptions.mockReturnValue(mockClient);

    mockGetChatSessions.mockResolvedValue([
      {
        id: '1',
        title: 'Existing Chat',
        messages: [
          {
            id: 'msg1',
            role: MessageRole.user,
            content: 'Hello',
          },
          {
            id: 'msg2',
            role: MessageRole.assistant,
            content: 'Hi there!',
            model: 'openai/gpt-4o',
          },
        ],
      },
    ]);
    mockGetActiveChatId.mockResolvedValue('1');

    global.fetch = jest.fn();
  });

  afterAll(() => {
    // @ts-expect-error - We're intentionally deleting crypto
    delete global.crypto;

    // Restore original classList
    Object.defineProperty(document.documentElement, 'classList', {
      value: originalClassList,
      configurable: true,
    });
  });

  test('initializes with correct state', async () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.selectedModel).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isStreaming).toBe(false);

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    expect(result.current.chatSessions).toEqual([
      {
        id: '1',
        title: 'Existing Chat',
        messages: [
          {
            id: 'msg1',
            role: MessageRole.user,
            content: 'Hello',
          },
          {
            id: 'msg2',
            role: MessageRole.assistant,
            content: 'Hi there!',
            model: 'openai/gpt-4o',
          },
        ],
      },
    ]);
    expect(result.current.activeChatId).toBe('1');
    expect(result.current.messages).toEqual([
      {
        id: 'msg1',
        role: MessageRole.user,
        content: 'Hello',
      },
      {
        id: 'msg2',
        role: MessageRole.assistant,
        content: 'Hi there!',
        model: 'openai/gpt-4o',
      },
    ]);
  });

  test('handleNewChat creates a new chat session', async () => {
    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    const initialChatId = result.current.activeChatId;

    await act(async () => {
      result.current.handleNewChat();
    });

    await waitFor(() => {
      expect(mockSaveChatSessions).toHaveBeenCalled();
    });

    expect(mockSaveActiveChatId).toHaveBeenCalled();

    await waitFor(() => {
      expect(result.current.activeChatId).not.toBe(initialChatId);
      expect(result.current.activeChatId).toBe('12345678-1234-1234-1234-123456789012');
    });

    expect(result.current.messages).toEqual([]);

    expect(
      result.current.chatSessions.some(
        session => session.id === '12345678-1234-1234-1234-123456789012'
      )
    ).toBe(true);
  });

  test('handleSelectChat switches the active chat', async () => {
    mockGetChatSessions.mockResolvedValue([
      {
        id: '1',
        title: 'First Chat',
        messages: [{ id: 'msg1', role: MessageRole.user, content: 'Hello' }],
      },
      {
        id: '2',
        title: 'Second Chat',
        messages: [{ id: 'msg2', role: MessageRole.user, content: 'Hi there' }],
      },
    ]);

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBe(2);
    });

    await act(async () => {
      result.current.handleSelectChat('2');
    });

    await waitFor(() => {
      expect(result.current.activeChatId).toBe('2');
    });

    expect(result.current.messages).toEqual([
      { id: 'msg2', role: MessageRole.user, content: 'Hi there' },
    ]);
  });

  test('handleDeleteChat removes a chat session', async () => {
    mockGetChatSessions.mockResolvedValue([
      {
        id: '1',
        title: 'First Chat',
        messages: [{ id: 'msg1', role: MessageRole.user, content: 'Hello' }],
      },
      {
        id: '2',
        title: 'Second Chat',
        messages: [{ id: 'msg2', role: MessageRole.user, content: 'Hi there' }],
      },
    ]);

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBe(2);
    });

    await act(async () => {
      result.current.handleDeleteChat('1');
    });

    await waitFor(() => {
      expect(result.current.activeChatId).toBe('2');
    });

    expect(result.current.messages).toEqual([
      { id: 'msg2', role: MessageRole.user, content: 'Hi there' },
    ]);
    expect(result.current.chatSessions.length).toBe(1);
  });

  test('handleSendMessage handles streaming errors', async () => {
    mockStreamChatCompletion.mockRejectedValue(new Error('Streaming failed'));

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    await act(async () => {
      result.current.setSelectedModel('openai/gpt-4o');
    });

    await waitFor(() => {
      expect(result.current.selectedModel).toBe('openai/gpt-4o');
    });

    await act(async () => {
      await result.current.handleSendMessage('Test message');
    });

    expect(result.current.isStreaming).toBe(false);
  });

  test('handleSendMessage handles partial streaming responses', async () => {
    let errorWasCalled = false;

    mockStreamChatCompletion.mockImplementation((_, callbacks) => {
      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: 'Partial',
                role: MessageRole.assistant,
              },
            },
          ],
        });
      }, 10);

      setTimeout(() => {
        try {
          callbacks.onError(new Error('Stream interrupted'));
        } catch {
          errorWasCalled = true;
        }
      }, 20);

      return Promise.resolve();
    });

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    await act(async () => {
      result.current.setSelectedModel('anthropic/claude-3-opus');
    });

    await waitFor(() => {
      expect(result.current.selectedModel).toBe('anthropic/claude-3-opus');
    });

    await act(async () => {
      await result.current.handleSendMessage('Test message');
    });

    await waitFor(() => {
      expect(result.current.messages[result.current.messages.length - 1].content).toBe('Partial');
    });

    expect(errorWasCalled).toBe(true);

    expect(result.current.isStreaming).toBe(false);
  });

  test('toggleTheme switches between dark and light mode', async () => {
    // Update the classList mock behavior to properly track dark mode changes
    let isDarkMode = true;
    mockClassList.contains.mockImplementation(className => {
      return className === 'dark' ? isDarkMode : false;
    });
    mockClassList.add.mockImplementation(className => {
      if (className === 'dark') isDarkMode = true;
    });
    mockClassList.remove.mockImplementation(className => {
      if (className === 'dark') isDarkMode = false;
    });

    const { result } = renderHook(() => useChat(true));

    expect(result.current.isDarkMode).toBe(true);

    await act(async () => {
      // This should call document.documentElement.classList.remove('dark')
      result.current.toggleTheme();
    });

    await waitFor(() => {
      expect(result.current.isDarkMode).toBe(false);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await act(async () => {
      // This should call document.documentElement.classList.add('dark')
      result.current.toggleTheme();
    });

    await waitFor(() => {
      expect(result.current.isDarkMode).toBe(true);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
