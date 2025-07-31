import {
  MessageRole as MessageRoleType,
  SchemaCompletionUsage,
  SchemaMessage,
} from '@inference-gateway/sdk';

export const MessageRole = MessageRoleType;

export interface Message extends SchemaMessage {
  id: string;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt?: string;
  tokenUsage?: SchemaCompletionUsage;
}

export interface StorageService {
  getChatSessions(): Promise<ChatSession[]>;
  saveChatSessions(sessions: ChatSession[]): Promise<void>;
  getActiveChatId(): Promise<string>;
  saveActiveChatId(id: string): Promise<void>;
  getSelectedModel(): Promise<string>;
  saveSelectedModel(model: string): Promise<void>;
  clear(): Promise<void>;
}

export enum StorageType {
  LOCAL = 'local',
  // Future storage types can be added here:
  // DATABASE = 'database',
  // REDIS = 'redis',
  // SUPABASE = 'supabase',
}

export interface StorageConfig {
  type: string;
  // Future storage configurations can be added here
  // database?: DatabaseConfig;
  // redis?: RedisConfig;
}

export interface StorageOptions {
  storageType?: StorageType | string;
  userId?: string;
  // Future options can be added here
  // connectionString?: string;
  // apiKey?: string;
}
