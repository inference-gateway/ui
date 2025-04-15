import { SchemaMessage } from '@inference-gateway/sdk';

export interface Message extends SchemaMessage {
  id: string;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt?: number;
}

export interface StorageService {
  getChatSessions(): Promise<ChatSession[]>;
  saveChatSessions(sessions: ChatSession[]): Promise<void>;
  getActiveChatId(): Promise<string>;
  saveActiveChatId(id: string): Promise<void>;
  clear(): Promise<void>;
}

export enum StorageType {
  LOCAL = 'local',
}

export interface StorageOptions {
  storageType?: StorageType;
  userId?: string;
}
