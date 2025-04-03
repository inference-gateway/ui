import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "@/app/page";
import { useChat } from "@/hooks/use-chat";
import { useIsMobile } from "@/hooks/use-mobile";

jest.mock("@/hooks/use-chat", () => ({
  useChat: jest.fn(),
}));

jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: jest.fn(),
}));

describe("Home Component", () => {
  const mockHandleSendMessage = jest.fn();
  const mockSetSelectedModel = jest.fn();
  const mockClearMessages = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useChat as jest.Mock).mockReturnValue({
      chatSessions: [{ id: "1", title: "Test Chat" }],
      activeChatId: "1",
      messages: [],
      selectedModel: "gpt-4o",
      isLoading: false,
      isStreaming: false,
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      setSelectedModel: mockSetSelectedModel,
      handleNewChat: jest.fn(),
      handleSendMessage: mockHandleSendMessage,
      handleSelectChat: jest.fn(),
      handleDeleteChat: jest.fn(),
      clearMessages: mockClearMessages,
      chatContainerRef: { current: null },
    });

    (useIsMobile as jest.Mock).mockReturnValue(false);
  });

  test("renders the main components", () => {
    render(<Home />);

    expect(screen.getByText("Inference Gateway UI")).toBeInTheDocument();
    expect(screen.getByTitle("Toggle theme")).toBeInTheDocument();
  });

  test("toggles theme when clicked", () => {
    render(<Home />);
    const themeToggle = screen.getByTitle("Toggle theme");

    fireEvent.click(themeToggle);
    expect(screen.getByText("Inference Gateway UI")).toBeInTheDocument();
  });

  test("sends message on enter key press", () => {
    render(<Home />);

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello world" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockHandleSendMessage).toHaveBeenCalledWith("Hello world");
  });

  test("does not send empty message", () => {
    render(<Home />);

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockHandleSendMessage).not.toHaveBeenCalled();
  });

  test("shows mobile menu button on mobile devices", () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);
    render(<Home />);

    const menuButton = screen.getByRole("button", { name: "" });
    expect(menuButton).toBeInTheDocument();
  });
});
