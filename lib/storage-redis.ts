import { ChatSession, StorageOptions, StorageService } from "@/types/chat";

type RedisClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  del: (key: string) => Promise<void>;
};

export class RedisStorageService implements StorageService {
  private redisClient: RedisClient = {
    get: async () => {
      throw new Error("Redis client not initialized");
    },
    set: async () => {
      throw new Error("Redis client not initialized");
    },
    del: async () => {
      throw new Error("Redis client not initialized");
    },
  };
  private isAvailable: boolean = false;
  private userId?: string;

  constructor(options?: StorageOptions) {
    this.userId = options?.userId;
    try {
      this.redisClient = this.createRedisClient();
      this.isAvailable = true;
    } catch (error) {
      console.error("Failed to initialize Redis client:", error);
      this.isAvailable = false;
    }
  }

  private createRedisClient(): RedisClient {
    return {
      get: async (key: string) => {
        try {
          const endpoint =
            key === "chatSessions"
              ? "/api/storage/sessions"
              : "/api/storage/active-id";
          const response = await fetch(endpoint);
          if (!response.ok) {
            if (response.status === 503) {
              this.isAvailable = false;
            }
            throw new Error(`API request failed: ${response.statusText}`);
          }
          return await response.text();
        } catch (error) {
          console.error("API request failed:", error);
          throw error;
        }
      },
      set: async (key: string, value: string) => {
        try {
          const endpoint =
            key === "chatSessions"
              ? "/api/storage/sessions"
              : "/api/storage/active-id";
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ value }),
          });
          if (!response.ok) {
            if (response.status === 503) {
              this.isAvailable = false;
            }
            throw new Error(`API request failed: ${response.statusText}`);
          }
        } catch (error) {
          console.error("API request failed:", error);
          throw error;
        }
      },
      del: async (key: string) => {
        try {
          const endpoint =
            key === "chatSessions"
              ? "/api/storage/sessions"
              : "/api/storage/active-id";
          const response = await fetch(endpoint, {
            method: "DELETE",
          });
          if (!response.ok) {
            if (response.status === 503) {
              this.isAvailable = false;
            }
            throw new Error(`API request failed: ${response.statusText}`);
          }
        } catch (error) {
          console.error("API request failed:", error);
          throw error;
        }
      },
    };
  }

  public isRedisAvailable(): boolean {
    return this.isAvailable;
  }

  private getKey(baseKey: string): string {
    return this.userId ? `${this.userId}_${baseKey}` : baseKey;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const sessions = await this.redisClient.get(this.getKey("chatSessions"));
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error("Failed to get chat sessions:", error);
      throw error;
    }
  }

  async saveChatSessions(sessions: ChatSession[]): Promise<void> {
    try {
      await this.redisClient.set(
        this.getKey("chatSessions"),
        JSON.stringify(sessions)
      );
    } catch (error) {
      console.error("Failed to save chat sessions:", error);
      throw error;
    }
  }

  async getActiveChatId(): Promise<string> {
    try {
      const activeId = await this.redisClient.get(this.getKey("activeChatId"));
      return activeId || "1";
    } catch (error) {
      console.error("Failed to get active chat ID:", error);
      throw error;
    }
  }

  async saveActiveChatId(id: string): Promise<void> {
    try {
      await this.redisClient.set(this.getKey("activeChatId"), id);
    } catch (error) {
      console.error("Failed to save active chat ID:", error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redisClient.del(this.getKey("chatSessions"));
      await this.redisClient.del(this.getKey("activeChatId"));
    } catch (error) {
      console.error("Failed to clear storage:", error);
      throw error;
    }
  }
}
