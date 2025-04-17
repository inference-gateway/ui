import { ChatSession, Message } from '@/types/chat';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';

export interface ChatState {
  sessions: ChatSession[];
  activeId: string;
  messages: Message[];
}

export interface UIState {
  isLoading: boolean;
  isStreaming: boolean;
  isDarkMode: boolean;
  error: string | null;
}

export interface StorageService {
  getChatSessions(): Promise<ChatSession[]>;
  saveChatSessions(sessions: ChatSession[]): Promise<void>;
  getActiveChatId(): Promise<string>;
  saveActiveChatId(id: string): Promise<void>;
}

export interface ChatContextProps {
  chatContainerRef: React.RefObject<HTMLDivElement>;
  isDarkMode: boolean;
  toggleTheme: () => void;
  chatSessions: ChatSession[];
  activeChatId: string;
  messages: Message[];
  selectedModel: string;
  isLoading: boolean;
  isStreaming: boolean;
  tokenUsage: SchemaCompletionUsage;
  error: string | null;
  clearError: () => void;
  setSelectedModel: (model: string) => Promise<void>;
  handleNewChat: () => Promise<void>;
  handleSendMessage: (message: string) => Promise<void>;
  handleSelectChat: (id: string) => Promise<void>;
  handleDeleteChat: (id: string) => void;
  handleResendLastMessage: () => void;
}
