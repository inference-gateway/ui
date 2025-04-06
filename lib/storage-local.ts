import logger from "@/lib/logger";
import type { StorageOptions, StorageService } from "@/types/chat";
import { ChatSession } from "@/types/chat";

export class LocalStorageService implements StorageService {
  private userId?: string;

  constructor(options?: StorageOptions) {
    this.userId = options?.userId;
  }

  private getStorageKey(key: string): string {
    return this.userId ? `${this.userId}_${key}` : key;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    const key = this.getStorageKey("chatSessions");
    const saved = localStorage.getItem(key);
    if (!saved) {
      logger.debug("No chat sessions found in storage", { key });
      return [];
    }
    try {
      const sessions = JSON.parse(saved);
      logger.debug("Loaded chat sessions from storage", {
        key,
        count: sessions.length,
      });
      return sessions;
    } catch (error) {
      logger.error("Failed to parse chat sessions", {
        key,
        error: error instanceof Error ? error.message : error,
      });
      return [];
    }
  }

  async saveChatSessions(sessions: ChatSession[]): Promise<void> {
    const key = this.getStorageKey("chatSessions");
    logger.debug("Saving chat sessions to storage", {
      key,
      count: sessions.length,
    });
    localStorage.setItem(key, JSON.stringify(sessions));
  }

  async getActiveChatId(): Promise<string> {
    const key = this.getStorageKey("activeChatId");
    const saved = localStorage.getItem(key);
    if (!saved) {
      logger.debug("No active chat ID found, checking sessions", { key });
      const sessions = await this.getChatSessions();
      const firstSessionId = sessions[0]?.id;
      if (firstSessionId) {
        logger.debug("Setting first session as active", {
          id: firstSessionId,
        });
        await this.saveActiveChatId(firstSessionId);
        return firstSessionId;
      }
      logger.debug("No sessions available to set as active");
      return "";
    }
    logger.debug("Found active chat ID in storage", { key, id: saved });
    return saved;
  }

  async saveActiveChatId(id: string): Promise<void> {
    const key = this.getStorageKey("activeChatId");
    logger.debug("Saving active chat ID", { key, id });
    localStorage.setItem(key, id);
  }

  async clear(): Promise<void> {
    const sessionsKey = this.getStorageKey("chatSessions");
    const activeKey = this.getStorageKey("activeChatId");

    localStorage.removeItem(sessionsKey);
    localStorage.removeItem(activeKey);
  }
}
