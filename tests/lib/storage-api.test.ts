import { ApiStorageService } from '@/lib/storage-api';
import { ChatSession } from '@/types/chat';

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('@/lib/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('ApiStorageService', () => {
  let apiStorageService: ApiStorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    apiStorageService = new ApiStorageService({ userId: 'test-user' });
  });

  describe('getChatSessions', () => {
    it('should fetch chat sessions from API', async () => {
      const mockChatSessions: ChatSession[] = [
        { id: '1', title: 'Test Chat', messages: [], createdAt: new Date().toISOString() },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ chatSessions: mockChatSessions }),
      });

      const result = await apiStorageService.getChatSessions();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/storage/chat-sessions');
      expect(result).toEqual(mockChatSessions);
    });

    it('should return empty array on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await apiStorageService.getChatSessions();

      expect(result).toEqual([]);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await apiStorageService.getChatSessions();

      expect(result).toEqual([]);
    });
  });

  describe('saveChatSessions', () => {
    it('should save chat sessions via API', async () => {
      const mockChatSessions: ChatSession[] = [
        { id: '1', title: 'Test Chat', messages: [], createdAt: new Date().toISOString() },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiStorageService.saveChatSessions(mockChatSessions);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/storage/chat-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatSessions: mockChatSessions }),
      });
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(apiStorageService.saveChatSessions([])).rejects.toThrow(
        'HTTP error! status: 500'
      );
    });
  });

  describe('getActiveChatId', () => {
    it('should fetch active chat ID from API', async () => {
      const mockActiveChatId = 'chat-123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ activeChatId: mockActiveChatId }),
      });

      const result = await apiStorageService.getActiveChatId();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/storage/active-chat');
      expect(result).toBe(mockActiveChatId);
    });

    it('should return empty string on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await apiStorageService.getActiveChatId();

      expect(result).toBe('');
    });
  });

  describe('saveActiveChatId', () => {
    it('should save active chat ID via API', async () => {
      const activeChatId = 'chat-123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiStorageService.saveActiveChatId(activeChatId);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/storage/active-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activeChatId }),
      });
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(apiStorageService.saveActiveChatId('chat-123')).rejects.toThrow(
        'HTTP error! status: 500'
      );
    });
  });

  describe('getSelectedModel', () => {
    it('should fetch selected model from API', async () => {
      const mockSelectedModel = 'gpt-4';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ selectedModel: mockSelectedModel }),
      });

      const result = await apiStorageService.getSelectedModel();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/storage/selected-model');
      expect(result).toBe(mockSelectedModel);
    });

    it('should return empty string on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await apiStorageService.getSelectedModel();

      expect(result).toBe('');
    });
  });

  describe('saveSelectedModel', () => {
    it('should save selected model via API', async () => {
      const selectedModel = 'gpt-4';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiStorageService.saveSelectedModel(selectedModel);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/storage/selected-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedModel }),
      });
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(apiStorageService.saveSelectedModel('gpt-4')).rejects.toThrow(
        'HTTP error! status: 500'
      );
    });
  });

  describe('clear', () => {
    it('should clear all data via API calls', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ success: true }) })
        .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ success: true }) })
        .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ success: true }) });

      await apiStorageService.clear();

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/storage/chat-sessions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ chatSessions: [] }),
        })
      );
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/storage/active-chat',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ activeChatId: '' }),
        })
      );
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/storage/selected-model',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ selectedModel: '' }),
        })
      );
    });
  });

  describe('close', () => {
    it('should be a no-op', async () => {
      await apiStorageService.close();
    });
  });
});
