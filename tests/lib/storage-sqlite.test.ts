import { ChatSession, MessageRole } from '@/types/chat';

const mockDatabase = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
  serialize: jest.fn(),
  parallelize: jest.fn(),
  close: jest.fn(),
  exec: jest.fn(),
};

jest.mock('sqlite3', () => ({
  Database: jest.fn().mockImplementation(() => mockDatabase),
  OPEN_READWRITE: 'OPEN_READWRITE',
  OPEN_CREATE: 'OPEN_CREATE',
}));

import { SqliteStorageService } from '@/lib/storage-sqlite';
import { Database } from 'sqlite3';

const MockedDatabase = Database as jest.MockedClass<typeof Database>;

describe('SqliteStorageService', () => {
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
    
    // Set up default mock behaviors
    mockDatabase.run.mockImplementation((sql, params, callback) => {
      if (callback) callback.call({ lastID: 1, changes: 1 }, null);
      return mockDatabase;
    });
    
    mockDatabase.get.mockImplementation((sql, params, callback) => {
      if (callback) callback(null, null);
      return mockDatabase;
    });
    
    mockDatabase.all.mockImplementation((sql, params, callback) => {
      if (callback) callback(null, []);
      return mockDatabase;
    });
    
    mockDatabase.serialize.mockImplementation((callback) => {
      if (callback) {
        // Execute the callback immediately for tests
        callback();
      }
      return mockDatabase;
    });
    
    mockDatabase.parallelize.mockImplementation((callback) => {
      if (callback) {
        callback();
      }
      return mockDatabase;
    });
    
    mockDatabase.close.mockImplementation((callback) => {
      if (callback) callback(null);
      return mockDatabase;
    });
    
    mockDatabase.exec.mockImplementation((sql, callback) => {
      if (callback) callback(null);
      return mockDatabase;
    });
  });

  describe('constructor', () => {
    it('should throw error if no connection URL provided', () => {
      expect(() => new SqliteStorageService({})).toThrow('SQLite connection URL is required');
    });

    it('should create database with connection URL', () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      expect(service).toBeDefined();
      expect(MockedDatabase).toHaveBeenCalledWith(
        './test.db',
        expect.any(Number),
        expect.any(Function)
      );
    });

    it('should handle sqlite:// URLs', () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite://./test.db',
        userId: 'user-123',
      });

      expect(service).toBeDefined();
      expect(MockedDatabase).toHaveBeenCalledWith(
        './test.db',
        expect.any(Number),
        expect.any(Function)
      );
    });

    it('should handle file: URLs', () => {
      const service = new SqliteStorageService({
        connectionUrl: 'file:./test.db',
        userId: 'user-123',
      });

      expect(service).toBeDefined();
      expect(MockedDatabase).toHaveBeenCalledWith(
        './test.db',
        expect.any(Number),
        expect.any(Function)
      );
    });

    it('should handle in-memory databases', () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite::memory:',
        userId: 'user-123',
      });

      expect(service).toBeDefined();
      expect(MockedDatabase).toHaveBeenCalledWith(
        ':memory:',
        expect.any(Number),
        expect.any(Function)
      );
    });
  });

  describe('getChatSessions', () => {
    it('should fetch chat sessions for user', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      const mockRows = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Session',
          created_at: '2023-01-01T00:00:00.000Z',
          prompt_tokens: 100,
          completion_tokens: 150,
          total_tokens: 250,
        },
      ];

      const mockMessages = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          session_id: '550e8400-e29b-41d4-a716-446655440000',
          role: 'user',
          content: 'Hello',
          model: null,
          tool_calls: null,
          tool_call_id: null,
          name: null,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          session_id: '550e8400-e29b-41d4-a716-446655440000',
          role: 'assistant',
          content: 'Hi there!',
          model: 'gpt-4',
          tool_calls: null,
          tool_call_id: null,
          name: null,
        },
      ];

      mockDatabase.all
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, mockRows);
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, mockMessages);
        });

      const sessions = await service.getChatSessions();

      expect(mockDatabase.all).toHaveBeenCalledTimes(2);
      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toEqual(testSession);
    });

    it('should handle empty results', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      mockDatabase.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const sessions = await service.getChatSessions();

      expect(sessions).toEqual([]);
    });

    it('should handle database errors', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      const error = new Error('Database error');
      mockDatabase.all.mockImplementation((sql, params, callback) => {
        callback(error, null);
      });

      await expect(service.getChatSessions()).rejects.toThrow('Database error');
    });
  });

  describe('saveChatSessions', () => {
    it('should save chat sessions with transaction', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      // Mock existing sessions query - return empty array to simulate no existing sessions
      mockDatabase.all.mockImplementation((sql, params, callback) => {
        if (sql.includes('SELECT id FROM chat_sessions')) {
          callback(null, []);
        } else {
          callback(null, []);
        }
      });

      // Mock transaction methods
      let runCallCount = 0;
      mockDatabase.run.mockImplementation((sql, params, callback) => {
        runCallCount++;
        if (typeof params === 'function') {
          // If params is actually the callback (no params provided)
          callback = params;
        }
        if (callback) {
          callback.call({ lastID: 1, changes: 1 }, null);
        }
        return mockDatabase;
      });

      await service.saveChatSessions([testSession]);

      expect(mockDatabase.serialize).toHaveBeenCalled();
      expect(mockDatabase.run).toHaveBeenCalledWith('BEGIN TRANSACTION', expect.any(Function));
      expect(mockDatabase.run).toHaveBeenCalledWith('COMMIT', expect.any(Function));
    });

    it('should rollback on error', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      const error = new Error('Insert failed');
      let callCount = 0;
      
      mockDatabase.all.mockImplementation((sql, params, callback) => {
        callback(null, []); // Mock empty existing sessions
      });
      
      mockDatabase.run.mockImplementation((sql, params, callback) => {
        callCount++;
        if (typeof params === 'function') {
          callback = params;
        }
        
        // Fail on the session insert
        if (sql.includes('INSERT OR REPLACE INTO chat_sessions')) {
          if (callback) callback.call({ lastID: 1, changes: 1 }, error);
        } else {
          if (callback) callback.call({ lastID: 1, changes: 1 }, null);
        }
        return mockDatabase;
      });

      await expect(service.saveChatSessions([testSession])).rejects.toThrow('Insert failed');

      expect(mockDatabase.run).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getActiveChatId', () => {
    it('should return active chat ID for user', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      mockDatabase.get.mockImplementation((sql, params, callback) => {
        callback(null, { active_chat_id: 'active-chat-id' });
      });

      const activeChatId = await service.getActiveChatId();

      expect(mockDatabase.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT active_chat_id'),
        ['user-123'],
        expect.any(Function)
      );
      expect(activeChatId).toBe('active-chat-id');
    });

    it('should return empty string if no active chat', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      mockDatabase.get
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, null);
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, []);
        });

      mockDatabase.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const activeChatId = await service.getActiveChatId();

      expect(activeChatId).toBe('');
    });
  });

  describe('saveActiveChatId', () => {
    it('should save active chat ID with upsert', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      mockDatabase.run.mockImplementation((sql, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
        }
        if (callback) {
          callback.call({ lastID: 1, changes: 1 }, null);
        }
        return mockDatabase;
      });

      await service.saveActiveChatId('550e8400-e29b-41d4-a716-446655440004');

      expect(mockDatabase.serialize).toHaveBeenCalled();
      expect(mockDatabase.run).toHaveBeenCalledWith('BEGIN TRANSACTION', expect.any(Function));
      expect(mockDatabase.run).toHaveBeenCalledWith('COMMIT', expect.any(Function));
    });
  });

  describe('getSelectedModel', () => {
    it('should return selected model for user', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      // Reset the mock before setting up the new implementation
      mockDatabase.get.mockReset();
      mockDatabase.get.mockImplementation((sql, params, callback) => {
        callback(null, { selected_model: 'gpt-4' });
      });

      const selectedModel = await service.getSelectedModel();

      expect(selectedModel).toBe('gpt-4');
    });

    it('should return empty string if no selected model', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      // Reset the mock before setting up the new implementation
      mockDatabase.get.mockReset();
      mockDatabase.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const selectedModel = await service.getSelectedModel();

      expect(selectedModel).toBe('');
    });
  });

  describe('saveSelectedModel', () => {
    it('should save selected model with upsert', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      await service.saveSelectedModel('gpt-4');

      expect(mockDatabase.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO user_preferences'),
        ['user-123', 'gpt-4'],
        expect.any(Function)
      );
    });
  });

  describe('clear', () => {
    it('should clear all user data', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      mockDatabase.run.mockImplementation((sql, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
        }
        if (callback) {
          callback.call({ lastID: 1, changes: 1 }, null);
        }
        return mockDatabase;
      });

      await service.clear();

      expect(mockDatabase.serialize).toHaveBeenCalled();
      expect(mockDatabase.run).toHaveBeenCalledWith('BEGIN TRANSACTION', expect.any(Function));
      expect(mockDatabase.run).toHaveBeenCalledWith('COMMIT', expect.any(Function));
    });

    it('should handle users without userId', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
      });

      mockDatabase.run.mockImplementation((sql, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
        }
        if (callback) {
          callback.call({ lastID: 1, changes: 1 }, null);
        }
        return mockDatabase;
      });

      await service.clear();

      expect(mockDatabase.serialize).toHaveBeenCalled();
      expect(mockDatabase.run).toHaveBeenCalledWith('BEGIN TRANSACTION', expect.any(Function));
      expect(mockDatabase.run).toHaveBeenCalledWith('COMMIT', expect.any(Function));
    });
  });

  describe('close', () => {
    it('should close the database connection', async () => {
      const service = new SqliteStorageService({
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      await service.close();

      expect(mockDatabase.close).toHaveBeenCalled();
    });
  });
});