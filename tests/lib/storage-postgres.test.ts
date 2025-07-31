import { ChatSession, Message, MessageRole } from '@/types/chat';

// Mock pg module completely to avoid TextEncoder issues
jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

// Import after mocking
import { PostgresStorageService } from '@/lib/storage-postgres';
import { Pool } from 'pg';

const MockPool = Pool as jest.MockedClass<typeof Pool>;

describe('PostgresStorageService', () => {
  let mockPool: jest.Mocked<Pool>;
  let mockClient: any;
  
  const testSession: ChatSession = {
    id: 'test-session-id',
    title: 'Test Session',
    messages: [
      {
        id: 'msg-1',
        role: MessageRole.user,
        content: 'Hello',
        model: null,
        tool_calls: null,
        tool_call_id: null,
      },
      {
        id: 'msg-2',
        role: MessageRole.assistant,
        content: 'Hi there!',
        model: 'gpt-4',
        tool_calls: null,
        tool_call_id: null,
      },
    ],
    createdAt: '2023-01-01T00:00:00.000Z',
    tokenUsage: {
      prompt_tokens: 100,
      completion_tokens: 150,
      total_tokens: 250,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    
    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
      end: jest.fn(),
    } as any;
    
    MockPool.mockImplementation(() => mockPool);
  });

  describe('constructor', () => {
    it('should throw error if no connection URL provided', () => {
      expect(() => new PostgresStorageService({})).toThrow('PostgreSQL connection URL is required');
    });

    it('should create pool with connection URL', () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://user:pass@localhost:5432/db',
        userId: 'user-123',
      });

      expect(MockPool).toHaveBeenCalledWith({
        connectionString: 'postgresql://user:pass@localhost:5432/db',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    });
  });

  describe('getChatSessions', () => {
    it('should fetch chat sessions for user', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      const mockRows = [
        {
          id: 'test-session-id',
          title: 'Test Session',
          created_at: new Date('2023-01-01T00:00:00.000Z'),
          prompt_tokens: 100,
          completion_tokens: 150,
          total_tokens: 250,
          messages: [
            {
              id: 'msg-1',
              role: 'user',
              content: 'Hello',
              model: null,
              tool_calls: null,
              tool_call_id: null,
              name: null,
            },
            {
              id: 'msg-2',
              role: 'assistant',
              content: 'Hi there!',
              model: 'gpt-4',
              tool_calls: null,
              tool_call_id: null,
              name: null,
            },
          ],
        },
      ];

      mockClient.query.mockResolvedValue({ rows: mockRows });

      const sessions = await service.getChatSessions();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['user-123']
      );
      expect(mockClient.release).toHaveBeenCalled();

      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toEqual(testSession);
    });

    it('should handle empty results', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      mockClient.query.mockResolvedValue({ rows: [] });

      const sessions = await service.getChatSessions();

      expect(sessions).toEqual([]);
    });

    it('should handle database errors', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      const error = new Error('Database connection failed');
      mockClient.query.mockRejectedValue(error);

      await expect(service.getChatSessions()).rejects.toThrow('Database connection failed');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('saveChatSessions', () => {
    it('should save chat sessions with transaction', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      mockClient.query.mockResolvedValue({ rows: [] });

      await service.saveChatSessions([testSession]);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM chat_sessions WHERE user_id = $1',
        ['user-123']
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO chat_sessions'),
        expect.arrayContaining([
          'test-session-id',
          'user-123',
          'Test Session',
          expect.any(Date),
          100,
          150,
          250,
        ])
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO messages'),
        expect.arrayContaining(['msg-1', 'test-session-id', 'user', 'Hello', null, null, null, null])
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      const error = new Error('Insert failed');
      mockClient.query.mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // DELETE
        .mockRejectedValue(error); // INSERT (fails)

      await expect(service.saveChatSessions([testSession])).rejects.toThrow('Insert failed');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getActiveChatId', () => {
    it('should return active chat ID for user', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      mockClient.query.mockResolvedValue({
        rows: [{ active_chat_id: 'active-chat-id' }],
      });

      const activeChatId = await service.getActiveChatId();

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT active_chat_id'),
        ['user-123']
      );
      expect(activeChatId).toBe('active-chat-id');
    });

    it('should return empty string if no active chat', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      // Mock for active chat query (empty result)
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // Mock for getChatSessions call (empty result)
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const activeChatId = await service.getActiveChatId();

      expect(activeChatId).toBe('');
    });

    it('should set first session as active if none exists', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      // Mock for active chat query (empty result)
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // Mock for getChatSessions call (has sessions)
      mockClient.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'first-session',
            title: 'First Session',
            created_at: new Date(),
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
            messages: [],
          },
        ],
      });
      // Mock for saveActiveChatId
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const activeChatId = await service.getActiveChatId();

      expect(activeChatId).toBe('first-session');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_preferences'),
        ['user-123', 'first-session']
      );
    });
  });

  describe('saveActiveChatId', () => {
    it('should save active chat ID with upsert', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      mockClient.query.mockResolvedValue({ rows: [] });

      await service.saveActiveChatId('new-active-id');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_preferences'),
        ['user-123', 'new-active-id']
      );
    });
  });

  describe('getSelectedModel', () => {
    it('should return selected model for user', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      mockClient.query.mockResolvedValue({
        rows: [{ selected_model: 'gpt-4' }],
      });

      const selectedModel = await service.getSelectedModel();

      expect(selectedModel).toBe('gpt-4');
    });

    it('should return empty string if no selected model', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      mockClient.query.mockResolvedValue({ rows: [] });

      const selectedModel = await service.getSelectedModel();

      expect(selectedModel).toBe('');
    });
  });

  describe('saveSelectedModel', () => {
    it('should save selected model with upsert', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      mockClient.query.mockResolvedValue({ rows: [] });

      await service.saveSelectedModel('gpt-4');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_preferences'),
        ['user-123', 'gpt-4']
      );
    });
  });

  describe('clear', () => {
    it('should clear all user data with transaction', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      mockClient.query.mockResolvedValue({ rows: [] });

      await service.clear();

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM chat_sessions WHERE user_id = $1',
        ['user-123']
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM user_preferences WHERE user_id = $1',
        ['user-123']
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should handle users without userId', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
      });

      mockClient.query.mockResolvedValue({ rows: [] });

      await service.clear();

      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM chat_sessions WHERE user_id IS NULL'
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM user_preferences WHERE user_id = \'\''
      );
    });
  });

  describe('close', () => {
    it('should close the connection pool', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      await service.close();

      expect(mockPool.end).toHaveBeenCalled();
    });
  });
});