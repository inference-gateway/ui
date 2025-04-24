import { useChatStorage } from '@/hooks/chat/use-chat-storage';
import { createEmptyTokenUsage } from '@/hooks/chat/utils';
import logger from '@/lib/logger';
import { StorageServiceFactory } from '@/lib/storage';
import { ChatSession, StorageType } from '@/types/chat';
import { MessageRole } from '@inference-gateway/sdk';
import { act, renderHook } from '@testing-library/react';

jest.mock('@/hooks/chat/utils', () => ({
  createEmptyTokenUsage: jest.fn(() => ({
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  })),
}));

describe('useChatStorage Hook', () => {
  const mockStorageService = {
    getChatSessions: jest.fn(),
    saveChatSessions: jest.fn(),
    getActiveChatId: jest.fn(),
    saveActiveChatId: jest.fn(),
    clear: jest.fn(),
  };

  const mockChatSessions: ChatSession[] = [
    {
      id: 'chat-1',
      title: 'First Chat',
      messages: [
        {
          id: 'msg-1',
          role: MessageRole.user,
          content: 'Test message 1',
        },
        {
          id: 'msg-2',
          role: MessageRole.assistant,
          content: 'Test response 1',
          model: 'gpt-4o',
        },
      ],
      tokenUsage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
      createdAt: 1650000000000,
    },
    {
      id: 'chat-2',
      title: 'Second Chat',
      messages: [
        {
          id: 'msg-3',
          role: MessageRole.user,
          content: 'Test message 2',
        },
      ],
      tokenUsage: {
        prompt_tokens: 5,
        completion_tokens: 0,
        total_tokens: 5,
      },
      createdAt: 1650000000001,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (StorageServiceFactory.createService as jest.Mock).mockReturnValue(mockStorageService);
  });

  test('initializes with local storage service', () => {
    renderHook(() => useChatStorage());

    expect(StorageServiceFactory.createService).toHaveBeenCalledWith({
      storageType: StorageType.LOCAL,
      userId: undefined,
    });
  });

  describe('loadChatData', () => {
    test('loads chat sessions and active chat correctly', async () => {
      mockStorageService.getChatSessions.mockResolvedValue(mockChatSessions);
      mockStorageService.getActiveChatId.mockResolvedValue('chat-1');

      const { result } = renderHook(() => useChatStorage());

      let chatData;
      await act(async () => {
        chatData = await result.current.loadChatData();
      });

      expect(mockStorageService.getChatSessions).toHaveBeenCalled();
      expect(mockStorageService.getActiveChatId).toHaveBeenCalled();
      expect(chatData).toEqual({
        sessions: mockChatSessions,
        activeId: 'chat-1',
        messages: mockChatSessions[0].messages,
        tokenUsage: mockChatSessions[0].tokenUsage,
      });
    });

    test('handles sessions wrapped in a sessions object', async () => {
      const wrappedSessions = { sessions: mockChatSessions };
      mockStorageService.getChatSessions.mockResolvedValue(wrappedSessions);
      mockStorageService.getActiveChatId.mockResolvedValue('chat-1');

      const { result } = renderHook(() => useChatStorage());

      let chatData;
      await act(async () => {
        chatData = await result.current.loadChatData();
      });

      expect(chatData).toEqual({
        sessions: mockChatSessions,
        activeId: 'chat-1',
        messages: mockChatSessions[0].messages,
        tokenUsage: mockChatSessions[0].tokenUsage,
      });
    });

    test('handles non-existent active chat ID', async () => {
      mockStorageService.getChatSessions.mockResolvedValue(mockChatSessions);
      mockStorageService.getActiveChatId.mockResolvedValue('non-existent');

      const { result } = renderHook(() => useChatStorage());

      let chatData;
      await act(async () => {
        chatData = await result.current.loadChatData();
      });

      expect(chatData).toEqual({
        sessions: mockChatSessions,
        activeId: 'non-existent',
        messages: [],
        tokenUsage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      });
      expect(createEmptyTokenUsage).toHaveBeenCalled();
    });

    test('handles empty sessions array', async () => {
      mockStorageService.getChatSessions.mockResolvedValue([]);
      mockStorageService.getActiveChatId.mockResolvedValue('');

      const { result } = renderHook(() => useChatStorage());

      let chatData;
      await act(async () => {
        chatData = await result.current.loadChatData();
      });

      expect(chatData).toEqual({
        sessions: [],
        activeId: '',
        messages: [],
        tokenUsage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      });
    });

    test('handles error when loading chat data', async () => {
      const error = new Error('Failed to load');
      mockStorageService.getChatSessions.mockRejectedValue(error);

      const { result } = renderHook(() => useChatStorage());

      let chatData;
      await act(async () => {
        chatData = await result.current.loadChatData();
      });

      expect(logger.error).toHaveBeenCalledWith('Failed to load chat data', {
        error: error.message,
        stack: error.stack,
      });

      expect(chatData).toEqual({
        sessions: [],
        activeId: '',
        messages: [],
        tokenUsage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      });
    });

    test('handles non-array sessions data', async () => {
      mockStorageService.getChatSessions.mockResolvedValue('invalid data');
      mockStorageService.getActiveChatId.mockResolvedValue('');

      const { result } = renderHook(() => useChatStorage());

      let chatData;
      await act(async () => {
        chatData = await result.current.loadChatData();
      });

      expect(chatData).toEqual({
        sessions: [],
        activeId: '',
        messages: [],
        tokenUsage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      });
    });
  });

  describe('saveChatData', () => {
    test('saves chat sessions and updates token usage for active chat', async () => {
      const { result } = renderHook(() => useChatStorage());
      const updatedTokenUsage = {
        prompt_tokens: 15,
        completion_tokens: 25,
        total_tokens: 40,
      };

      await act(async () => {
        await result.current.saveChatData(mockChatSessions, 'chat-1', updatedTokenUsage);
      });

      expect(mockStorageService.saveChatSessions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'chat-1',
            tokenUsage: updatedTokenUsage,
          }),
          expect.objectContaining({
            id: 'chat-2',
            tokenUsage: mockChatSessions[1].tokenUsage,
          }),
        ])
      );
      expect(mockStorageService.saveActiveChatId).toHaveBeenCalledWith('chat-1');
    });

    test('handles error when saving chat data', async () => {
      const error = new Error('Failed to save');
      mockStorageService.saveChatSessions.mockRejectedValue(error);

      const { result } = renderHook(() => useChatStorage());
      const updatedTokenUsage = {
        prompt_tokens: 15,
        completion_tokens: 25,
        total_tokens: 40,
      };

      await act(async () => {
        await result.current.saveChatData(mockChatSessions, 'chat-1', updatedTokenUsage);
      });

      expect(logger.error).toHaveBeenCalledWith('Failed to save chat data', {
        error: error.message,
        stack: error.stack,
      });
    });

    test('does not update token usage for non-active chats', async () => {
      const { result } = renderHook(() => useChatStorage());
      const updatedTokenUsage = {
        prompt_tokens: 15,
        completion_tokens: 25,
        total_tokens: 40,
      };

      await act(async () => {
        await result.current.saveChatData(mockChatSessions, 'chat-1', updatedTokenUsage);
      });

      const savedSessions = mockStorageService.saveChatSessions.mock.calls[0][0];
      const chat2 = savedSessions.find((s: ChatSession) => s.id === 'chat-2');
      expect(chat2.tokenUsage).toEqual(mockChatSessions[1].tokenUsage);
    });
  });

  test('exposes storage service instance', () => {
    const { result } = renderHook(() => useChatStorage());
    expect(result.current.storageService).toBe(mockStorageService);
  });
});
