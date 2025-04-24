'use client';

import { SchemaCompletionUsage } from '@inference-gateway/sdk';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { ChatState, UIState } from './types';
import { useApiClient } from './use-api-client';
import { useChatScroll } from './use-chat-scroll';
import { useChatSessions } from './use-chat-sessions';
import { useChatStorage } from './use-chat-storage';
import { useMessageHandler } from './use-message-handler';
import { useThemeManager } from './use-theme-manager';
import { createEmptyTokenUsage } from './utils';

/**
 * Main hook for chat functionality
 */
export function useChat(initialDarkMode = true) {
  const { data: session } = useSession() || { data: undefined };

  const clientInstance = useApiClient(session?.accessToken);
  const { isDarkMode, toggleTheme } = useThemeManager(initialDarkMode);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { storageService, loadChatData, saveChatData } = useChatStorage();
  const [selectedModel, _setSelectedModel] = useState('');
  const [tokenUsage, setTokenUsage] = useState<SchemaCompletionUsage>(createEmptyTokenUsage());

  const [chatState, setChatState] = useState<ChatState>({
    sessions: [],
    activeId: '',
    messages: [],
  });

  const [uiState, setUIState] = useState<UIState>({
    isLoading: false,
    isStreaming: false,
    isDarkMode: initialDarkMode,
    error: null,
  });

  const { sessions, activeId, messages } = chatState;
  const { isLoading, isStreaming, error } = uiState;

  const { handleNewChat, handleSelectChat, handleDeleteChat } = useChatSessions(
    chatState,
    setChatState,
    setTokenUsage,
    storageService
  );

  useChatScroll(chatContainerRef, messages, isStreaming);

  const { handleSendMessage, clearError } = useMessageHandler(
    clientInstance,
    selectedModel,
    chatState,
    setChatState,
    setUIState,
    setTokenUsage,
    handleNewChat,
    storageService
  );

  useEffect(() => {
    const initializeChat = async () => {
      const data = await loadChatData();
      setChatState({
        sessions: data.sessions,
        activeId: data.activeId,
        messages: data.messages,
      });
      setTokenUsage(data.tokenUsage);

      const savedModel = await storageService.getSelectedModel();
      if (savedModel) {
        _setSelectedModel(savedModel);
      }
    };

    initializeChat();
  }, [loadChatData, storageService]);

  useEffect(() => {
    saveChatData(sessions, activeId, tokenUsage);
  }, [sessions, activeId, tokenUsage, saveChatData]);

  const setSelectedModel = async (model: string) => {
    if (!model.includes('/')) {
      throw new Error('Model must be in provider/name format');
    }
    _setSelectedModel(model);

    await storageService.saveSelectedModel(model);

    if (!activeId) {
      await handleNewChat();
    }
  };

  return {
    chatContainerRef,
    isDarkMode,
    toggleTheme,
    chatSessions: sessions,
    activeChatId: activeId,
    messages,
    selectedModel,
    isLoading,
    isStreaming,
    tokenUsage,
    error,
    clearError,
    setSelectedModel,
    handleNewChat,
    handleSendMessage,
    handleSelectChat,
    handleDeleteChat,
  };
}
