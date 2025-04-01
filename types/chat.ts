import { SchemaMessage } from "@inference-gateway/sdk";

export interface Message extends SchemaMessage {
  id: string;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export interface StorageService {
  getChatSessions(): Promise<ChatSession[]>;
  saveChatSessions(sessions: ChatSession[]): Promise<void>;
  getActiveChatId(): Promise<string>;
  saveActiveChatId(id: string): Promise<void>;
  clear(): Promise<void>;
}

export interface StorageOptions {
  userId?: string;
  storageType?: "local" | "redis";
  redisOptions?: import("ioredis").RedisOptions;
}
