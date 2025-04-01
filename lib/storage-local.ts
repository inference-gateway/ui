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
    return saved
      ? JSON.parse(saved)
      : [{ id: "1", title: "New Chat", messages: [] }];
  }

  async saveChatSessions(sessions: ChatSession[]): Promise<void> {
    localStorage.setItem(
      this.getStorageKey("chatSessions"),
      JSON.stringify(sessions)
    );
  }

  async getActiveChatId(): Promise<string> {
    const saved = localStorage.getItem(this.getStorageKey("activeChatId"));
    return saved || "1";
  }

  async saveActiveChatId(id: string): Promise<void> {
    localStorage.setItem(this.getStorageKey("activeChatId"), id);
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.getStorageKey("chatSessions"));
    localStorage.removeItem(this.getStorageKey("activeChatId"));
  }
}
