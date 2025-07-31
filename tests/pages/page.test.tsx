import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Chat from '@/app/chat/page-client';
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
  const mockStorageConfig = {
    type: 'local',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useIsMobile as jest.Mock).mockReturnValue(false);

    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  test('renders the main components', async () => {
    await act(async () => {
      render(<Chat storageConfig={mockStorageConfig} />);
    });

    expect(screen.getByTestId('mock-model-selector')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask anything or type / for commands')).toBeInTheDocument();
    expect(screen.getByLabelText('New chat')).toBeInTheDocument();
  });
});
