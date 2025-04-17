'use client';

import logger from '@/lib/logger';
import { Message } from '@/types/chat';
import { InferenceGatewayClient, MessageRole, SchemaCompletionUsage } from '@inference-gateway/sdk';
import { useCallback, useRef } from 'react';
import { ChatState, StorageService, UIState } from './types';

/**
 * Hook for managing sending messages and handling responses
 */
export function useMessageHandler(
  clientInstance: InferenceGatewayClient | null,
  selectedModel: string,
  chatState: ChatState,
  setChatState: React.Dispatch<React.SetStateAction<ChatState>>,
  setUIState: React.Dispatch<React.SetStateAction<UIState>>,
  setTokenUsage: React.Dispatch<React.SetStateAction<SchemaCompletionUsage>>,
  handleNewChat: () => Promise<void>,
  storageService: StorageService
) {
  const latestMessageRef = useRef<string>('');
  const reasoningContentRef = useRef<string>('');

  const clearError = useCallback(() => {
    setUIState(prev => ({ ...prev, error: null }));
  }, [setUIState]);

  const handleSendMessage = useCallback(
    async (inputValue: string) => {
      const { activeId, messages, sessions } = chatState;
      const isLoading = false;

      if (!inputValue.trim() || isLoading || !clientInstance) return;

      if (!activeId) {
        await handleNewChat();
        return;
      }

      if (inputValue.startsWith('/')) {
        if (inputValue.trim() === '/reset' || inputValue.trim() === '/clear') {
          setChatState(prev => ({ ...prev, messages: [] }));
          setTokenUsage({
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          });
          return;
        }
      }

      const userMessage: Message = {
        role: MessageRole.user,
        content: inputValue,
        id: Date.now().toString(),
      };

      const updatedMessages = [...messages, userMessage];
      const updatedSessions = sessions.map(chat => {
        if (chat.id === activeId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, userMessage],
          };

          if (chat.title === 'New Chat' && userMessage.content) {
            updatedChat.title =
              userMessage.content.slice(0, 20) + (userMessage.content.length > 20 ? '...' : '');
          }
          return updatedChat;
        }
        return chat;
      });

      setChatState(prev => ({
        ...prev,
        messages: updatedMessages,
        sessions: updatedSessions,
      }));

      setUIState(prev => ({ ...prev, isLoading: true, isStreaming: true }));
      latestMessageRef.current = '';
      reasoningContentRef.current = '';

      const assistantMessageId = Date.now().toString();
      const assistantMessage: Message = {
        role: MessageRole.assistant,
        content: '',
        id: assistantMessageId,
        model: selectedModel,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));

      try {
        await clientInstance.streamChatCompletion(
          {
            model: selectedModel,
            messages: updatedMessages.map(({ role, content }) => ({
              role,
              content: content || '',
            })),
            stream: true,
          },
          {
            onChunk: chunk => {
              const content = chunk?.choices?.[0]?.delta?.content || '';
              const reasoning = chunk?.choices?.[0]?.delta?.reasoning_content || '';

              if (content) latestMessageRef.current += content;
              if (reasoning) reasoningContentRef.current += reasoning;

              setChatState(prev => {
                const updated = [...prev.messages];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0 && updated[lastIndex]?.id === assistantMessageId) {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    content: latestMessageRef.current,
                    reasoning_content: reasoningContentRef.current || undefined,
                  };
                }
                return { ...prev, messages: updated };
              });

              if (chunk?.usage) {
                setTokenUsage(chunk.usage);

                setChatState(prev => {
                  const updatedSessions = prev.sessions.map(chat => {
                    if (chat.id === activeId) {
                      return { ...chat, tokenUsage: chunk.usage };
                    }
                    return chat;
                  });
                  return { ...prev, sessions: updatedSessions };
                });
              }
            },
            onError: error => {
              logger.error('Stream error', {
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
              });
              throw error;
            },
          }
        );

        let currentTokenUsage: SchemaCompletionUsage = {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        };

        setTokenUsage(prevTokenUsage => {
          currentTokenUsage = prevTokenUsage;
          return prevTokenUsage;
        });

        const finalAssistantMessage = {
          role: MessageRole.assistant,
          content: latestMessageRef.current,
          id: assistantMessageId,
          model: selectedModel,
          reasoning_content: reasoningContentRef.current || undefined,
        };

        const updatedSessionsWithAssistant = updatedSessions.map(chat => {
          if (chat.id === activeId) {
            return {
              ...chat,
              messages: [...chat.messages, finalAssistantMessage],
              tokenUsage: currentTokenUsage,
            };
          }
          return chat;
        });

        setChatState(prev => ({
          ...prev,
          sessions: updatedSessionsWithAssistant,
        }));

        await storageService.saveChatSessions(updatedSessionsWithAssistant);
      } catch (error) {
        logger.error('Failed to get chat response', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });

        setChatState(prev => {
          const updated = [...prev.messages];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].id === assistantMessageId) {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content:
                latestMessageRef.current ||
                'Sorry, I encountered an error. Please try again later.',
            };
          }
          return { ...prev, messages: updated };
        });

        setUIState(prev => ({
          ...prev,
          isLoading: false,
          isStreaming: false,
          error: error instanceof Error ? error.message : 'Failed to get response from model',
        }));
      } finally {
        setUIState(prev => ({
          ...prev,
          isLoading: false,
          isStreaming: false,
        }));
      }
    },
    [
      chatState,
      clientInstance,
      handleNewChat,
      selectedModel,
      setChatState,
      setTokenUsage,
      setUIState,
      storageService,
    ]
  );

  return {
    handleSendMessage,
    clearError,
  };
}
