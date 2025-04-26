import { ChatState, UIState } from '@/hooks/chat/types';
import { useMessageHandler } from '@/hooks/chat/use-message-handler';
import logger from '@/lib/logger';
import { Message, StorageService } from '@/types/chat';
import { InferenceGatewayClient, MessageRole, SchemaCompletionUsage } from '@inference-gateway/sdk';
import { act, renderHook } from '@testing-library/react';

describe('useMessageHandler Hook', () => {
  const mockStreamChatCompletion = jest.fn();
  const mockClientInstance = {
    streamChatCompletion: mockStreamChatCompletion,
  } as unknown as InferenceGatewayClient;

  const mockStorageService: StorageService = {
    getChatSessions: jest.fn(),
    saveChatSessions: jest.fn(),
    getActiveChatId: jest.fn(),
    saveActiveChatId: jest.fn(),
    getSelectedModel: jest.fn(),
    saveSelectedModel: jest.fn(),
    clear: jest.fn(),
  };

  const mockSetChatState = jest.fn();
  const mockSetUIState = jest.fn();
  const mockSetTokenUsage = jest.fn();
  const mockHandleNewChat = jest.fn().mockResolvedValue(undefined);

  const selectedModel = 'openai/gpt-4o';
  const initialTokenUsage: SchemaCompletionUsage = {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  };

  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      role: MessageRole.user,
      content: 'Hello there',
    },
    {
      id: 'msg-2',
      role: MessageRole.assistant,
      content: 'Hi! How can I help you?',
      model: 'openai/gpt-4o',
    },
  ];

  const mockChatState: ChatState = {
    activeId: 'chat-1',
    messages: mockMessages,
    sessions: [
      {
        id: 'chat-1',
        title: 'Test Chat',
        messages: mockMessages,
        tokenUsage: initialTokenUsage,
        createdAt: Date.now(),
      },
    ],
  };

  const mockUIState: UIState = {
    isLoading: false,
    isStreaming: false,
    isDarkMode: false,
    error: null,
    isWebSearchEnabled: false,
  };

  let currentChatState = mockChatState;
  let currentUIState = mockUIState;

  beforeEach(() => {
    jest.clearAllMocks();
    currentChatState = { ...mockChatState };
    currentUIState = { ...mockUIState };

    mockSetChatState.mockImplementation(updater => {
      if (typeof updater === 'function') {
        currentChatState = updater(currentChatState);
      } else {
        currentChatState = updater;
      }
      return currentChatState;
    });

    mockSetUIState.mockImplementation(updater => {
      if (typeof updater === 'function') {
        currentUIState = updater(currentUIState);
      } else {
        currentUIState = updater;
      }
      return currentUIState;
    });

    mockSetTokenUsage.mockImplementation(usage => {
      if (typeof usage === 'function') {
        return usage(initialTokenUsage);
      }
      return usage;
    });
  });

  const expectStateUpdate = <T extends UIState | ChatState>(
    mockFn: jest.Mock,
    expected: Partial<T>
  ) => {
    const calls = mockFn.mock.calls;
    const lastCall = calls[calls.length - 1];

    if (typeof lastCall[0] === 'function') {
      const result = lastCall[0](currentChatState);
      expect(result).toMatchObject(expected);
    } else {
      expect(lastCall[0]).toMatchObject(expected);
    }
  };

  test('clearError sets error to null in UI state', () => {
    const { result } = renderHook(() =>
      useMessageHandler(
        mockClientInstance,
        selectedModel,
        mockChatState,
        mockSetChatState,
        mockSetUIState,
        mockSetTokenUsage,
        mockHandleNewChat,
        mockStorageService
      )
    );

    act(() => {
      result.current.clearError();
    });

    expectStateUpdate(mockSetUIState, {
      error: null,
    });
  });

  describe('handleSendMessage', () => {
    test('should handle empty input correctly', async () => {
      const { result } = renderHook(() =>
        useMessageHandler(
          mockClientInstance,
          selectedModel,
          mockChatState,
          mockSetChatState,
          mockSetUIState,
          mockSetTokenUsage,
          mockHandleNewChat,
          mockStorageService
        )
      );

      await act(async () => {
        await result.current.handleSendMessage('   ');
      });

      expect(mockClientInstance.streamChatCompletion).not.toHaveBeenCalled();
      expect(mockSetChatState).not.toHaveBeenCalled();
    });

    test('should handle /reset command to clear messages', async () => {
      const { result } = renderHook(() =>
        useMessageHandler(
          mockClientInstance,
          selectedModel,
          mockChatState,
          mockSetChatState,
          mockSetUIState,
          mockSetTokenUsage,
          mockHandleNewChat,
          mockStorageService
        )
      );

      await act(async () => {
        await result.current.handleSendMessage('/reset');
      });

      expectStateUpdate(mockSetChatState, {
        messages: [],
      });
      expect(mockSetTokenUsage).toHaveBeenCalledWith({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      });
      expect(mockClientInstance.streamChatCompletion).not.toHaveBeenCalled();
    });

    test('should handle /clear command to clear messages', async () => {
      const { result } = renderHook(() =>
        useMessageHandler(
          mockClientInstance,
          selectedModel,
          mockChatState,
          mockSetChatState,
          mockSetUIState,
          mockSetTokenUsage,
          mockHandleNewChat,
          mockStorageService
        )
      );

      await act(async () => {
        await result.current.handleSendMessage('/clear');
      });

      expectStateUpdate(mockSetChatState, {
        messages: [],
      });
      expect(mockSetTokenUsage).toHaveBeenCalledWith({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      });
    });

    test('should call handleNewChat when no active chat ID is set', async () => {
      const noActiveChatState = {
        ...mockChatState,
        activeId: '',
      };

      const { result } = renderHook(() =>
        useMessageHandler(
          mockClientInstance,
          selectedModel,
          noActiveChatState,
          mockSetChatState,
          mockSetUIState,
          mockSetTokenUsage,
          mockHandleNewChat,
          mockStorageService
        )
      );

      await act(async () => {
        await result.current.handleSendMessage('Hello');
      });

      expect(mockHandleNewChat).toHaveBeenCalled();
      expect(mockClientInstance.streamChatCompletion).not.toHaveBeenCalled();
    });

    test('should add user message to chat state', async () => {
      mockStreamChatCompletion.mockImplementation(async () => {
        return Promise.resolve();
      });

      const { result } = renderHook(() =>
        useMessageHandler(
          mockClientInstance,
          selectedModel,
          mockChatState,
          mockSetChatState,
          mockSetUIState,
          mockSetTokenUsage,
          mockHandleNewChat,
          mockStorageService
        )
      );

      const userMessage = 'Hello world';

      await act(async () => {
        await result.current.handleSendMessage(userMessage);
      });

      expectStateUpdate(mockSetChatState, {
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: MessageRole.user,
            content: userMessage,
          }),
        ]),
      });

      const calls = mockSetUIState.mock.calls;
      const loadingCall = calls.find(call => {
        const arg = typeof call[0] === 'function' ? call[0](currentUIState) : call[0];
        return arg?.isLoading === true && arg?.isStreaming === true;
      });
      expect(loadingCall).toBeDefined();
    });

    test('should update the title of a "New Chat"', async () => {
      currentChatState = {
        ...mockChatState,
        sessions: [
          {
            ...mockChatState.sessions[0],
            title: 'New Chat',
          },
        ],
      };

      mockStreamChatCompletion.mockImplementation(async () => {
        return Promise.resolve();
      });

      const { result } = renderHook(() =>
        useMessageHandler(
          mockClientInstance,
          selectedModel,
          currentChatState,
          mockSetChatState,
          mockSetUIState,
          mockSetTokenUsage,
          mockHandleNewChat,
          mockStorageService
        )
      );

      const userMessage = 'This is a long message that will be truncated';

      await act(async () => {
        await result.current.handleSendMessage(userMessage);
      });

      const calls = mockSetChatState.mock.calls;
      const titleUpdateCall = calls.find(call => {
        if (typeof call[0] !== 'function') return false;
        const updatedState = call[0]({ ...currentChatState });
        return updatedState.sessions[0].title === 'This is a long messa...';
      });

      expect(titleUpdateCall).toBeDefined();
    });

    test('should handle successful streaming response', async () => {
      mockStreamChatCompletion.mockImplementation(async (_, callbacks) => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: 'Hello',
              },
            },
          ],
        });

        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: ' there!',
              },
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        });

        return Promise.resolve();
      });

      const { result } = renderHook(() =>
        useMessageHandler(
          mockClientInstance,
          selectedModel,
          mockChatState,
          mockSetChatState,
          mockSetUIState,
          mockSetTokenUsage,
          mockHandleNewChat,
          mockStorageService
        )
      );

      await act(async () => {
        await result.current.handleSendMessage('Hi');
      });

      expect(mockClientInstance.streamChatCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          model: selectedModel,
          stream: true,
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: MessageRole.user,
              content: 'Hi',
            }),
          ]),
        }),
        expect.anything()
      );

      expect(mockSetTokenUsage).toHaveBeenCalledWith({
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      });

      expect(mockStorageService.saveChatSessions).toHaveBeenCalled();

      expectStateUpdate(mockSetUIState, {
        isLoading: false,
        isStreaming: false,
      });
    });

    test('should handle reasoning content in response', async () => {
      mockStreamChatCompletion.mockImplementation(async (_, callbacks) => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: '',
              },
            },
          ],
        });

        callbacks.onReasoning('Let me think about this...');

        callbacks.onContent('The answer');

        callbacks.onFinish();

        return Promise.resolve();
      });

      const { result } = renderHook(() =>
        useMessageHandler(
          mockClientInstance,
          selectedModel,
          mockChatState,
          mockSetChatState,
          mockSetUIState,
          mockSetTokenUsage,
          mockHandleNewChat,
          mockStorageService
        )
      );

      await act(async () => {
        await result.current.handleSendMessage('What is 2+2?');
      });

      const chatCalls = mockSetChatState.mock.calls;
      const assistantMessageCall = chatCalls.find(call => {
        if (typeof call[0] !== 'function') return false;
        const result = call[0](currentChatState);
        const messages = result.messages || [];
        return messages.some(
          m =>
            m.role === MessageRole.assistant &&
            m.content === 'The answer' &&
            m.reasoning_content === 'Let me think about this...'
        );
      });

      expect(assistantMessageCall).toBeDefined();
    });

    test('should handle API errors during streaming', async () => {
      const error = new Error('API Error');
      currentChatState.messages = [
        {
          id: 'msg-1',
          role: MessageRole.user,
          content: 'Hello',
        },
      ];

      mockStreamChatCompletion.mockImplementation(async (_, callbacks) => {
        callbacks.onError(error);
        return Promise.reject(error);
      });

      const { result } = renderHook(() =>
        useMessageHandler(
          mockClientInstance,
          selectedModel,
          mockChatState,
          mockSetChatState,
          mockSetUIState,
          mockSetTokenUsage,
          mockHandleNewChat,
          mockStorageService
        )
      );

      await act(async () => {
        await result.current.handleSendMessage('Hello');
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to get chat response',
        expect.objectContaining({
          error: error.message,
          stack: error.stack,
        })
      );

      const calls = mockSetUIState.mock.calls;
      const errorCall = calls.find(call => {
        const arg = typeof call[0] === 'function' ? call[0](currentUIState) : call[0];
        return (
          arg?.error === error.message && arg?.isLoading === false && arg?.isStreaming === false
        );
      });
      expect(errorCall).toBeDefined();

      const chatCalls = mockSetChatState.mock.calls;
      const lastCall = chatCalls[chatCalls.length - 1];
      const updatedState =
        typeof lastCall[0] === 'function' ? lastCall[0](currentChatState) : lastCall[0];

      const assistantMessages = updatedState.messages.filter(
        (m: Message) => m.role === MessageRole.assistant
      );

      const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
      expect(lastAssistantMessage.content).toContain('Sorry, I encountered an error');
    });

    test('should not call API if client is null', async () => {
      const { result } = renderHook(() =>
        useMessageHandler(
          null,
          selectedModel,
          mockChatState,
          mockSetChatState,
          mockSetUIState,
          mockSetTokenUsage,
          mockHandleNewChat,
          mockStorageService
        )
      );

      await act(async () => {
        await result.current.handleSendMessage('Hello');
      });

      expect(mockStreamChatCompletion).not.toHaveBeenCalled();
    });
  });
});
