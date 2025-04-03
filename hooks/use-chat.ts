import { StorageServiceFactory } from "@/lib/storage";
import { StorageType, type ChatSession, type Message } from "@/types/chat";
import { InferenceGatewayClient, MessageRole } from "@inference-gateway/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ChatState {
  sessions: ChatSession[];
  activeId: string;
  messages: Message[];
}

interface UIState {
  isLoading: boolean;
  isStreaming: boolean;
  isDarkMode: boolean;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
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
    activeId: "",
    messages: [],
  });

  const [selectedModel, _setSelectedModel] = useState("");

  const [uiState, setUIState] = useState<UIState>({
    isLoading: false,
    isStreaming: false,
    isDarkMode: initialDarkMode,
  });

  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });

  const [clientInstance, setClientInstance] =
    useState<InferenceGatewayClient | null>(null);

  const latestMessageRef = useRef<string>("");
  const reasoningContentRef = useRef<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { sessions, activeId, messages } = chatState;
  const { isLoading, isStreaming, isDarkMode } = uiState;

  useEffect(() => {
    const newClient = new InferenceGatewayClient({
      baseURL: "/api/v1",
      fetch: window.fetch.bind(window),
    });
    setClientInstance(newClient);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        let sessions = (await storageService.getChatSessions()) || [];
        // Handle case where sessions might be in {sessions: []} format
        interface SessionsWrapper {
          sessions: ChatSession[];
        }
        if (
          sessions &&
          typeof sessions === "object" &&
          !Array.isArray(sessions) &&
          "sessions" in sessions &&
          Array.isArray((sessions as SessionsWrapper).sessions)
        ) {
          sessions = (sessions as SessionsWrapper).sessions;
        }
        const activeId = (await storageService.getActiveChatId()) || "";

        setChatState({
          sessions: Array.isArray(sessions) ? sessions : [],
          activeId,
          messages: Array.isArray(sessions)
            ? sessions.find((chat) => chat.id === activeId)?.messages || []
            : [],
        });
      } catch (error) {
        console.error("Failed to load chat data:", error);
        setChatState({
          sessions: [],
          activeId: "",
          messages: [],
        });
      }
    };
    loadData();
  }, [storageService]);

  useEffect(() => {
    const saveData = async () => {
      try {
        await storageService.saveChatSessions(sessions);
        await storageService.saveActiveChatId(activeId);
      } catch (error) {
        console.error("Failed to save chat data:", error);
      }
    };
    saveData();
  }, [sessions, activeId, storageService]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
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
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const newChat = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      createdAt: new Date().getTime(),
    };

    setChatState((prev) => ({
      ...prev,
      sessions: [...prev.sessions, newChat],
      activeId: newChatId,
      messages: [],
    }));

    try {
      const currentSessions = await storageService.getChatSessions();
      const updatedSessions = [...currentSessions, newChat];
      await storageService.saveChatSessions(updatedSessions);
      await storageService.saveActiveChatId(newChatId);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  }, [storageService]);

  const setSelectedModel = useCallback(
    async (model: string) => {
      if (!model.includes("/")) {
        throw new Error("Model must be in provider/name format");
      }
      _setSelectedModel(model);

      if (!activeId) {
        await handleNewChat();
      }
    },
    [activeId, handleNewChat]
  );

  const handleSendMessage = useCallback(
    async (inputValue: string) => {
      if (!inputValue.trim() || isLoading || !clientInstance) return;

      if (!activeId) {
        await handleNewChat();
        return;
      }

      if (inputValue.startsWith("/")) {
        if (inputValue.trim() === "/reset" || inputValue.trim() === "/clear") {
          setChatState((prev) => ({ ...prev, messages: [] }));
          setTokenUsage({
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
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
      const updatedSessions = sessions.map((chat) => {
        if (chat.id === activeId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, userMessage],
          };

          if (chat.title === "New Chat" && userMessage.content) {
            updatedChat.title =
              userMessage.content.slice(0, 20) +
              (userMessage.content.length > 20 ? "..." : "");
          }
          return updatedChat;
        }
        return chat;
      });

      setChatState((prev) => ({
        ...prev,
        messages: updatedMessages,
        sessions: updatedSessions,
      }));

      setUIState((prev) => ({ ...prev, isLoading: true, isStreaming: true }));
      latestMessageRef.current = "";
      reasoningContentRef.current = "";

      const assistantMessageId = Date.now().toString();
      const assistantMessage: Message = {
        role: MessageRole.assistant,
        content: "",
        id: assistantMessageId,
        model: selectedModel.split("/")[1],
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));

      try {
        await clientInstance.streamChatCompletion(
          {
            model: selectedModel,
            messages: updatedMessages.map(({ role, content }) => ({
              role,
              content: content || "",
            })),
            stream: true,
          },
          {
            onChunk: (chunk) => {
              const content = chunk.choices[0]?.delta?.content || "";
              const reasoning =
                chunk.choices[0]?.delta?.reasoning_content || "";

              if (content) latestMessageRef.current += content;
              if (reasoning) reasoningContentRef.current += reasoning;

              setChatState((prev) => {
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
                setTokenUsage({
                  promptTokens: chunk.usage.prompt_tokens,
                  completionTokens: chunk.usage.completion_tokens,
                  totalTokens: chunk.usage.total_tokens,
                });
              }
            },
            onError: (error) => {
              console.error("Stream error:", error);
              throw error;
            },
          }
        );
      } catch (error) {
        console.error("Failed to get response:", error);

        setChatState((prev) => {
          const updated = [...prev.messages];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].id === assistantMessageId) {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content:
                latestMessageRef.current ||
                "Sorry, I encountered an error. Please try again later.",
            };
          }
          return { ...prev, messages: updated };
        });
      } finally {
        setUIState((prev) => ({
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
    ]
  );

  const handleSelectChat = useCallback(
    async (id: string) => {
      const updatedSessions = sessions.map((chat) =>
        chat.id === activeId ? { ...chat, messages: [...messages] } : chat
      );

      try {
        await storageService.saveChatSessions(updatedSessions);

        setChatState(() => ({
          sessions: updatedSessions,
          activeId: id,
          messages:
            updatedSessions.find((chat) => chat.id === id)?.messages || [],
        }));
      } catch (error) {
        console.error("Failed to select chat:", error);
      }
    },
    [activeId, messages, sessions, storageService]
  );

  const handleDeleteChat = useCallback((id: string) => {
    setChatState((prev) => {
      const newSessions = prev.sessions.filter((chat) => chat.id !== id);

      if (newSessions.length === 0) {
        const newChatId = Date.now().toString();
        const newChat = {
          id: newChatId,
          title: "New Chat",
          messages: [],
        };
        return {
          sessions: [newChat],
          activeId: newChatId,
          messages: [],
        };
      }

      if (id === prev.activeId) {
        const newActiveId = newSessions[0].id;
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

  const clearMessages = useCallback(() => {
    setChatState((prev) => ({ ...prev, messages: [] }));
    setTokenUsage({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setUIState((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
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
    setSelectedModel,
    handleNewChat,
    handleSendMessage,
    handleSelectChat,
    handleDeleteChat,
    clearMessages,
  };
}
