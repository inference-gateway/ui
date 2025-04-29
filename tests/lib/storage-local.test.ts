import { LocalStorageService } from '@/lib/storage-local';
import { MockStorageLocal } from '@/tests/mocks/storage';
import { ChatSession } from '@/types/chat';

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: MockStorageLocal,
  });
});

beforeEach(() => {
  (localStorage.getItem as jest.Mock).mockClear();
  (localStorage.setItem as jest.Mock).mockClear();
  (localStorage.removeItem as jest.Mock).mockClear();
  localStorage.clear();
});

describe('LocalStorageService', () => {
  const testSession: ChatSession = {
    id: 'test-id',
    title: 'Test Session',
    messages: [],
    createdAt: new Date().toISOString(),
    tokenUsage: {
      prompt_tokens: 100,
      completion_tokens: 150,
      total_tokens: 250,
    },
  };

  describe('without userId', () => {
    const service = new LocalStorageService();

    it('should save and get chat sessions', async () => {
      await service.saveChatSessions([testSession]);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'chatSessions',
        JSON.stringify([testSession])
      );

      const sessions = await service.getChatSessions();
      expect(sessions).toEqual([testSession]);
    });

    it('should handle empty chat sessions', async () => {
      const sessions = await service.getChatSessions();
      expect(sessions).toEqual([]);
    });

    it('should save and get active chat ID', async () => {
      await service.saveActiveChatId('test-id');
      expect(localStorage.setItem).toHaveBeenCalledWith('activeChatId', 'test-id');

      const activeId = await service.getActiveChatId();
      expect(activeId).toBe('test-id');
    });

    it('should return empty string for missing active chat ID', async () => {
      const activeId = await service.getActiveChatId();
      expect(activeId).toBe('');
    });

    it('should store token usage in chat sessions', async () => {
      const sessionWithTokens: ChatSession = {
        id: 'token-test',
        title: 'Token Test Session',
        messages: [],
        createdAt: new Date().toISOString(),
        tokenUsage: {
          prompt_tokens: 200,
          completion_tokens: 300,
          total_tokens: 500,
        },
      };

      await service.saveChatSessions([sessionWithTokens]);
      const sessions = await service.getChatSessions();

      expect(sessions[0].tokenUsage).toBeDefined();
      expect(sessions[0].tokenUsage).toEqual({
        prompt_tokens: 200,
        completion_tokens: 300,
        total_tokens: 500,
      });
    });

    it('should clear storage', async () => {
      await service.saveChatSessions([testSession]);
      await service.saveActiveChatId('test-id');
      await service.clear();

      expect(localStorage.removeItem).toHaveBeenCalledWith('chatSessions');
      expect(localStorage.removeItem).toHaveBeenCalledWith('activeChatId');
    });
  });

  describe('with userId', () => {
    const service = new LocalStorageService({ userId: 'user-123' });

    it('should use userId in storage keys', async () => {
      await service.saveChatSessions([testSession]);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user-123_chatSessions',
        JSON.stringify([testSession])
      );

      await service.getChatSessions();
      expect(localStorage.getItem).toHaveBeenCalledWith('user-123_chatSessions');
    });

    it('should handle first active chat ID', async () => {
      await service.saveChatSessions([testSession]);
      const activeId = await service.getActiveChatId();

      expect(activeId).toBe(testSession.id);
      expect(localStorage.setItem).toHaveBeenCalledWith('user-123_activeChatId', testSession.id);
    });
  });
});
