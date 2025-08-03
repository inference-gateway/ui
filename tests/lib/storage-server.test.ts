import { StorageType } from '@/types/chat';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock the storage services
jest.mock('@/lib/storage-local', () => ({
  LocalStorageService: jest.fn().mockImplementation(() => ({
    getChatSessions: jest.fn(),
    saveChatSessions: jest.fn(),
  })),
}));

jest.mock('@/lib/storage-postgres', () => ({
  PostgresStorageService: jest.fn().mockImplementation(() => ({
    getChatSessions: jest.fn(),
    saveChatSessions: jest.fn(),
  })),
}));

jest.mock('@/lib/storage-sqlite', () => ({
  SqliteStorageService: jest.fn().mockImplementation(() => ({
    getChatSessions: jest.fn(),
    saveChatSessions: jest.fn(),
  })),
}));

import { ServerStorageServiceFactory } from '@/lib/storage-server';
import { LocalStorageService } from '@/lib/storage-local';
import { PostgresStorageService } from '@/lib/storage-postgres';
import { SqliteStorageService } from '@/lib/storage-sqlite';

const MockedLocalStorageService = LocalStorageService as jest.MockedClass<typeof LocalStorageService>;
const MockedPostgresStorageService = PostgresStorageService as jest.MockedClass<typeof PostgresStorageService>;
const MockedSqliteStorageService = SqliteStorageService as jest.MockedClass<typeof SqliteStorageService>;

describe('ServerStorageServiceFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createService', () => {
    it('should create LocalStorageService by default', () => {
      const service = ServerStorageServiceFactory.createService();

      expect(MockedLocalStorageService).toHaveBeenCalledWith(undefined);
      expect(service).toBeDefined();
    });

    it('should create LocalStorageService for local storage type', () => {
      const service = ServerStorageServiceFactory.createService({
        storageType: StorageType.LOCAL,
        userId: 'user-123',
      });

      expect(MockedLocalStorageService).toHaveBeenCalledWith({
        storageType: StorageType.LOCAL,
        userId: 'user-123',
      });
      expect(service).toBeDefined();
    });

    it('should create PostgresStorageService for postgres storage type', () => {
      const service = ServerStorageServiceFactory.createService({
        storageType: StorageType.POSTGRES,
        connectionUrl: 'postgresql://user:pass@localhost:5432/db',
        userId: 'user-123',
      });

      expect(MockedPostgresStorageService).toHaveBeenCalledWith({
        storageType: StorageType.POSTGRES,
        connectionUrl: 'postgresql://user:pass@localhost:5432/db',
        userId: 'user-123',
      });
      expect(service).toBeDefined();
    });

    it('should create SqliteStorageService for sqlite storage type', () => {
      const service = ServerStorageServiceFactory.createService({
        storageType: StorageType.SQLITE,
        connectionUrl: 'sqlite:./database.db',
        userId: 'user-123',
      });

      expect(MockedSqliteStorageService).toHaveBeenCalledWith({
        storageType: StorageType.SQLITE,
        connectionUrl: 'sqlite:./database.db',
        userId: 'user-123',
      });
      expect(service).toBeDefined();
    });

    it('should fallback to LocalStorageService if PostgreSQL connectionUrl is missing', () => {
      const service = ServerStorageServiceFactory.createService({
        storageType: StorageType.POSTGRES,
        userId: 'user-123',
      });

      expect(MockedLocalStorageService).toHaveBeenCalledWith({
        storageType: StorageType.POSTGRES,
        userId: 'user-123',
      });
      expect(MockedPostgresStorageService).not.toHaveBeenCalled();
    });

    it('should fallback to LocalStorageService if SQLite connectionUrl is missing', () => {
      const service = ServerStorageServiceFactory.createService({
        storageType: StorageType.SQLITE,
        userId: 'user-123',
      });

      expect(MockedLocalStorageService).toHaveBeenCalledWith({
        storageType: StorageType.SQLITE,
        userId: 'user-123',
      });
      expect(MockedSqliteStorageService).not.toHaveBeenCalled();
    });

    it('should fallback to LocalStorageService if PostgreSQL service creation fails', () => {
      MockedPostgresStorageService.mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const service = ServerStorageServiceFactory.createService({
        storageType: StorageType.POSTGRES,
        connectionUrl: 'postgresql://invalid',
        userId: 'user-123',
      });

      expect(MockedPostgresStorageService).toHaveBeenCalled();
      expect(MockedLocalStorageService).toHaveBeenCalledWith({
        storageType: StorageType.POSTGRES,
        connectionUrl: 'postgresql://invalid',
        userId: 'user-123',
      });
    });

    it('should fallback to LocalStorageService if SQLite service creation fails', () => {
      MockedSqliteStorageService.mockImplementationOnce(() => {
        throw new Error('Database file access denied');
      });

      const service = ServerStorageServiceFactory.createService({
        storageType: StorageType.SQLITE,
        connectionUrl: 'sqlite:/invalid/path/database.db',
        userId: 'user-123',
      });

      expect(MockedSqliteStorageService).toHaveBeenCalled();
      expect(MockedLocalStorageService).toHaveBeenCalledWith({
        storageType: StorageType.SQLITE,
        connectionUrl: 'sqlite:/invalid/path/database.db',
        userId: 'user-123',
      });
    });

    it('should handle string storage types', () => {
      const service = ServerStorageServiceFactory.createService({
        storageType: 'sqlite',
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });

      expect(MockedSqliteStorageService).toHaveBeenCalledWith({
        storageType: 'sqlite',
        connectionUrl: 'sqlite:./test.db',
        userId: 'user-123',
      });
    });

    it('should fallback to LocalStorageService for unknown storage types', () => {
      const service = ServerStorageServiceFactory.createService({
        storageType: 'unknown' as any,
        userId: 'user-123',
      });

      expect(MockedLocalStorageService).toHaveBeenCalledWith({
        storageType: 'unknown',
        userId: 'user-123',
      });
    });
  });
});