import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Home from "@/app/home/page";
import { useChat } from "@/hooks/use-chat";
import { useIsMobile } from "@/hooks/use-mobile";

interface MockModelSelectorProps {
  selectedModel: string;
  onSelectModelAction: (modelId: string) => void;
}

jest.mock("@/components/model-selector", () => {
  return function MockModelSelector(props: MockModelSelectorProps) {
    return (
      <div data-testid="mock-model-selector">
        <select
          value={props.selectedModel}
          onChange={(e) => props.onSelectModelAction(e.target.value)}
        >
          <option value="gpt-4o">gpt-4o</option>
        </select>
      </div>
    );
  };
});

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

jest.mock("@/hooks/use-chat", () => ({
  useChat: jest.fn(),
}));

jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: jest.fn(),
}));

jest.mock("@/hooks/use-session", () => ({
  useSession: jest.fn(() => ({
    session: { user: { name: "Test User" } },
  })),
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

  test("renders the main components", async () => {
    await act(async () => {
      render(<Home />);
    });

    expect(screen.getByText("Inference Gateway UI")).toBeInTheDocument();
    expect(screen.getByTitle("Toggle theme")).toBeInTheDocument();
    expect(screen.getByTestId("mock-model-selector")).toBeInTheDocument();
  });

  test("toggles theme when clicked", async () => {
    await act(async () => {
      render(<Home />);
    });
    const themeToggle = screen.getByTitle("Toggle theme");

    await act(async () => {
      fireEvent.click(themeToggle);
    });
    expect(screen.getByText("Inference Gateway UI")).toBeInTheDocument();
  });

  test("sends message on enter key press", async () => {
    await act(async () => {
      render(<Home />);
    });

    const input = screen.getByPlaceholderText("Type a message...");
    await act(async () => {
      fireEvent.change(input, { target: { value: "Hello world" } });
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(mockHandleSendMessage).toHaveBeenCalledWith("Hello world");
  });

  test("does not send empty message", async () => {
    await act(async () => {
      render(<Home />);
    });

    const input = screen.getByPlaceholderText("Type a message...");
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(mockHandleSendMessage).not.toHaveBeenCalled();
  });

  test("shows mobile menu button on mobile devices", async () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);
    await act(async () => {
      render(<Home />);
    });

    const menuButton = screen.getByRole("button", { name: "" });
    expect(menuButton).toBeInTheDocument();
  });
});
