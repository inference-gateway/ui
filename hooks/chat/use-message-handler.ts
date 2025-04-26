'use client';

import logger from '@/lib/logger';
import { ToolHandlers, WebSearchTool } from '@/lib/tools';
import { Message, StorageService } from '@/types/chat';
import {
  InferenceGatewayClient,
  MessageRole,
  SchemaChatCompletionMessageToolCall,
  SchemaChatCompletionTool,
  SchemaCompletionUsage,
} from '@inference-gateway/sdk';
import { useCallback, useRef } from 'react';
import { ChatState, UIState } from './types';
import { createNewChatId } from './utils';

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
  storageService: StorageService,
  isWebSearchEnabled: boolean = false
) {
  const currentAssistantContent = useRef<string>('');
  const currentReasoningContent = useRef<string>('');
  const currentAssistantId = useRef<string>('');

  /**
   * Add a message to the chat and save to storage
   */
  const appendMessage = useCallback(
    (message: Message) => {
      const { activeId } = chatState;
      if (!activeId) return;

      setChatState(prev => {
        const updatedMessages = [...prev.messages, message];

        const updatedSessions = prev.sessions.map(chat => {
          if (chat.id === activeId) {
            let title = chat.title;
            if (title === 'New Chat' && message.role === MessageRole.user && message.content) {
              title = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '');
            }

            return {
              ...chat,
              messages: [...chat.messages, message],
              title,
            };
          }
          return chat;
        });

        storageService.saveChatSessions(updatedSessions);

        return {
          ...prev,
          messages: updatedMessages,
          sessions: updatedSessions,
        };
      });
    },
    [chatState, setChatState, storageService]
  );

  /**
   * Update an existing message by ID and save to storage
   */
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      const { activeId } = chatState;
      if (!activeId) return;

      setChatState(prev => {
        const message = prev.messages.find(m => m.id === messageId);
        if (!message) return prev;

        const updatedMessage = {
          ...message,
          ...updates,
          role: updates.role || message.role,
        };

        const updatedMessages = prev.messages.map(msg =>
          msg.id === messageId ? updatedMessage : msg
        );

        const updatedSessions = prev.sessions.map(chat => {
          if (chat.id === activeId) {
            return {
              ...chat,
              messages: chat.messages.map(msg => (msg.id === messageId ? updatedMessage : msg)),
            };
          }
          return chat;
        });

        storageService.saveChatSessions(updatedSessions);

        return {
          ...prev,
          messages: updatedMessages,
          sessions: updatedSessions,
        };
      });
    },
    [chatState, setChatState, storageService]
  );

  /**
   * Update token usage and save to storage
   */
  const updateTokenUsage = useCallback(
    (usage: SchemaCompletionUsage) => {
      const { activeId } = chatState;
      if (!activeId) return;

      setTokenUsage(usage);

      setChatState(prev => {
        const updatedSessions = prev.sessions.map(chat => {
          if (chat.id === activeId) {
            return { ...chat, tokenUsage: usage };
          }
          return chat;
        });

        storageService.saveChatSessions(updatedSessions);
        return { ...prev, sessions: updatedSessions };
      });
    },
    [chatState, setChatState, setTokenUsage, storageService]
  );

  const updateChatStateWithMessage = useCallback(
    (messageId: string) => {
      const { activeId } = chatState;
      if (!activeId) return;

      setChatState(prev => {
        const message = prev.messages.find(m => m.id === messageId);
        if (!message) return prev;

        const updatedSessions = prev.sessions.map(chat => {
          if (chat.id === activeId) {
            return {
              ...chat,
              messages: chat.messages.map(msg =>
                msg.id === messageId
                  ? {
                      ...msg,
                      content: message.content,
                      reasoning_content: message.reasoning_content,
                      role: message.role,
                    }
                  : msg
              ),
            };
          }
          return chat;
        });

        storageService.saveChatSessions(updatedSessions);

        return {
          ...prev,
          sessions: updatedSessions,
        };
      });
    },
    [chatState, setChatState, storageService]
  );

  const clearError = useCallback(() => {
    setUIState(prev => ({ ...prev, error: null }));
  }, [setUIState]);

  const handleSendMessage = useCallback(
    async (inputValue: string) => {
      const { activeId } = chatState;

      if (!inputValue.trim() || !clientInstance) return;
      if (!activeId) {
        await handleNewChat();
        return;
      }

      if (
        inputValue.startsWith('/') &&
        (inputValue.trim() === '/reset' || inputValue.trim() === '/clear')
      ) {
        setChatState(prev => ({ ...prev, messages: [] }));
        setTokenUsage({
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        });
        return;
      }

      const userMessage: Message = {
        role: MessageRole.user,
        content: inputValue,
        id: createNewChatId(),
      };
      appendMessage(userMessage);

      setUIState(prev => ({ ...prev, isLoading: true, isStreaming: true }));

      currentAssistantContent.current = '';
      currentReasoningContent.current = '';

      const assistantMessageId = createNewChatId();
      currentAssistantId.current = assistantMessageId;

      const assistantMessage: Message = {
        role: MessageRole.assistant,
        content: '',
        id: assistantMessageId,
        model: selectedModel,
      };

      appendMessage(assistantMessage);

      const tools: SchemaChatCompletionTool[] = isWebSearchEnabled ? [WebSearchTool] : [];

      try {
        const allMessages = chatState.messages.map(({ role, content }) => ({
          role,
          content: content || '',
        }));

        allMessages.push({
          role: userMessage.role,
          content: userMessage.content || '',
        });

        await clientInstance.streamChatCompletion(
          {
            model: selectedModel,
            messages: allMessages,
            stream: true,
            tools,
          },
          {
            onTool: async (toolCall: SchemaChatCompletionMessageToolCall) => {
              const args = JSON.parse(toolCall.function.arguments || '{}') as Record<
                string,
                unknown
              >;
              const formattedArgs = JSON.stringify(args, null, 2);
              const assistantMessage: Message = {
                role: MessageRole.assistant,
                content: `I need to call the tool ${toolCall.function.name} with the arguments ${formattedArgs}`,
                id: `tool_${createNewChatId()}`,
                tool_call_id: toolCall.id,
              };

              appendMessage(assistantMessage);

              const tool = ToolHandlers[toolCall.function.name];
              if (tool) {
                try {
                  const result: unknown = await tool.call(args);
                  const toolResponse: Message = {
                    role: MessageRole.tool,
                    content: `Tool response ${toolCall.function.name}: ${JSON.stringify(result, null, 2)}`,
                    id: `tool_${createNewChatId()}`,
                    tool_call_id: toolCall.id,
                  };

                  appendMessage(toolResponse);
                } catch (error) {
                  logger.error('Tool call error', {
                    error: error instanceof Error ? error.message : error,
                    stack: error instanceof Error ? error.stack : undefined,
                  });
                  const errorMessage: Message = {
                    role: MessageRole.tool,
                    content: `Tool call error ${toolCall.function.name}: ${error instanceof Error ? error.message : error}`,
                    id: `tool_${createNewChatId()}`,
                    tool_call_id: toolCall.id,
                  };
                  appendMessage(errorMessage);
                }
              }
            },
            onReasoning(reasoningContent) {
              currentReasoningContent.current += reasoningContent;

              updateMessage(assistantMessageId, {
                reasoning_content: currentReasoningContent.current,
                role: MessageRole.assistant,
              });
            },

            onContent(content) {
              currentAssistantContent.current += content;

              updateMessage(assistantMessageId, {
                content: currentAssistantContent.current,
                role: MessageRole.assistant,
              });
            },

            onChunk: chunk => {
              if (chunk?.usage) {
                updateTokenUsage(chunk.usage);
              }
            },

            onError: error => {
              logger.error('Stream error', {
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
              });
              throw error;
            },

            onFinish() {
              logger.debug('Stream finished');

              updateMessage(assistantMessageId, {
                content: currentAssistantContent.current || undefined,
                reasoning_content: currentReasoningContent.current || undefined,
                role: MessageRole.assistant,
              });

              updateChatStateWithMessage(assistantMessageId);
            },
          }
        );
      } catch (error) {
        logger.error('Failed to get chat response', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });

        updateMessage(assistantMessageId, {
          content:
            currentAssistantContent.current ||
            'Sorry, I encountered an error. Please try again later.',
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
      updateChatStateWithMessage,
      chatState,
      clientInstance,
      handleNewChat,
      selectedModel,
      appendMessage,
      updateMessage,
      updateTokenUsage,
      setChatState,
      setTokenUsage,
      setUIState,
      isWebSearchEnabled,
    ]
  );

  return {
    handleSendMessage,
    clearError,
  };
}
