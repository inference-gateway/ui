import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Chat from '@/app/chat/page-client';
import { useChat } from '@/hooks/use-chat';
import { useIsMobile } from '@/hooks/use-mobile';

interface MockModelSelectorProps {
  selectedModel: string;
  onSelectModelAction: (modelId: string) => void;
}

jest.mock('@/components/model-selector', () => {
  return function MockModelSelector(props: MockModelSelectorProps) {
    return (
      <div data-testid="mock-model-selector">
        <select
          value={props.selectedModel}
          onChange={e => props.onSelectModelAction(e.target.value)}
        >
          <option value="gpt-4o">gpt-4o</option>
        </select>
      </div>
    );
  };
});

jest.mock('react-markdown', () => {
  const MockReactMarkdown = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  MockReactMarkdown.displayName = 'MockReactMarkdown';
  return MockReactMarkdown;
});

jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/hljs', () => ({
  dark: () => ({}),
}));

jest.mock('@/hooks/use-chat', () => ({
  useChat: jest.fn(),
}));

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(),
}));

const mockSaveSelectedModel = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/storage', () => ({
  StorageServiceFactory: {
    createService: jest.fn(() => ({
      getChatSessions: jest.fn().mockResolvedValue([]),
      getActiveChatId: jest.fn().mockResolvedValue(''),
      getSelectedModel: jest.fn().mockResolvedValue(''),
      saveSelectedModel: mockSaveSelectedModel,
      saveChatSessions: jest.fn().mockResolvedValue(undefined),
      saveActiveChatId: jest.fn().mockResolvedValue(undefined),
    })),
  },
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: 'Test User',
        email: 'testuser@example.com',
      },
    },
  })),
}));

describe('Home Component', () => {
  const mockHandleSendMessage = jest.fn();
  const mockSetSelectedModel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useChat as jest.Mock).mockReturnValue({
      chatSessions: [{ id: '1', title: 'Test Chat' }],
      activeChatId: '1',
      messages: [],
      selectedModel: 'gpt-4o',
      isLoading: false,
      isStreaming: false,
      tokenUsage: { prompttTokens: 0, completion_tokens: 0, total_tokens: 0 },
      setSelectedModel: mockSetSelectedModel,
      handleNewChat: jest.fn(),
      handleSendMessage: mockHandleSendMessage,
      handleSelectChat: jest.fn(),
      handleDeleteChat: jest.fn(),
      chatContainerRef: { current: null },
    });

    (useIsMobile as jest.Mock).mockReturnValue(false);

    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  test('renders the main components', async () => {
    await act(async () => {
      render(<Chat />);
    });

    expect(screen.getByTestId('mock-model-selector')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask anything or type / for commands')).toBeInTheDocument();
    expect(screen.getByLabelText('New chat')).toBeInTheDocument();
  });
});
