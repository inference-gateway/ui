import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Session } from 'next-auth';
import PageClient from '@/app/chat/page-client';
import { StorageConfig, StorageType } from '@/types/chat';

const mockStorageService = {
  getChatSessions: jest.fn(),
  saveChatSessions: jest.fn(),
  getActiveChatId: jest.fn(),
  saveActiveChatId: jest.fn(),
  getSelectedModel: jest.fn(),
  saveSelectedModel: jest.fn(),
  clear: jest.fn(),
  close: jest.fn(),
};

jest.mock('@/components/model-selector', () => {
  return function MockModelSelector() {
    return <div data-testid="mock-model-selector">Mock Model Selector</div>;
  };
});

jest.mock('@/components/theme-toggle', () => {
  return function MockThemeToggle() {
    return <button data-testid="mock-theme-toggle">Mock Theme Toggle</button>;
  };
});

jest.mock('@/components/welcome-message', () => {
  return function MockWelcomeMessage() {
    return <div data-testid="mock-welcome-message">Mock Welcome Message</div>;
  };
});

jest.mock('@/lib/storage', () => ({
  StorageServiceFactory: {
    createService: jest.fn(() => mockStorageService),
  },
}));

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

jest.mock('@/lib/agent', () => ({
  runAgentLoop: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock('@inference-gateway/sdk', () => ({
  InferenceGatewayClient: jest.fn().mockImplementation(() => ({})),
}));

describe('PageClient Storage Optimization', () => {
  const mockSession: Session = {
    user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
    expires: '2024-12-31',
  };

  const mockStorageConfig: StorageConfig = {
    type: StorageType.LOCAL,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockStorageService.getChatSessions.mockResolvedValue([]);
    mockStorageService.getActiveChatId.mockResolvedValue('');
    mockStorageService.getSelectedModel.mockResolvedValue('');
    mockStorageService.saveChatSessions.mockResolvedValue(undefined);
    mockStorageService.saveActiveChatId.mockResolvedValue(undefined);
    mockStorageService.saveSelectedModel.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should use immediate save for user-initiated actions', async () => {
    mockStorageService.getChatSessions.mockResolvedValue([
      {
        id: 'existing-chat',
        title: 'Existing Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        tokenUsage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      },
    ]);
    mockStorageService.getActiveChatId.mockResolvedValue('existing-chat');

    render(<PageClient session={mockSession} storageConfig={mockStorageConfig} />);

    await waitFor(() => {
      expect(mockStorageService.getChatSessions).toHaveBeenCalled();
    });

    const newChatButton = screen.getByLabelText('New chat');

    act(() => {
      fireEvent.click(newChatButton);
    });

    await waitFor(
      () => {
        expect(mockStorageService.saveChatSessions).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    expect(mockStorageService.saveChatSessions.mock.calls.length).toBeGreaterThan(0);
  });
});
