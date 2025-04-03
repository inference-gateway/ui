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
    const saved = localStorage.getItem(this.getStorageKey("chatSessions"));
    if (!saved) {
      return [];
    }
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  async saveChatSessions(sessions: ChatSession[]): Promise<void> {
    localStorage.setItem(
      this.getStorageKey("chatSessions"),
      JSON.stringify(sessions)
    );
  }

  async getActiveChatId(): Promise<string> {
    const saved = localStorage.getItem(this.getStorageKey("activeChatId"));
    if (!saved) {
      const sessions = await this.getChatSessions();
      const firstSessionId = sessions[0]?.id;
      if (firstSessionId) {
        await this.saveActiveChatId(firstSessionId);
        return firstSessionId;
      }
    }
    return saved || "";
  }

  async saveActiveChatId(id: string): Promise<void> {
    localStorage.setItem(this.getStorageKey("activeChatId"), id);
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.getStorageKey("chatSessions"));
    localStorage.removeItem(this.getStorageKey("activeChatId"));
  }
}
