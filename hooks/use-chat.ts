'use client';

import logger from '@/lib/logger';
import { StorageServiceFactory } from '@/lib/storage';
import { StorageType, type ChatSession, type Message } from '@/types/chat';
import { InferenceGatewayClient, MessageRole, SchemaCompletionUsage } from '@inference-gateway/sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from './use-session';

interface ChatState {
  sessions: ChatSession[];
  activeId: string;
  messages: Message[];
}

interface UIState {
  isLoading: boolean;
  isStreaming: boolean;
  isDarkMode: boolean;
  error: string | null;
}

export function useChat(initialDarkMode = true) {
  const storageService = useMemo(() => {
    const storageType = StorageType.LOCAL;

    return StorageServiceFactory.createService({
      storageType,
      userId: undefined,
    });
  }, []);

  const [chatState, setChatState] = useState<ChatState>({
    sessions: [],
    activeId: '',
    messages: [],
  });

  const [selectedModel, _setSelectedModel] = useState('');

  const [uiState, setUIState] = useState<UIState>({
    isLoading: false,
    isStreaming: false,
    isDarkMode: initialDarkMode,
    error: null,
  });

  const [tokenUsage, setTokenUsage] = useState<SchemaCompletionUsage>({
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  });

  const [clientInstance, setClientInstance] = useState<InferenceGatewayClient | null>(null);

  const latestMessageRef = useRef<string>('');
  const reasoningContentRef = useRef<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { sessions, activeId, messages } = chatState;
  const { isLoading, isStreaming, isDarkMode, error } = uiState;

  const { session } = useSession();

  useEffect(() => {
    const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (session?.accessToken) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
      }
      return window.fetch(input, {
        ...init,
        headers,
      });
    };

    const newClient = new InferenceGatewayClient({
      baseURL: '/api/v1',
      fetch: fetchWithAuth,
    });
    setClientInstance(newClient);
  }, [session?.accessToken]);

  useEffect(() => {
    const loadData = async () => {
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

        if (activeChat?.tokenUsage) {
          setTokenUsage(activeChat.tokenUsage);
        }

        setChatState({
          sessions: Array.isArray(sessions) ? sessions : [],
          activeId,
          messages: activeChat?.messages || [],
        });
      } catch (error) {
        logger.error('Failed to load chat data', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
        setChatState({
          sessions: [],
          activeId: '',
          messages: [],
        });
      }
    };
    loadData();
  }, [storageService]);

  useEffect(() => {
    const saveData = async () => {
      try {
        const updatedSessions = sessions.map(chat => {
          if (chat.id === activeId) {
            return {
              ...chat,
              tokenUsage,
            };
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
    };
    saveData();
  }, [sessions, activeId, tokenUsage, storageService]); // Added tokenUsage as dependency

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  useEffect(() => {
    let scrollInterval: NodeJS.Timeout | null = null;

    if (isStreaming) {
      scrollInterval = setInterval(scrollToBottom, 100);
    }

    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [isStreaming, scrollToBottom]);

  const handleNewChat = useCallback(async () => {
    const newChatId =
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().getTime(),
      tokenUsage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };

    setChatState(prev => ({
      ...prev,
      sessions: [...prev.sessions, newChat],
      activeId: newChatId,
      messages: [],
    }));

    setTokenUsage({
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    });

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
  }, [storageService]);

  const setSelectedModel = useCallback(
    async (model: string) => {
      if (!model.includes('/')) {
        throw new Error('Model must be in provider/name format');
      }
      _setSelectedModel(model);

      if (!activeId) {
        await handleNewChat();
      }
    },
    [activeId, handleNewChat]
  );

  const clearError = useCallback(() => {
    setUIState(prev => ({ ...prev, error: null }));
  }, []);

  const handleSendMessage = useCallback(
    async (inputValue: string) => {
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
              const content = chunk.choices[0]?.delta?.content || '';
              const reasoning = chunk.choices[0]?.delta?.reasoning_content || '';

              if (content) latestMessageRef.current += content;
              if (reasoning) reasoningContentRef.current += reasoning;

              setChatState(prev => {
                const updated = [...prev.messages];
                const lastIndex = updated.length - 1;
                if (updated[lastIndex].id === assistantMessageId) {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    content: latestMessageRef.current,
                    reasoning_content: reasoningContentRef.current || undefined,
                  };
                }
                return { ...prev, messages: updated };
              });

              if (chunk.usage) {
                setTokenUsage(chunk.usage);

                setChatState(prev => {
                  const updatedSessions = prev.sessions.map(chat => {
                    if (chat.id === activeId) {
                      return {
                        ...chat,
                        tokenUsage: chunk.usage,
                      };
                    }
                    return chat;
                  });
                  return {
                    ...prev,
                    sessions: updatedSessions,
                  };
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
              tokenUsage: tokenUsage,
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
          if (updated[lastIndex].id === assistantMessageId) {
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
      activeId,
      clientInstance,
      handleNewChat,
      isLoading,
      messages,
      sessions,
      selectedModel,
      storageService,
      tokenUsage,
    ]
  );

  const handleSelectChat = useCallback(
    async (id: string) => {
      try {
        const updatedSessions = sessions.map(chat =>
          chat.id === activeId
            ? {
                ...chat,
                messages,
                tokenUsage: tokenUsage,
              }
            : chat
        );

        await storageService.saveChatSessions(updatedSessions);

        const selectedChat = updatedSessions.find(chat => chat.id === id);

        setChatState(() => ({
          sessions: updatedSessions,
          activeId: id,
          messages: selectedChat?.messages || [],
        }));

        if (selectedChat?.tokenUsage) {
          setTokenUsage(selectedChat.tokenUsage);
        } else {
          setTokenUsage({
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          });
        }
      } catch (error) {
        logger.error('Failed to select chat', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    },
    [activeId, messages, sessions, storageService, tokenUsage]
  );

  const handleDeleteChat = useCallback((id: string) => {
    setChatState(prev => {
      const newSessions = prev.sessions.filter(chat => chat.id !== id);

      if (newSessions.length === 0) {
        const newChatId = Date.now().toString();
        const newChat = {
          id: newChatId,
          title: 'New Chat',
          messages: [],
        };

        setTokenUsage({
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        });

        return {
          sessions: [newChat],
          activeId: newChatId,
          messages: [],
        };
      }

      if (id === prev.activeId) {
        const newActiveId = newSessions[0].id;
        const newActiveChat = newSessions[0];

        if (newActiveChat.tokenUsage) {
          setTokenUsage(newActiveChat.tokenUsage);
        } else {
          setTokenUsage({
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          });
        }

        return {
          sessions: newSessions,
          activeId: newActiveId,
          messages: newSessions[0].messages,
        };
      }

      return {
        ...prev,
        sessions: newSessions,
      };
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setUIState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  }, []);

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
