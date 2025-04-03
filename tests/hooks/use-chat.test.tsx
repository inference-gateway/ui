import { renderHook, waitFor } from "@testing-library/react";
import { useChat } from "@/hooks/use-chat";
import { StorageServiceFactory } from "@/lib/storage";
import { InferenceGatewayClient, MessageRole } from "@inference-gateway/sdk";

jest.mock("@/lib/storage", () => ({
  StorageServiceFactory: {
    createService: jest.fn(),
  },
}));

jest.mock("@inference-gateway/sdk", () => {
  const original = jest.requireActual("@inference-gateway/sdk");
  return {
    ...original,
    InferenceGatewayClient: jest.fn(),
  };
});

describe("useChat Hook", () => {
  const mockGetChatSessions = jest.fn();
  const mockSaveChatSessions = jest.fn();
  const mockGetActiveChatId = jest.fn();
  const mockSaveActiveChatId = jest.fn();
  const mockClear = jest.fn();

  const mockStreamChatCompletion = jest.fn();
  const mockWithOptions = jest.fn();
  const mockCreateChatCompletion = jest.fn();

  beforeAll(() => {
    global.crypto = {
      subtle: {} as SubtleCrypto,
      getRandomValues: jest.fn(),
      randomUUID: () => "12345678-1234-1234-1234-123456789012",
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const mockStorageService = {
      getChatSessions: mockGetChatSessions,
      saveChatSessions: mockSaveChatSessions,
      getActiveChatId: mockGetActiveChatId,
      saveActiveChatId: mockSaveActiveChatId,
      clear: mockClear,
    };

    (StorageServiceFactory.createService as jest.Mock).mockReturnValue(
      mockStorageService
    );

    const mockClient = {
      streamChatCompletion: mockStreamChatCompletion,
      withOptions: mockWithOptions,
      createChatCompletion: mockCreateChatCompletion,
    };

    (InferenceGatewayClient as unknown as jest.Mock).mockImplementation(
      () => mockClient
    );
    mockWithOptions.mockReturnValue(mockClient);

    mockGetChatSessions.mockResolvedValue([
      {
        id: "1",
        title: "Existing Chat",
        messages: [
          {
            id: "msg1",
            role: MessageRole.user,
            content: "Hello",
          },
          {
            id: "msg2",
            role: MessageRole.assistant,
            content: "Hi there!",
            model: "openai/gpt-4o",
          },
        ],
      },
    ]);
    mockGetActiveChatId.mockResolvedValue("1");

    global.fetch = jest.fn();
  });

  afterAll(() => {
    // @ts-expect-error - We're intentionally deleting crypto
    delete global.crypto;
  });

  test("initializes with correct state", async () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.selectedModel).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isStreaming).toBe(false);

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    expect(result.current.chatSessions).toEqual([
      {
        id: "1",
        title: "Existing Chat",
        messages: [
          {
            id: "msg1",
            role: MessageRole.user,
            content: "Hello",
          },
          {
            id: "msg2",
            role: MessageRole.assistant,
            content: "Hi there!",
            model: "openai/gpt-4o",
          },
        ],
      },
    ]);
    expect(result.current.activeChatId).toBe("1");
    expect(result.current.messages).toEqual([
      {
        id: "msg1",
        role: MessageRole.user,
        content: "Hello",
      },
      {
        id: "msg2",
        role: MessageRole.assistant,
        content: "Hi there!",
        model: "openai/gpt-4o",
      },
    ]);
  });

  test("handleNewChat creates a new chat session", async () => {
    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    const initialChatId = result.current.activeChatId;

    result.current.handleNewChat();

    await waitFor(() => {
      expect(mockSaveChatSessions).toHaveBeenCalled();
    });

    expect(mockSaveActiveChatId).toHaveBeenCalled();

    await waitFor(() => {
      expect(result.current.activeChatId).not.toBe(initialChatId);
      expect(result.current.activeChatId).toBe(
        "12345678-1234-1234-1234-123456789012"
      );
    });

    expect(result.current.messages).toEqual([]);

    expect(
      result.current.chatSessions.some(
        (session) => session.id === "12345678-1234-1234-1234-123456789012"
      )
    ).toBe(true);
  });

  test("handleSelectChat switches the active chat", async () => {
    mockGetChatSessions.mockResolvedValue([
      {
        id: "1",
        title: "First Chat",
        messages: [{ id: "msg1", role: MessageRole.user, content: "Hello" }],
      },
      {
        id: "2",
        title: "Second Chat",
        messages: [{ id: "msg2", role: MessageRole.user, content: "Hi there" }],
      },
    ]);

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBe(2);
    });

    result.current.handleSelectChat("2");

    await waitFor(() => {
      expect(result.current.activeChatId).toBe("2");
    });

    expect(result.current.messages).toEqual([
      { id: "msg2", role: MessageRole.user, content: "Hi there" },
    ]);
  });

  test("handleDeleteChat removes a chat session", async () => {
    mockGetChatSessions.mockResolvedValue([
      {
        id: "1",
        title: "First Chat",
        messages: [{ id: "msg1", role: MessageRole.user, content: "Hello" }],
      },
      {
        id: "2",
        title: "Second Chat",
        messages: [{ id: "msg2", role: MessageRole.user, content: "Hi there" }],
      },
    ]);

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBe(2);
    });

    result.current.handleDeleteChat("1");

    await waitFor(() => {
      expect(result.current.activeChatId).toBe("2");
    });

    expect(result.current.messages).toEqual([
      { id: "msg2", role: MessageRole.user, content: "Hi there" },
    ]);
    expect(result.current.chatSessions.length).toBe(1);
  });

  test("handleSendMessage handles streaming errors", async () => {
    mockStreamChatCompletion.mockRejectedValue(new Error("Streaming failed"));

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    result.current.setSelectedModel("openai/gpt-4o");

    await waitFor(() => {
      expect(result.current.selectedModel).toBe("openai/gpt-4o");
    });

    await expect(
      result.current.handleSendMessage("Test message")
    ).rejects.toThrow("Streaming failed");

    await waitFor(() => {
      expect(result.current.isStreaming).toBe(false);
    });
  });

  test("handleSendMessage handles partial streaming responses", async () => {
    mockStreamChatCompletion.mockImplementation((_, callbacks) => {
      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: "Partial",
                role: MessageRole.assistant,
              },
            },
          ],
        });
      }, 10);

      setTimeout(() => {
        callbacks.onError(new Error("Stream interrupted"));
      }, 20);

      return Promise.resolve();
    });

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    result.current.setSelectedModel("anthropic/claude-3-opus");

    await waitFor(() => {
      expect(result.current.selectedModel).toBe("anthropic/claude-3-opus");
    });

    await result.current.handleSendMessage("Test message");

    await waitFor(() => {
      expect(
        result.current.messages[result.current.messages.length - 1].content
      ).toBe("Partial");
    });

    expect(result.current.isStreaming).toBe(false);
  });

  test("handleSendMessage handles long conversations", async () => {
    mockStreamChatCompletion.mockImplementation((_, callbacks) => {
      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: "First",
                role: MessageRole.assistant,
              },
            },
          ],
        });
      }, 10);

      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: " response",
              },
            },
          ],
        });
      }, 20);

      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: " part",
              },
            },
          ],
        });
      }, 30);

      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: " two",
              },
            },
          ],
        });
      }, 40);

      return Promise.resolve();
    });

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    result.current.setSelectedModel("anthropic/claude-3-sonnet");

    await waitFor(() => {
      expect(result.current.selectedModel).toBe("anthropic/claude-3-sonnet");
    });

    await result.current.handleSendMessage("Long test message");

    await waitFor(() => {
      expect(result.current.messages.length).toBe(2);
    });

    await waitFor(() => {
      expect(result.current.messages[1].content).toBe(
        "First response part two"
      );
    });
  });

  test("handleSendMessage handles special characters", async () => {
    mockStreamChatCompletion.mockImplementation((_, callbacks) => {
      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: "你好",
                role: MessageRole.assistant,
              },
            },
          ],
        });
      }, 10);

      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: "! 👋",
              },
            },
          ],
        });
      }, 20);

      return Promise.resolve();
    });

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    result.current.setSelectedModel("mistral/mistral-large");

    await waitFor(() => {
      expect(result.current.selectedModel).toBe("mistral/mistral-large");
    });

    await result.current.handleSendMessage("Hello! こんにちは");

    await waitFor(() => {
      expect(result.current.messages[1].content).toBe("你好! 👋");
    });
  });

  test("handleSendMessage adds user message and triggers AI response", async () => {
    mockStreamChatCompletion.mockImplementation((_, callbacks) => {
      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: "Hello",
                role: MessageRole.assistant,
              },
            },
          ],
        });
      }, 10);

      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: " there!",
                reasoning_content: "This is thinking content",
              },
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        });
      }, 20);

      return Promise.resolve();
    });

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    result.current.setSelectedModel("openai/gpt-4o");

    await waitFor(() => {
      expect(result.current.selectedModel).toBe("openai/gpt-4o");
    });

    await result.current.handleSendMessage("Test message");

    await waitFor(() => {
      return result.current.messages.some(
        (msg) => msg.role === MessageRole.user && msg.content === "Test message"
      );
    });

    expect(result.current.messages[result.current.messages.length - 2]).toEqual(
      expect.objectContaining({
        role: MessageRole.user,
        content: "Test message",
      })
    );

    await waitFor(() => {
      const lastMessage =
        result.current.messages[result.current.messages.length - 1];
      return (
        lastMessage.role === MessageRole.assistant &&
        lastMessage.model === "openai/gpt-4o"
      );
    });

    expect(result.current.messages[result.current.messages.length - 1]).toEqual(
      expect.objectContaining({
        role: MessageRole.assistant,
        model: "openai/gpt-4o",
      })
    );

    await waitFor(
      () => {
        return result.current.tokenUsage.totalTokens === 30;
      },
      { timeout: 1000 }
    );

    expect(result.current.tokenUsage).toEqual({
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    });
  });

  test("clearMessages resets the message list and token usage", async () => {
    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });

    result.current.clearMessages();

    await waitFor(() => {
      expect(result.current.messages).toEqual([]);
    });

    expect(result.current.tokenUsage).toEqual({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    });
  });

  test("setSelectedModel updates model correctly", async () => {
    const { result } = renderHook(() => useChat());

    result.current.setSelectedModel("anthropic/claude-3-sonnet");

    await waitFor(() => {
      expect(result.current.selectedModel).toBe("anthropic/claude-3-sonnet");
    });

    result.current.setSelectedModel("mistral/mistral-large");

    await waitFor(() => {
      expect(result.current.selectedModel).toBe("mistral/mistral-large");
    });

    result.current.setSelectedModel("google/gemini-1.5-pro");

    await waitFor(() => {
      expect(result.current.selectedModel).toBe("google/gemini-1.5-pro");
    });

    await expect(() =>
      result.current.setSelectedModel("invalid-model")
    ).toThrow();
  });

  test("handles model switching during streaming", async () => {
    mockStreamChatCompletion.mockImplementation((_, callbacks) => {
      setTimeout(() => {
        callbacks.onChunk({
          choices: [
            {
              delta: {
                content: "First",
                role: MessageRole.assistant,
              },
            },
          ],
        });
      }, 50);

      return Promise.resolve();
    });

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.chatSessions.length).toBeGreaterThan(0);
    });

    result.current.setSelectedModel("anthropic/claude-3-opus");
    const sendPromise = result.current.handleSendMessage("Test");

    result.current.setSelectedModel("openai/gpt-4-turbo");

    await sendPromise;

    await waitFor(() => {
      expect(result.current.messages[1].model).toBe("anthropic/claude-3-opus");
    });
  });

  test("toggleTheme switches between dark and light mode", async () => {
    const { result } = renderHook(() => useChat(true));

    expect(result.current.isDarkMode).toBe(true);

    result.current.toggleTheme();

    await waitFor(() => {
      expect(result.current.isDarkMode).toBe(false);
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    result.current.toggleTheme();

    await waitFor(() => {
      expect(result.current.isDarkMode).toBe(true);
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
