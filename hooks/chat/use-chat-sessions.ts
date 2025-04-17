'use client';

import logger from '@/lib/logger';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';
import { useCallback } from 'react';
import { ChatState, StorageService } from './types';
import { createEmptyTokenUsage, createNewChatId } from './utils';

/**
 * Hook for managing chat sessions (create, select, delete)
 */
export function useChatSessions(
  chatState: ChatState,
  setChatState: React.Dispatch<React.SetStateAction<ChatState>>,
  setTokenUsage: React.Dispatch<React.SetStateAction<SchemaCompletionUsage>>,
  storageService: StorageService
) {
  const { sessions, activeId, messages } = chatState;

  const handleNewChat = useCallback(async () => {
    const newChatId = createNewChatId();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().getTime(),
      tokenUsage: createEmptyTokenUsage(),
    };

    setChatState(prev => ({
      ...prev,
      sessions: [...prev.sessions, newChat],
      activeId: newChatId,
      messages: [],
    }));

    setTokenUsage(createEmptyTokenUsage());

    try {
      const currentSessions = await storageService.getChatSessions();
      const updatedSessions = [...currentSessions, newChat];
      await storageService.saveChatSessions(updatedSessions);
      await storageService.saveActiveChatId(newChatId);
    } catch (error) {
      logger.error('Failed to create new chat', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }, [setChatState, setTokenUsage, storageService]);

  const handleSelectChat = useCallback(
    async (id: string) => {
      try {
        const updatedSessions = sessions.map(chat =>
          chat.id === activeId
            ? {
                ...chat,
                messages,
              }
            : chat
        );

        await storageService.saveChatSessions(updatedSessions);

        const selectedChat = updatedSessions.find(chat => chat.id === id);

        setChatState({
          sessions: updatedSessions,
          activeId: id,
          messages: selectedChat?.messages || [],
        });

        setTokenUsage(selectedChat?.tokenUsage || createEmptyTokenUsage());
      } catch (error) {
        logger.error('Failed to select chat', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    },
    [activeId, messages, sessions, setChatState, setTokenUsage, storageService]
  );

  const handleDeleteChat = useCallback(
    (id: string) => {
      setChatState(prev => {
        const newSessions = prev.sessions.filter(chat => chat.id !== id);

        if (newSessions.length === 0) {
          const newChatId = createNewChatId();
          const newChat = {
            id: newChatId,
            title: 'New Chat',
            messages: [],
            tokenUsage: createEmptyTokenUsage(),
          };

          setTokenUsage(createEmptyTokenUsage());

          return {
            sessions: [newChat],
            activeId: newChatId,
            messages: [],
          };
        }

        if (id === prev.activeId) {
          const newActiveChat = newSessions[0];
          setTokenUsage(newActiveChat.tokenUsage || createEmptyTokenUsage());

          return {
            sessions: newSessions,
            activeId: newActiveChat.id,
            messages: newActiveChat.messages || [],
          };
        }

        return { ...prev, sessions: newSessions };
      });
    },
    [setChatState, setTokenUsage]
  );

  return {
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
  };
}
