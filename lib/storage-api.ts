import { ChatSession, StorageService, StorageOptions } from '@/types/chat';
import logger from '@/lib/logger';

/**
 * API-based storage service that communicates with server-side storage through API routes.
 * This allows the client to use PostgreSQL storage without importing server-only dependencies.
 */
export class ApiStorageService implements StorageService {
  private userId?: string;

  constructor(options?: StorageOptions) {
    this.userId = options?.userId;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response = await fetch('/api/v1/storage/chat-sessions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.chatSessions || [];
    } catch (error) {
      logger.error('Failed to fetch chat sessions from API', {
        error: error instanceof Error ? error.message : error,
        userId: this.userId,
      });
      return [];
    }
  }

  async saveChatSessions(chatSessions: ChatSession[]): Promise<void> {
    try {
      const response = await fetch('/api/v1/storage/chat-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatSessions }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to save chat sessions to API', {
        error: error instanceof Error ? error.message : error,
        userId: this.userId,
        sessionCount: chatSessions.length,
      });
      throw error;
    }
  }

  async getActiveChatId(): Promise<string> {
    try {
      const response = await fetch('/api/v1/storage/active-chat');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.activeChatId || '';
    } catch (error) {
      logger.error('Failed to fetch active chat ID from API', {
        error: error instanceof Error ? error.message : error,
        userId: this.userId,
      });
      return '';
    }
  }

  async saveActiveChatId(activeChatId: string): Promise<void> {
    try {
      const response = await fetch('/api/v1/storage/active-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activeChatId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to save active chat ID to API', {
        error: error instanceof Error ? error.message : error,
        userId: this.userId,
        activeChatId,
      });
      throw error;
    }
  }

  /**
   * Saves chat sessions and sets the active chat ID atomically via API
   * This helps prevent race conditions by doing both operations together
   */
  async getSelectedModel(): Promise<string> {
    try {
      const response = await fetch('/api/v1/storage/selected-model');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.selectedModel || '';
    } catch (error) {
      logger.error('Failed to fetch selected model from API', {
        error: error instanceof Error ? error.message : error,
        userId: this.userId,
      });
      return '';
    }
  }

  async saveSelectedModel(selectedModel: string): Promise<void> {
    try {
      const response = await fetch('/api/v1/storage/selected-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedModel }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to save selected model to API', {
        error: error instanceof Error ? error.message : error,
        userId: this.userId,
        selectedModel,
      });
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await Promise.all([
        this.saveChatSessions([]),
        this.saveActiveChatId(''),
        this.saveSelectedModel(''),
      ]);
    } catch (error) {
      logger.error('Failed to clear storage via API', {
        error: error instanceof Error ? error.message : error,
        userId: this.userId,
      });
      throw error;
    }
  }

  async close(): Promise<void> {
    // No-op for API-based service
  }
}
