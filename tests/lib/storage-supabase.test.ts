import { SupabaseStorageService } from '@/lib/storage-supabase';
import { ChatSession, StorageType } from '@/types/chat';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
};

const mockFrom = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

// Mock createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  mockSupabaseClient.from.mockReturnValue(mockFrom);
});

describe('SupabaseStorageService', () => {
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

  const supabaseOptions = {
    storageType: StorageType.SUPABASE,
    userId: 'user-123',
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
    },
  };

  describe('initialization', () => {
    it('should create service with valid options', () => {
      const service = new SupabaseStorageService(supabaseOptions);
      expect(service).toBeInstanceOf(SupabaseStorageService);
    });

    it('should throw error without supabase options', () => {
      expect(() => {
        new SupabaseStorageService({ storageType: StorageType.SUPABASE });
      }).toThrow('Supabase configuration is required');
    });
  });

  describe('chat sessions', () => {
    let service: SupabaseStorageService;

    beforeEach(() => {
      service = new SupabaseStorageService(supabaseOptions);
    });

    it('should get chat sessions', async () => {
      const mockData = [
        {
          id: 'test-id',
          title: 'Test Session',
          messages: [],
          created_at: testSession.createdAt,
          user_id: 'user-123',
          token_usage: {
            prompt_tokens: 100,
            completion_tokens: 150,
            total_tokens: 250,
          },
        },
      ];

      // Note: getChatSessions doesn't use .single(), it just returns the data array
      mockFrom.order.mockResolvedValue({ data: mockData, error: null });

      const sessions = await service.getChatSessions();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('chat_sessions');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(sessions).toEqual([testSession]);
    });

    it('should handle empty chat sessions', async () => {
      mockFrom.order.mockResolvedValue({ data: [], error: null });

      const sessions = await service.getChatSessions();
      expect(sessions).toEqual([]);
    });

    it('should save chat sessions', async () => {
      mockFrom.upsert.mockResolvedValue({ error: null });

      await service.saveChatSessions([testSession]);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('chat_sessions');
      expect(mockFrom.upsert).toHaveBeenCalledWith([
        {
          id: 'test-id',
          title: 'Test Session',
          messages: [],
          created_at: testSession.createdAt,
          user_id: 'user-123',
          token_usage: {
            prompt_tokens: 100,
            completion_tokens: 150,
            total_tokens: 250,
          },
        },
      ]);
    });
  });

  describe('active chat ID', () => {
    let service: SupabaseStorageService;

    beforeEach(() => {
      service = new SupabaseStorageService(supabaseOptions);
    });

    it('should get active chat ID', async () => {
      mockFrom.single.mockResolvedValue({
        data: { active_chat_id: 'test-id' },
        error: null,
      });

      const activeId = await service.getActiveChatId();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_preferences');
      expect(mockFrom.select).toHaveBeenCalledWith('active_chat_id');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(activeId).toBe('test-id');
    });

    it('should return empty string when no active chat ID', async () => {
      mockFrom.single.mockResolvedValue({ data: null, error: null });

      const activeId = await service.getActiveChatId();
      expect(activeId).toBe('');
    });

    it('should save active chat ID', async () => {
      mockFrom.upsert.mockResolvedValue({ error: null });

      await service.saveActiveChatId('test-id');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_preferences');
      expect(mockFrom.upsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        active_chat_id: 'test-id',
      });
    });
  });

  describe('selected model', () => {
    let service: SupabaseStorageService;

    beforeEach(() => {
      service = new SupabaseStorageService(supabaseOptions);
    });

    it('should get selected model', async () => {
      mockFrom.single.mockResolvedValue({
        data: { selected_model: 'gpt-4' },
        error: null,
      });

      const model = await service.getSelectedModel();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_preferences');
      expect(mockFrom.select).toHaveBeenCalledWith('selected_model');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(model).toBe('gpt-4');
    });

    it('should return empty string when no selected model', async () => {
      mockFrom.single.mockResolvedValue({ data: null, error: null });

      const model = await service.getSelectedModel();
      expect(model).toBe('');
    });

    it('should save selected model', async () => {
      mockFrom.upsert.mockResolvedValue({ error: null });

      await service.saveSelectedModel('gpt-4');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_preferences');
      expect(mockFrom.upsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        selected_model: 'gpt-4',
      });
    });
  });

  describe('clear', () => {
    let service: SupabaseStorageService;

    beforeEach(() => {
      service = new SupabaseStorageService(supabaseOptions);
    });

    it('should clear all user data', async () => {
      mockFrom.eq.mockResolvedValue({ error: null });

      await service.clear();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('chat_sessions');
      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_preferences');
      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });
});
