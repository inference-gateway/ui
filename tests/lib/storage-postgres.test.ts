import { ChatSession, MessageRole } from '@/types/chat';

const mockPool = {
  connect: jest.fn(),
  end: jest.fn(),
  query: jest.fn(),
};

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => mockPool),
}));

import { PostgresStorageService } from '@/lib/storage-postgres';
import { Pool } from 'pg';

const MockedPool = Pool as jest.MockedClass<typeof Pool>;

describe('PostgresStorageService', () => {
  let mockClient: {
    query: jest.Mock;
    release: jest.Mock;
  };

  const testSession: ChatSession = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Session',
    messages: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        role: MessageRole.user,
        content: 'Hello',
        model: undefined,
        tool_calls: undefined,
        tool_call_id: undefined,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        role: MessageRole.assistant,
        content: 'Hi there!',
        model: 'gpt-4',
        tool_calls: undefined,
        tool_call_id: undefined,
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

    mockPool.connect.mockResolvedValue(mockClient);
    mockPool.end.mockResolvedValue(undefined);
    mockPool.query.mockResolvedValue({ rows: [] });
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

      expect(service).toBeDefined();
      expect(MockedPool).toHaveBeenCalledWith({
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
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Session',
          created_at: new Date('2023-01-01T00:00:00.000Z'),
          prompt_tokens: 100,
          completion_tokens: 150,
          total_tokens: 250,
          messages: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              role: 'user',
              content: 'Hello',
              model: null,
              tool_calls: null,
              tool_call_id: null,
              name: null,
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440002',
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
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [
        'user-123',
      ]);
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
        'SELECT id FROM chat_sessions WHERE user_id = $1',
        ['user-123']
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO chat_sessions'),
        expect.arrayContaining([
          '550e8400-e29b-41d4-a716-446655440000',
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
        expect.arrayContaining([
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440000',
          'user',
          'Hello',
          null,
          null,
          null,
          null,
        ])
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
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
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

      mockClient.query.mockResolvedValueOnce({ rows: [] });
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const activeChatId = await service.getActiveChatId();

      expect(activeChatId).toBe('');
    });

    it('should set first session as active if none exists', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      mockClient.query.mockResolvedValueOnce({ rows: [] });
      mockClient.query.mockResolvedValueOnce({
        rows: [
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            title: 'First Session',
            created_at: new Date(),
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
            messages: [],
          },
        ],
      });

      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // upsert
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: '550e8400-e29b-41d4-a716-446655440003' }] });
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

      const activeChatId = await service.getActiveChatId();

      expect(activeChatId).toBe('550e8400-e29b-41d4-a716-446655440003');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_preferences'),
        ['user-123', '550e8400-e29b-41d4-a716-446655440003']
      );
    });
  });

  describe('saveActiveChatId', () => {
    it('should save active chat ID with upsert', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      // Mock the saveActiveChatId calls (BEGIN, upsert, check, COMMIT)
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // upsert
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: '550e8400-e29b-41d4-a716-446655440004' }] }); // check
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

      await service.saveActiveChatId('550e8400-e29b-41d4-a716-446655440004');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_preferences'),
        ['user-123', '550e8400-e29b-41d4-a716-446655440004']
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should handle race condition when session does not exist yet', async () => {
      const service = new PostgresStorageService({
        connectionUrl: 'postgresql://test',
        userId: 'user-123',
      });

      // Mock the saveActiveChatId calls where session doesn't exist yet
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // upsert
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // check (no session found)
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Should not throw error, just log warning
      await expect(service.saveActiveChatId('550e8400-e29b-41d4-a716-446655440005')).resolves.not.toThrow();

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
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
        "DELETE FROM user_preferences WHERE user_id = ''"
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
