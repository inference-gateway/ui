import { ChatState, StorageService } from '@/hooks/chat/types';
import { useChatSessions } from '@/hooks/chat/use-chat-sessions';
import { createNewChatId } from '@/hooks/chat/utils';
import logger from '@/lib/logger';
import { MessageRole } from '@inference-gateway/sdk';
import { act, renderHook } from '@testing-library/react';

jest.mock('@/hooks/chat/utils', () => ({
  createEmptyTokenUsage: jest.fn(() => ({
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  })),
  createNewChatId: jest.fn(() => 'new-chat-id'),
}));

describe('useChatSessions Hook', () => {
  let mockStorageService: jest.Mocked<StorageService>;
  let mockSetChatState: jest.Mock;
  let mockSetTokenUsage: jest.Mock;
  let initialChatState: ChatState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStorageService = {
      getChatSessions: jest.fn().mockResolvedValue([]),
      saveChatSessions: jest.fn().mockResolvedValue(undefined),
      getActiveChatId: jest.fn().mockResolvedValue('chat-1'),
      saveActiveChatId: jest.fn().mockResolvedValue(undefined),
    };

    mockSetChatState = jest.fn();
    mockSetTokenUsage = jest.fn();

    initialChatState = {
      sessions: [
        {
          id: 'chat-1',
          title: 'Existing Chat',
          messages: [{ id: 'msg-1', role: MessageRole.user, content: 'Hello' }],
          tokenUsage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
          createdAt: 1650000000000,
        },
      ],
      activeId: 'chat-1',
      messages: [{ id: 'msg-1', role: MessageRole.user, content: 'Hello' }],
    };
  });

  describe('handleNewChat', () => {
    test('creates a new chat and updates state', async () => {
      const { result } = renderHook(() =>
        useChatSessions(initialChatState, mockSetChatState, mockSetTokenUsage, mockStorageService)
      );

      await act(async () => {
        await result.current.handleNewChat();
      });

      expect(createNewChatId).toHaveBeenCalled();

      expect(mockSetChatState).toHaveBeenCalled();

      const setChatStateUpdater = mockSetChatState.mock.calls[0][0];
      const newState = setChatStateUpdater(initialChatState);

      expect(newState).toEqual({
        sessions: [
          ...initialChatState.sessions,
          expect.objectContaining({
            id: 'new-chat-id',
            title: 'New Chat',
            messages: [],
          }),
        ],
        activeId: 'new-chat-id',
        messages: [],
      });

      expect(mockSetTokenUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        })
      );

      expect(mockStorageService.getChatSessions).toHaveBeenCalled();
      expect(mockStorageService.saveChatSessions).toHaveBeenCalled();
      expect(mockStorageService.saveActiveChatId).toHaveBeenCalledWith('new-chat-id');
    });

    test('handles storage errors gracefully', async () => {
      const storageError = new Error('Storage failed');
      mockStorageService.getChatSessions.mockRejectedValueOnce(storageError);

      const { result } = renderHook(() =>
        useChatSessions(initialChatState, mockSetChatState, mockSetTokenUsage, mockStorageService)
      );

      await act(async () => {
        await result.current.handleNewChat();
      });

      expect(mockSetChatState).toHaveBeenCalled();
      expect(mockSetTokenUsage).toHaveBeenCalled();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to create new chat',
        expect.objectContaining({
          error: storageError.message,
          stack: storageError.stack,
        })
      );
    });
  });

  describe('handleSelectChat', () => {
    test('selects an existing chat and updates state', async () => {
      const extendedChatState = {
        ...initialChatState,
        sessions: [
          ...initialChatState.sessions,
          {
            id: 'chat-2',
            title: 'Second Chat',
            messages: [{ id: 'msg-2', role: MessageRole.user, content: 'Second chat message' }],
            tokenUsage: { prompt_tokens: 2, completion_tokens: 4, total_tokens: 6 },
            createdAt: 1650000000001,
          },
        ],
      };

      const { result } = renderHook(() =>
        useChatSessions(extendedChatState, mockSetChatState, mockSetTokenUsage, mockStorageService)
      );

      await act(async () => {
        await result.current.handleSelectChat('chat-2');
      });

      expect(mockSetChatState).toHaveBeenCalledWith(
        expect.objectContaining({
          activeId: 'chat-2',
          messages: [{ id: 'msg-2', role: MessageRole.user, content: 'Second chat message' }],
        })
      );

      expect(mockSetTokenUsage).toHaveBeenCalledWith({
        prompt_tokens: 2,
        completion_tokens: 4,
        total_tokens: 6,
      });

      expect(mockStorageService.saveChatSessions).toHaveBeenCalled();
    });

    test('handles non-existent chat IDs', async () => {
      const { result } = renderHook(() =>
        useChatSessions(initialChatState, mockSetChatState, mockSetTokenUsage, mockStorageService)
      );

      await act(async () => {
        await result.current.handleSelectChat('non-existent-id');
      });

      expect(mockSetChatState).toHaveBeenCalledWith(
        expect.objectContaining({
          activeId: 'non-existent-id',
          messages: [],
        })
      );

      expect(mockSetTokenUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        })
      );
    });

    test('handles storage errors gracefully', async () => {
      const storageError = new Error('Storage failed');
      mockStorageService.saveChatSessions.mockRejectedValueOnce(storageError);

      const { result } = renderHook(() =>
        useChatSessions(initialChatState, mockSetChatState, mockSetTokenUsage, mockStorageService)
      );

      await act(async () => {
        await result.current.handleSelectChat('chat-1');
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to select chat',
        expect.objectContaining({
          error: storageError.message,
          stack: storageError.stack,
        })
      );
    });
  });

  describe('handleDeleteChat', () => {
    test('deletes a chat and updates state', () => {
      const extendedChatState = {
        ...initialChatState,
        sessions: [
          ...initialChatState.sessions,
          {
            id: 'chat-2',
            title: 'Second Chat',
            messages: [{ id: 'msg-2', role: MessageRole.user, content: 'Second chat message' }],
            tokenUsage: { prompt_tokens: 2, completion_tokens: 4, total_tokens: 6 },
            createdAt: 1650000000001,
          },
        ],
      };

      const { result } = renderHook(() =>
        useChatSessions(extendedChatState, mockSetChatState, mockSetTokenUsage, mockStorageService)
      );

      act(() => {
        result.current.handleDeleteChat('chat-2');
      });

      expect(mockSetChatState).toHaveBeenCalled();
      const setChatStateCall = mockSetChatState.mock.calls[0][0];
      const newState = setChatStateCall(extendedChatState);

      expect(newState.sessions).toHaveLength(1);
      expect(newState.sessions[0].id).toBe('chat-1');
      expect(newState).toEqual(initialChatState);
    });

    test('selects another chat when deleting the active chat', () => {
      const extendedChatState = {
        ...initialChatState,
        sessions: [
          ...initialChatState.sessions,
          {
            id: 'chat-2',
            title: 'Second Chat',
            messages: [{ id: 'msg-2', role: MessageRole.user, content: 'Second chat message' }],
            tokenUsage: { prompt_tokens: 2, completion_tokens: 4, total_tokens: 6 },
            createdAt: 1650000000001,
          },
        ],
      };

      const { result } = renderHook(() =>
        useChatSessions(extendedChatState, mockSetChatState, mockSetTokenUsage, mockStorageService)
      );

      act(() => {
        result.current.handleDeleteChat('chat-1');
      });

      expect(mockSetChatState).toHaveBeenCalled();

      const setChatStateCall = mockSetChatState.mock.calls[0][0];
      const newState = setChatStateCall(extendedChatState);

      expect(newState.sessions).toHaveLength(1);
      expect(newState.sessions[0].id).toBe('chat-2');
      expect(newState.activeId).toBe('chat-2');
      expect(newState.messages).toEqual([
        { id: 'msg-2', role: MessageRole.user, content: 'Second chat message' },
      ]);

      expect(mockSetTokenUsage).toHaveBeenCalledWith({
        prompt_tokens: 2,
        completion_tokens: 4,
        total_tokens: 6,
      });
    });

    test('creates a new chat when deleting the last chat', () => {
      const { result } = renderHook(() =>
        useChatSessions(initialChatState, mockSetChatState, mockSetTokenUsage, mockStorageService)
      );

      act(() => {
        result.current.handleDeleteChat('chat-1');
      });

      expect(mockSetChatState).toHaveBeenCalled();

      const setChatStateCall = mockSetChatState.mock.calls[0][0];
      const newState = setChatStateCall(initialChatState);

      expect(newState.sessions).toHaveLength(1);
      expect(newState.sessions[0].id).toBe('new-chat-id');
      expect(newState.activeId).toBe('new-chat-id');
      expect(newState.messages).toEqual([]);

      expect(mockSetTokenUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        })
      );
    });
  });
});
