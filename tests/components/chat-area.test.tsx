import React from "react";
import { render, screen } from "@testing-library/react";
jest.mock("react-markdown", () => {
  const MockReactMarkdown = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
  MockReactMarkdown.displayName = "MockReactMarkdown";
  return MockReactMarkdown;
});

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("react-syntax-highlighter/dist/esm/styles/hljs", () => ({
  dark: () => ({}),
}));
import { ChatArea } from "@/components/chat-area";
import type { Message } from "@/types/chat";
import { MessageRole } from "@inference-gateway/sdk";

describe("ChatArea Component", () => {
  const mockMessages: Message[] = [
    {
      id: "1",
      role: MessageRole.user,
      content: "Hello, how are you?",
    },
    {
      id: "2",
      role: MessageRole.assistant,
      content: "I am doing well, thank you for asking!",
      model: "gpt-4o",
    },
  ];

  test("renders empty state when no messages", () => {
    render(<ChatArea messages={[]} isStreaming={false} />);

    expect(screen.getByText("Start a conversation")).toBeInTheDocument();
    expect(
      screen.getByText("Type a message to begin chatting with the AI assistant")
    ).toBeInTheDocument();
  });

  test("renders messages correctly", () => {
    render(<ChatArea messages={mockMessages} isStreaming={false} />);

    expect(screen.getByText("Hello, how are you?")).toBeInTheDocument();
    expect(
      screen.getByText("I am doing well, thank you for asking!")
    ).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getByText("gpt-4o")).toBeInTheDocument();
  });

  test("shows streaming indicator when isStreaming is true", () => {
    const streamingMessages: Message[] = [
      ...mockMessages,
      {
        id: "3",
        role: MessageRole.assistant,
        content: "",
      },
    ];

    render(<ChatArea messages={streamingMessages} isStreaming={true} />);

    const animationElement = document.querySelector(".animate-pulse");
    expect(animationElement).toBeInTheDocument();
  });
});
