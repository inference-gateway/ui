import { MessageRole } from "@inference-gateway/sdk";

export const mockChatSessions = [
  {
    id: "1",
    title: "First Chat",
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
  {
    id: "2",
    title: "Second Chat",
    messages: [
      {
        id: "msg3",
        role: MessageRole.user,
        content: "What's the weather today?",
      },
      {
        id: "msg4",
        role: MessageRole.assistant,
        content: "I'm sorry, I can't provide weather information.",
        model: "anthropic/claude-3-opus",
      },
    ],
  },
  {
    id: "3",
    title: "Empty Chat",
    messages: [],
  },
  {
    id: "4",
    title: "Long Conversation",
    messages: [
      {
        id: "msg5",
        role: MessageRole.user,
        content: "Let's discuss AI safety",
      },
      {
        id: "msg6",
        role: MessageRole.assistant,
        content:
          "AI safety is an important topic. What specifically would you like to discuss?",
        model: "anthropic/claude-3-sonnet",
      },
      {
        id: "msg7",
        role: MessageRole.user,
        content: "Alignment and control problems",
      },
      {
        id: "msg8",
        role: MessageRole.assistant,
        content:
          "Those are complex issues involving reward modeling and goal specification.",
        model: "anthropic/claude-3-sonnet",
      },
      {
        id: "msg9",
        role: MessageRole.user,
        content: "Can you explain more?",
      },
      {
        id: "msg10",
        role: MessageRole.assistant,
        content:
          "Certainly. The alignment problem refers to ensuring AI systems pursue their intended goals...",
        model: "anthropic/claude-3-sonnet",
      },
    ],
  },
  {
    id: "5",
    title: "Special Characters Chat",
    messages: [
      {
        id: "msg11",
        role: MessageRole.user,
        content: "Hello! こんにちは! Привет! 😊",
      },
      {
        id: "msg12",
        role: MessageRole.assistant,
        content: "你好! ¡Hola! Bonjour! 👋",
        model: "mistral/mistral-large",
      },
    ],
  },
];

export const mockTokenUsage = {
  promptTokens: 42,
  completionTokens: 128,
  totalTokens: 170,
};

export const mockHandlers = {
  onNewChatAction: jest.fn(),
  onSelectChatAction: jest.fn(),
  onDeleteChatAction: jest.fn(),
  setIsMobileOpen: jest.fn(),
  onTokenUsageUpdate: jest.fn(),
};

export const mockModels = [
  "openai/gpt-4o",
  "openai/gpt-4-turbo",
  "anthropic/claude-3-opus",
  "anthropic/claude-3-sonnet",
  "anthropic/claude-3-haiku",
  "mistral/mistral-large",
  "mistral/mistral-medium",
  "google/gemini-1.5-pro",
];
