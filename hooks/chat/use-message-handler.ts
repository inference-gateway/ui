'use client';

import { SYSTEM_PROMPT } from '@/lib/constants';
import logger from '@/lib/logger';
import { FetchPageTool, ToolHandlers, WebSearchTool } from '@/lib/tools';
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
    (message: Message, saveToStorage = true) => {
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

        if (saveToStorage) {
          storageService.saveChatSessions(updatedSessions);
        }

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
    (messageId: string, updates: Partial<Message>, saveToStorage = true) => {
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

        if (saveToStorage) {
          storageService.saveChatSessions(updatedSessions);
        }

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

      if (inputValue.trim() === '/reset' || inputValue.trim() === '/clear') {
        setChatState(prev => ({ ...prev, messages: [] }));
        setChatState(prev => ({
          ...prev,
          sessions: prev.sessions.map(chat => 
            chat.id === activeId 
              ? { ...chat, messages: [], title: 'New Chat' } 
              : chat
          )
        }));
        storageService.saveChatSessions(chatState.sessions.map(chat => 
          chat.id === activeId 
            ? { ...chat, messages: [], title: 'New Chat' } 
            : chat
        ));
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
      appendMessage(userMessage, false);

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
      appendMessage(assistantMessage, false);

      const tools: SchemaChatCompletionTool[] = isWebSearchEnabled
        ? [WebSearchTool, FetchPageTool]
        : [];

      try {
        const allMessages = [
          {
            role: MessageRole.system,
            content: SYSTEM_PROMPT,
          },
          ...chatState.messages.map(({ role, content, tool_call_id }) => {
            const message: Message = {
              id: assistantMessageId,
              role: role,
              content: content || '',
            };

            if (role === MessageRole.tool && tool_call_id) {
              message.tool_call_id = tool_call_id;
            }

            return message;
          }),
          {
            role: userMessage.role,
            content: userMessage.content || '',
          },
        ];

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

              updateMessage(
                assistantMessageId,
                {
                  tool_calls: [toolCall],
                },
                false
              );

              const toolCallMessage: Message = {
                role: MessageRole.assistant,
                content: `Calling tool: ${toolCall.function.name}`,
                id: createNewChatId(),
                tool_call_id: toolCall.id,
              };
              appendMessage(toolCallMessage, false);

              const tool = ToolHandlers[toolCall.function.name];
              if (!tool) {
                throw new Error(`Tool ${toolCall.function.name} not found`);
              }

              try {
                const result = await tool.call(args);

                const toolResponseMessage: Message = {
                  role: MessageRole.tool,
                  content: JSON.stringify(result),
                  id: createNewChatId(),
                  tool_call_id: toolCall.id,
                };
                appendMessage(toolResponseMessage, false);

                const analysisMessages = [
                  ...allMessages,
                  {
                    role: MessageRole.tool,
                    content: JSON.stringify(result),
                    tool_call_id: toolCall.id,
                  },
                  {
                    role: MessageRole.system,
                    content: `You are responding after a web search for the user's query. Follow these instructions carefully:
                    1. Always start by presenting the search results in a clear, organized way
                    2. For each relevant result, include the title and a brief summary of the content
                    3. If the results contain links or sources, mention them
                    4. After presenting the results, provide your analysis and additional insights
                    5. Answer the user's original question thoroughly based on the search results
                    6. If the search results are insufficient, acknowledge this limitation
                    7. End with a follow-up question or suggestion related to the topic`,
                  },
                ];

                let analysisContentBuffer = '';
                let analysisReasoningBuffer = '';

                const analysisMessageId = createNewChatId();
                const analysisMessage: Message = {
                  role: MessageRole.assistant,
                  content: '',
                  id: analysisMessageId,
                  model: selectedModel,
                };
                appendMessage(analysisMessage, false);

                await clientInstance.streamChatCompletion(
                  {
                    model: selectedModel,
                    messages: analysisMessages,
                    stream: true,
                  },
                  {
                    onReasoning: reasoningContent => {
                      analysisReasoningBuffer += reasoningContent;
                      updateMessage(analysisMessageId, {
                        reasoning_content: analysisReasoningBuffer,
                      });
                    },
                    onContent: content => {
                      analysisContentBuffer += content;
                      updateMessage(analysisMessageId, {
                        content: analysisContentBuffer,
                      });
                      setChatState(prev => ({ ...prev }));
                    },
                    onChunk: chunk => {
                      if (chunk?.usage) {
                        updateTokenUsage(chunk.usage);
                      }
                    },
                    onError: error => {
                      logger.error('Stream error after tool call', {
                        error: error instanceof Error ? error.message : error,
                        stack: error instanceof Error ? error.stack : undefined,
                      });
                      updateMessage(analysisMessageId, {
                        content: `${analysisContentBuffer}\n\nSorry, I had trouble processing the tool results. Please ask me anything else.`,
                      });
                    },
                    onFinish: () => {
                      currentAssistantContent.current = '';
                      currentReasoningContent.current = '';

                      setUIState(prev => ({
                        ...prev,
                        isLoading: false,
                        isStreaming: false,
                      }));
                    },
                  }
                );
              } catch (error) {
                logger.error('Tool call failed', {
                  error: error instanceof Error ? error.message : error,
                  stack: error instanceof Error ? error.stack : undefined,
                });
                updateMessage(assistantMessageId, {
                  content: `Failed to call tool ${toolCall.function.name}: ${
                    error instanceof Error ? error.message : error
                  }`,
                });
              }
            },
            onReasoning: reasoningContent => {
              currentReasoningContent.current += reasoningContent;
              updateMessage(assistantMessageId, {
                reasoning_content: currentReasoningContent.current,
              });
            },
            onContent: content => {
              currentAssistantContent.current += content;
              updateMessage(assistantMessageId, {
                content: currentAssistantContent.current,
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
              updateMessage(assistantMessageId, {
                content:
                  currentAssistantContent.current ||
                  'Sorry, I encountered an error. Please try again.',
              });
              setUIState(prev => ({
                ...prev,
                isLoading: false,
                isStreaming: false,
                error: error instanceof Error ? error.message : 'Failed to get response',
              }));
            },
            onFinish: () => {
              updateMessage(
                assistantMessageId,
                {
                  content: currentAssistantContent.current,
                  reasoning_content: currentReasoningContent.current,
                },
                true
              );
              setUIState(prev => ({
                ...prev,
                isLoading: false,
                isStreaming: false,
              }));
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
