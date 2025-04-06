import { jest } from "@jest/globals";
import "@testing-library/jest-dom";
import React from "react";

jest.mock("@/lib/logger", () => {
  return {
    __esModule: true,
    default: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  };
});

jest.mock("@/lib/storage", () => ({
  StorageServiceFactory: {
    createService: jest.fn(),
  },
}));

jest.mock("@inference-gateway/sdk", () => ({
  InferenceGatewayClient: jest.fn(),
  MessageRole: {
    user: "user",
    assistant: "assistant",
    system: "system",
    tool: "tool",
  },
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: "Test User",
        email: "test@example.com",
      },
      expires: "1",
    },
    status: "authenticated",
  })),
  getSession: jest.fn(() =>
    Promise.resolve({
      user: {
        name: "Test User",
        email: "test@example.com",
      },
      expires: "1",
    })
  ),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("react-markdown", () => {
  const MockReactMarkdown = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
  };
  MockReactMarkdown.displayName = "MockReactMarkdown";
  return MockReactMarkdown;
});

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
  },
  default: ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
  },
}));

jest.mock("react-syntax-highlighter/dist/esm/styles/hljs", () => ({
  dark: () => ({}),
}));

jest.mock("@/lib/api", () => ({
  fetchModels: jest.fn(),
}));
