'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { cn, generateUUID } from '@/lib/utils';
import { ChatHistory } from '@/components/chat-history';
import { ChatArea } from '@/components/chat-area';
import { InputArea } from '@/components/input-area';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChatHeader } from '@/components/chat-header';
import { ChevronLeft, Menu } from 'lucide-react';
import { Session } from 'next-auth';
import { Message, MessageRole, ChatSession, StorageConfig } from '@/types/chat';
import { StorageServiceFactory } from '@/lib/storage';
import { WebSearchTool, FetchPageTool } from '@/lib/tools';
import logger from '@/lib/logger';
import {
  InferenceGatewayClient,
  SchemaChatCompletionTool,
  SchemaCompletionUsage,
} from '@inference-gateway/sdk';
import { runAgentLoop } from '@/lib/agent';

export const dynamic = 'force-dynamic';

export interface PageClientProps {
  session?: Session | null;
  storageConfig: StorageConfig;
}

export default function PageClient({ session, storageConfig }: PageClientProps) {
  // State variables
  const isMobile = useIsMobile();
  const isDarkMode = true;
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMessages, setHasMessages] = useState(messages.length > 0);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<SchemaCompletionUsage>({
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState<string>('');

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const clientInstance = useRef<InferenceGatewayClient | null>(null);

  // Storage service
  const storageService = useMemo(() => {
    return StorageServiceFactory.createService({
      storageType: storageConfig.type,
      userId: session?.user?.id,
      connectionUrl: storageConfig.connectionUrl,
    });
  }, [storageConfig, session?.user?.id]);

  // Initialize API client
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

    clientInstance.current = new InferenceGatewayClient({
      baseURL: '/api/v1',
      fetch: fetchWithAuth,
    });
  }, [session]);

  // Scroll management
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

  useEffect(() => {
    setHasMessages(messages.length > 0);
  }, [messages]);

  // Show sidebar on mobile
  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  // Theme management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load initial chat data
  useEffect(() => {
    const loadChatData = async () => {
      try {
        let sessions = (await storageService.getChatSessions()) || [];

        if (sessions && typeof sessions === 'object' && !Array.isArray(sessions)) {
          sessions = (sessions as { sessions: ChatSession[] }).sessions || [];
        }

        if (sessions.length === 0) {
          const newChatId = generateUUID();
          const newChat: ChatSession = {
            id: newChatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            tokenUsage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0,
            },
          };
          sessions = [newChat];

          await storageService.saveChatSessions(sessions);
          await storageService.saveActiveChatId(newChatId);
        }

        const activeId = (await storageService.getActiveChatId()) || '';
        const activeChat = activeId ? sessions.find(chat => chat.id === activeId) : sessions[0];

        const activeChatId = activeChat?.id || sessions[0]?.id || '';

        setChatSessions(sessions);
        setActiveChatId(activeChatId);
        setMessages(activeChat?.messages || []);
        setTokenUsage(
          activeChat?.tokenUsage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          }
        );

        if (activeId !== activeChatId) {
          await storageService.saveActiveChatId(activeChatId);
        }

        const savedModel = await storageService.getSelectedModel();
        if (savedModel) {
          setSelectedModel(savedModel);
        }
      } catch (error) {
        logger.error('Failed to load chat data', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    };

    loadChatData();
  }, [storageService]);

  // Save chat data when it changes
  useEffect(() => {
    const saveChatData = async () => {
      try {
        const updatedSessions = chatSessions.map(chat => {
          if (chat.id === activeChatId) {
            return { ...chat, messages, tokenUsage };
          }
          return chat;
        });

        // Save sessions first to ensure the chat session exists in the database
        await storageService.saveChatSessions(updatedSessions);

        // Only save active chat ID if it's valid (not empty)
        if (activeChatId) {
          await storageService.saveActiveChatId(activeChatId);
        }
      } catch (error) {
        logger.error('Failed to save chat data', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    };

    if (activeChatId && chatSessions.length > 0) {
      saveChatData();
    }
  }, [messages, chatSessions, activeChatId, tokenUsage, storageService]);

  useEffect(() => {
    const saveSelectedModel = async () => {
      if (selectedModel) {
        await storageService.saveSelectedModel(selectedModel);
      }
    };

    saveSelectedModel();
  }, [selectedModel, storageService]);

  const handleNewChat = useCallback(async () => {
    try {
      const newChatId = generateUUID();
      const newChat: ChatSession = {
        id: newChatId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        tokenUsage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };

      setChatSessions(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      setMessages([]);
      setTokenUsage({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      });

      // Save sessions first, then set the active chat ID
      await storageService.saveChatSessions([newChat, ...chatSessions]);
      await storageService.saveActiveChatId(newChatId);
    } catch (error) {
      logger.error('Failed to create new chat', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      setError('Failed to create new chat');
    }
  }, [chatSessions, storageService]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      const selectedChat = chatSessions.find(chat => chat.id === chatId);
      if (selectedChat) {
        setActiveChatId(chatId);
        setMessages(selectedChat.messages);
        setTokenUsage(
          selectedChat.tokenUsage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          }
        );
      }
    },
    [chatSessions]
  );

  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      try {
        const updatedSessions = chatSessions.filter(chat => chat.id !== chatId);
        setChatSessions(updatedSessions);

        if (activeChatId === chatId) {
          const newActiveId = updatedSessions[0]?.id || '';
          setActiveChatId(newActiveId);
          setMessages(updatedSessions[0]?.messages || []);
          setTokenUsage(
            updatedSessions[0]?.tokenUsage || {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0,
            }
          );
        }

        await storageService.saveChatSessions(updatedSessions);
      } catch (error) {
        logger.error('Failed to delete chat', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
        setError('Failed to delete chat');
      }
    },
    [chatSessions, activeChatId, storageService]
  );

  const handleClearChat = useCallback(async () => {
    try {
      setMessages([]);

      const updatedSessions = chatSessions.map(session =>
        session.id === activeChatId
          ? {
              ...session,
              title: 'New Chat',
              messages: [],
              tokenUsage: {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0,
              },
            }
          : session
      );

      setChatSessions(updatedSessions);
      setTokenUsage({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      });

      await storageService.saveChatSessions(updatedSessions);
    } catch (error) {
      logger.error('Failed to clear chat', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      setError('Failed to clear chat');
    }
  }, [activeChatId, chatSessions, storageService]);

  const toggleWebSearch = useCallback(() => {
    setIsWebSearchEnabled(prev => !prev);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSearchAction = useCallback(() => {
    toggleWebSearch();
  }, [toggleWebSearch]);

  const handleEditLastUserMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === MessageRole.user);
    if (lastUserMessage) {
      setEditingMessageId(lastUserMessage.id);
      setEditMessageContent(lastUserMessage.content || '');
    }
  }, [messages]);

  const handleSendMessage = useCallback(
    async (content: string, editMessageId?: string) => {
      if (!clientInstance.current || !selectedModel) return;

      setIsLoading(true);
      setIsStreaming(true);
      setError(null);

      try {
        const userMessageId = generateUUID();
        const userMessage: Message = {
          id: userMessageId,
          role: MessageRole.user,
          content,
        };

        let updatedMessages: Message[];
        if (editMessageId) {
          const editIndex = messages.findIndex(msg => msg.id === editMessageId);
          if (editIndex !== -1) {
            updatedMessages = [
              ...messages.slice(0, editIndex),
              { ...userMessage, id: editMessageId },
            ];
          } else {
            updatedMessages = [...messages, { ...userMessage, id: editMessageId }];
          }
        } else {
          updatedMessages = [...messages, userMessage];
        }

        setMessages(updatedMessages);

        let updatedChatSessions = [...chatSessions];
        let newTitle = '';
        const currentChat = chatSessions.find(chat => chat.id === activeChatId);
        if (
          currentChat &&
          currentChat.title === 'New Chat' &&
          messages.length === 0 &&
          !editMessageId
        ) {
          newTitle = content.trim().slice(0, 15) + '...' || 'New Chat';

          updatedChatSessions = chatSessions.map(chat =>
            chat.id === activeChatId ? { ...chat, title: newTitle } : chat
          );
        }

        setChatSessions(updatedChatSessions);

        const tools: SchemaChatCompletionTool[] | undefined = isWebSearchEnabled
          ? [WebSearchTool, FetchPageTool]
          : undefined;

        await runAgentLoop({
          model: selectedModel,
          messages: updatedMessages,
          tools,
          client: clientInstance.current!,
          onUpdateMessages: newMessages => {
            if (typeof newMessages === 'function') {
              setMessages(prevMessages => {
                const updatedMsgs = newMessages(prevMessages);
                return updatedMsgs;
              });
            } else {
              setMessages(newMessages);
            }
          },
          onUpdateUsage: usage => {
            setTokenUsage({
              prompt_tokens: usage.prompt_tokens || 0,
              completion_tokens: usage.completion_tokens || 0,
              total_tokens: usage.total_tokens || 0,
            });
          },
        });

        const finalUpdatedSessions = updatedChatSessions.map(session =>
          session.id === activeChatId
            ? {
                ...session,
                title: newTitle || session.title,
                messages: updatedMessages,
                tokenUsage: tokenUsage,
              }
            : session
        );

        setChatSessions(finalUpdatedSessions);
        await storageService.saveChatSessions(finalUpdatedSessions);
      } catch (error) {
        logger.error('Failed to send message', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
        setError('Failed to send message');
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setEditingMessageId(null);
        setEditMessageContent('');
      }
    },
    [
      messages,
      chatSessions,
      activeChatId,
      selectedModel,
      isWebSearchEnabled,
      tokenUsage,
      storageService,
    ]
  );

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={cn(
          'fixed top-3.5 left-3.5 z-50 flex items-center justify-center',
          'w-8 h-8 rounded-md bg-background shadow-sm border border-input',
          'text-muted-foreground hover:text-foreground transition-colors',
          'focus:outline-none focus:ring-1 focus:ring-primary'
        )}
        aria-label="Toggle sidebar"
        title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
      >
        {showSidebar ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 h-full transition-all duration-300 ease-in-out',
          'bg-[hsl(var(--chat-sidebar-background))] border-r border-[hsl(var(--chat-sidebar-border))]',
          showSidebar ? 'w-[260px]' : 'w-0',
          showSidebar ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-0 pointer-events-none'
        )}
      >
        <ChatHistory
          chatSessions={chatSessions}
          activeChatId={activeChatId}
          onNewChatAction={handleNewChat}
          onSelectChatAction={handleSelectChat}
          onDeleteChatAction={handleDeleteChat}
          isMobileOpen={showSidebar}
          setIsMobileOpen={setShowSidebar}
          error={error?.toString()}
          onErrorDismiss={clearError}
        />
      </div>

      <div
        className={cn(
          'flex-1 flex flex-col h-full overflow-hidden relative',
          'transition-all duration-300 ease-in-out',
          showSidebar && !isMobile ? 'ml-[260px]' : 'ml-0'
        )}
      >
        <ChatHeader
          session={session}
          isMobile={isMobile}
          showSidebar={showSidebar}
          selectedModel={selectedModel}
          setShowSidebar={setShowSidebar}
          handleNewChat={handleNewChat}
          setSelectedModel={setSelectedModel}
        />

        <div
          ref={chatContainerRef}
          className={cn(
            'flex-1 overflow-y-auto bg-[hsl(var(--chat-background))]',
            !hasMessages && 'flex flex-col justify-center'
          )}
          onClick={() => isMobile && setShowSidebar(false)}
        >
          <ChatArea
            messages={messages}
            isStreaming={isStreaming}
            selectedModel={selectedModel}
            onEditMessage={messageId => {
              const messageToEdit = messages.find(msg => msg.id === messageId);
              if (messageToEdit && messageToEdit.content) {
                setEditingMessageId(messageId);
                setEditMessageContent(messageToEdit.content);
              }
            }}
          />
        </div>

        <div
          className={cn(
            'w-full bg-[hsl(var(--chat-background))] transition-all duration-500 ease-in-out px-4',
            hasMessages
              ? 'sticky bottom-0 border-t border-[hsl(var(--chat-sidebar-border))]'
              : 'absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 max-w-[800px]'
          )}
        >
          <div className={cn('mx-auto', hasMessages ? 'max-w-[800px]' : '')}>
            <InputArea
              isLoading={isLoading}
              selectedModel={selectedModel}
              tokenUsage={tokenUsage}
              onSendMessageAction={content => {
                if (editingMessageId) {
                  handleSendMessage(content, editingMessageId);
                } else {
                  handleSendMessage(content);
                }
              }}
              onClearChatAction={handleClearChat}
              isSearchActive={isWebSearchEnabled}
              onSearchAction={handleSearchAction}
              editingMessageId={editingMessageId}
              editMessageContent={editMessageContent}
              onCancelEdit={() => {
                setEditingMessageId(null);
                setEditMessageContent('');
              }}
              onEditLastUserMessage={handleEditLastUserMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
