import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/storage/chat-sessions/route';
import { ServerStorageServiceFactory } from '@/lib/storage-server';
import { StorageType } from '@/types/chat';
import { Session } from 'next-auth';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/storage-server');
jest.mock('@/lib/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
}));

import { auth } from '@/lib/auth';
const mockAuth = auth as jest.MockedFunction<typeof auth>;

const mockStorageServiceFactory = ServerStorageServiceFactory as jest.Mocked<
  typeof ServerStorageServiceFactory
>;

describe('/api/v1/storage/chat-sessions', () => {
  const mockStorageService = {
    getChatSessions: jest.fn(),
    saveChatSessions: jest.fn(),
    getActiveChatId: jest.fn(),
    saveActiveChatId: jest.fn(),
    getSelectedModel: jest.fn(),
    saveSelectedModel: jest.fn(),
    clear: jest.fn(),
    close: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageServiceFactory.createService.mockReturnValue(mockStorageService);
  });

  describe('GET', () => {
    it('should return chat sessions when authenticated', async () => {
      const mockChatSessions = [
        { id: '1', title: 'Test Chat', messages: [], createdAt: new Date().toISOString() },
      ];

      mockAuth.mockResolvedValue({ user: { id: 'user123' } } as Session);
      mockStorageService.getChatSessions.mockResolvedValue(mockChatSessions);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.chatSessions).toEqual(mockChatSessions);
      expect(mockStorageServiceFactory.createService).toHaveBeenCalledWith({
        storageType: StorageType.LOCAL,
        userId: 'user123',
        connectionUrl: undefined,
      });
    });

    it('should require authentication when ENABLE_AUTH is true', async () => {
      process.env.ENABLE_AUTH = 'true';
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should allow access when ENABLE_AUTH is false', async () => {
      process.env.ENABLE_AUTH = 'false';
      mockAuth.mockResolvedValue(null);
      mockStorageService.getChatSessions.mockResolvedValue([]);

      const response = await GET();

      expect(response.status).toBe(200);
    });

    it('should handle storage service errors', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user123' } } as Session);
      mockStorageService.getChatSessions.mockRejectedValue(new Error('Storage error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST', () => {
    it('should save chat sessions when authenticated', async () => {
      const mockChatSessions = [
        { id: '1', title: 'Test Chat', messages: [], createdAt: new Date().toISOString() },
      ];

      mockAuth.mockResolvedValue({ user: { id: 'user123' } } as Session);
      mockStorageService.saveChatSessions.mockResolvedValue(undefined);

      // Mock the request.json() method
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ chatSessions: mockChatSessions }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockStorageService.saveChatSessions).toHaveBeenCalledWith(mockChatSessions);
    });

    it('should require authentication when ENABLE_AUTH is true', async () => {
      process.env.ENABLE_AUTH = 'true';
      mockAuth.mockResolvedValue(null);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({ chatSessions: [] }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle storage service errors', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user123' } } as Session);
      mockStorageService.saveChatSessions.mockRejectedValue(new Error('Storage error'));

      const mockRequest = {
        json: jest.fn().mockResolvedValue({ chatSessions: [] }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
