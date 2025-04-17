'use client';

import logger from '@/lib/logger';
import { StorageServiceFactory } from '@/lib/storage';
import { ChatSession, StorageType } from '@/types/chat';
import { SchemaCompletionUsage } from '@inference-gateway/sdk';
import { useCallback, useMemo } from 'react';
import { StorageService } from './types';
import { createEmptyTokenUsage } from './utils';

/**
 * Hook for managing chat storage operations
 */
export function useChatStorage() {
  const storageService = useMemo<StorageService>(() => {
    return StorageServiceFactory.createService({
      storageType: StorageType.LOCAL,
      userId: undefined,
    });
  }, []);

  const loadChatData = useCallback(async () => {
    try {
      let sessions = (await storageService.getChatSessions()) || [];

      interface SessionsWrapper {
        sessions: ChatSession[];
      }
      if (
        sessions &&
        typeof sessions === 'object' &&
        !Array.isArray(sessions) &&
        'sessions' in sessions &&
        Array.isArray((sessions as SessionsWrapper).sessions)
      ) {
        sessions = (sessions as SessionsWrapper).sessions;
      }

      const activeId = (await storageService.getActiveChatId()) || '';
      const activeChat = Array.isArray(sessions)
        ? sessions.find(chat => chat.id === activeId)
        : null;

      return {
        sessions: Array.isArray(sessions) ? sessions : [],
        activeId,
        messages: activeChat?.messages || [],
        tokenUsage: activeChat?.tokenUsage || createEmptyTokenUsage(),
      };
    } catch (error) {
      logger.error('Failed to load chat data', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        sessions: [],
        activeId: '',
        messages: [],
        tokenUsage: createEmptyTokenUsage(),
      };
    }
  }, [storageService]);

  const saveChatData = useCallback(
    async (sessions: ChatSession[], activeId: string, tokenUsage: SchemaCompletionUsage) => {
      try {
        const updatedSessions = sessions.map(chat => {
          if (chat.id === activeId) {
            return { ...chat, tokenUsage };
          }
          return chat;
        });

        await storageService.saveChatSessions(updatedSessions);
        await storageService.saveActiveChatId(activeId);
      } catch (error) {
        logger.error('Failed to save chat data', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    },
    [storageService]
  );

  return {
    storageService,
    loadChatData,
    saveChatData,
  };
}
