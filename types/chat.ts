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
  saveChatData?(sessions: ChatSession[], activeChatId?: string): Promise<void>;
}

export enum StorageType {
  LOCAL = 'local',
  POSTGRES = 'postgres',
  SQLITE = 'sqlite',
}

export interface StorageConfig {
  type: string;
  connectionUrl?: string;
}

export interface StorageOptions {
  storageType?: StorageType | string;
  userId?: string;
  connectionUrl?: string;
}
