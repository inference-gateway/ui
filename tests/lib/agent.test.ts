import { runAgentLoop } from '@/lib/agent';
import { Message, MessageRole } from '@/types/chat';
import { ToolHandlers } from '@/lib/tools';
import logger from '@/lib/logger';

interface StreamCallbacks {
  onContent: (delta: string) => void;
  onReasoning: (delta: string) => void;
  onTool: (toolCall: any) => void;
  onUsageMetrics: (usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }) => void;
  onError: (error: Error) => void;
}

jest.mock('@/lib/tools', () => ({
  ToolHandlers: {
    'test-tool': {
      call: jest.fn().mockResolvedValue({ result: 'tool-result' }),
    },
  },
}));

jest.mock('@/lib/constants', () => ({
  SYSTEM_PROMPT: 'Test system prompt',
}));

describe('agent module', () => {
  const mockClient = {
    streamChatCompletion: jest.fn(),
  };

  const mockUpdateMessages = jest.fn();
  const mockUpdateUsage = jest.fn();

  const initialMessages: Message[] = [
    {
      id: 'user-message-1',
      role: MessageRole.user,
      content: 'Test message',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runAgentLoop', () => {
    it('should initialize with assistant message and call streamChatCompletion', async () => {
      mockClient.streamChatCompletion.mockImplementation(
        async (_: any, callbacks: StreamCallbacks) => {
          callbacks.onContent('Test response');
          callbacks.onUsageMetrics({ prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 });
        }
      );

      await runAgentLoop({
        model: 'test-model',
        messages: initialMessages,
        tools: [],
        client: mockClient as any,
        onUpdateMessages: mockUpdateMessages,
        onUpdateUsage: mockUpdateUsage,
      });

      expect(mockUpdateMessages).toHaveBeenCalledTimes(2);
      expect(mockUpdateMessages.mock.calls[0][0].length).toBe(2);
      expect(mockUpdateMessages.mock.calls[0][0][1].role).toBe(MessageRole.assistant);
      expect(mockUpdateMessages.mock.calls[0][0][1].content).toBe('');

      expect(mockClient.streamChatCompletion).toHaveBeenCalledTimes(1);
      expect(mockClient.streamChatCompletion.mock.calls[0][0]).toMatchObject({
        model: 'test-model',
        messages: expect.arrayContaining([
          { role: MessageRole.system, content: 'Test system prompt' },
          { role: MessageRole.user, content: 'Test message' },
        ]),
      });

      expect(mockUpdateUsage).toHaveBeenCalledWith({
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      });
    });

    it('should handle content streaming properly', async () => {
      mockClient.streamChatCompletion.mockImplementation(
        async (_: any, callbacks: StreamCallbacks) => {
          callbacks.onContent('Hello');
          callbacks.onContent(' world');
          callbacks.onContent('!');
        }
      );

      await runAgentLoop({
        model: 'test-model',
        messages: initialMessages,
        client: mockClient as any,
        onUpdateMessages: mockUpdateMessages,
        onUpdateUsage: mockUpdateUsage,
      });

      expect(mockUpdateMessages).toHaveBeenCalledTimes(4);
      const lastCall = mockUpdateMessages.mock.calls[3][0];
      expect(lastCall[1].content).toBe('Hello world!');
    });

    it('should handle reasoning streaming properly', async () => {
      mockClient.streamChatCompletion.mockImplementation(
        async (_: any, callbacks: StreamCallbacks) => {
          callbacks.onReasoning('First');
          callbacks.onReasoning(' thought');
          callbacks.onReasoning(' process');
        }
      );

      await runAgentLoop({
        model: 'test-model',
        messages: initialMessages,
        client: mockClient as any,
        onUpdateMessages: mockUpdateMessages,
        onUpdateUsage: mockUpdateUsage,
      });

      expect(mockUpdateMessages).toHaveBeenCalledTimes(4);
      const lastCall = mockUpdateMessages.mock.calls[3][0];
      expect(lastCall[1].reasoning_content).toBe('First thought process');
    });

    it('should handle tool calls properly', async () => {
      const toolCallId = 'tool-123';
      const mockToolCall = {
        id: toolCallId,
        type: 'function',
        function: {
          name: 'test-tool',
          arguments: JSON.stringify({ param: 'test' }),
        },
      };

      mockClient.streamChatCompletion.mockImplementation(
        async (_: any, callbacks: StreamCallbacks) => {
          callbacks.onTool(mockToolCall);
        }
      );

      await runAgentLoop({
        model: 'test-model',
        messages: initialMessages,
        tools: [{ name: 'test-tool', description: 'Test tool', parameters: {} } as any],
        client: mockClient as any,
        onUpdateMessages: mockUpdateMessages,
        onUpdateUsage: mockUpdateUsage,
      });

      expect(ToolHandlers['test-tool'].call).toHaveBeenCalledWith({ param: 'test' });

      const toolMessageFound = mockUpdateMessages.mock.calls.some(call => {
        const messages = call[0];
        return messages.some(
          (m: Message) => m.role === MessageRole.tool && m.tool_call_id === toolCallId
        );
      });

      expect(toolMessageFound).toBe(true);
    });

    it('should handle o1-mini model differently (without system prompt)', async () => {
      mockClient.streamChatCompletion.mockImplementation(async () => {});

      await runAgentLoop({
        model: 'openai/o1-mini',
        messages: initialMessages,
        client: mockClient as any,
        onUpdateMessages: mockUpdateMessages,
        onUpdateUsage: mockUpdateUsage,
      });

      expect(mockClient.streamChatCompletion).toHaveBeenCalled();

      const o1MiniCallFound = mockClient.streamChatCompletion.mock.calls.some(call => {
        const requestConfig = call[0] as { messages?: any[] };
        if (!requestConfig || !requestConfig.messages) return false;

        const messages = requestConfig.messages;

        return messages.length === 1 && messages[0].role === MessageRole.user;
      });

      expect(o1MiniCallFound).toBe(true);
    });

    it('should handle errors during streaming', async () => {
      const streamingError = new Error('Streaming failed');
      mockClient.streamChatCompletion.mockRejectedValue(streamingError);
      const loggerSpy = jest.spyOn(logger, 'error');

      await runAgentLoop({
        model: 'test-model',
        messages: initialMessages,
        client: mockClient as any,
        onUpdateMessages: mockUpdateMessages,
        onUpdateUsage: mockUpdateUsage,
      });

      expect(loggerSpy).toHaveBeenCalledWith('Agent streaming failed', {
        error: 'Streaming failed',
      });
    });

    it('should handle callback errors properly', async () => {
      const callbackError = new Error('Callback failed');
      mockClient.streamChatCompletion.mockImplementation(
        async (_: any, callbacks: StreamCallbacks) => {
          callbacks.onError(callbackError);
        }
      );
      const loggerSpy = jest.spyOn(logger, 'error');

      await runAgentLoop({
        model: 'test-model',
        messages: initialMessages,
        client: mockClient as any,
        onUpdateMessages: mockUpdateMessages,
        onUpdateUsage: mockUpdateUsage,
      });

      expect(loggerSpy).toHaveBeenCalledWith('Agent loop error', {
        error: 'Callback failed',
      });
    });

    it('should handle invalid tool arguments', async () => {
      const mockToolCall = {
        id: 'tool-123',
        type: 'function',
        function: {
          name: 'test-tool',
          arguments: '{invalid json',
        },
      };

      mockClient.streamChatCompletion.mockImplementation(
        async (_: any, callbacks: StreamCallbacks) => {
          callbacks.onTool(mockToolCall);
        }
      );
      const loggerSpy = jest.spyOn(logger, 'error');

      await runAgentLoop({
        model: 'test-model',
        messages: initialMessages,
        tools: [{ name: 'test-tool', description: 'Test tool', parameters: {} } as any],
        client: mockClient as any,
        onUpdateMessages: mockUpdateMessages,
        onUpdateUsage: mockUpdateUsage,
      });

      expect(loggerSpy).toHaveBeenCalledWith('Failed to parse tool arguments', expect.anything());

      expect(ToolHandlers['test-tool'].call).toHaveBeenCalledWith({});
    });

    it('should handle unknown tools gracefully', async () => {
      const mockToolCall = {
        id: 'tool-123',
        type: 'function',
        function: {
          name: 'unknown-tool',
          arguments: '{}',
        },
      };

      mockClient.streamChatCompletion.mockImplementation(
        async (_: any, callbacks: StreamCallbacks) => {
          callbacks.onTool(mockToolCall);
        }
      );
      const loggerSpy = jest.spyOn(logger, 'error');

      await runAgentLoop({
        model: 'test-model',
        messages: initialMessages,
        tools: [{ name: 'test-tool', description: 'Test tool', parameters: {} } as any],
        client: mockClient as any,
        onUpdateMessages: mockUpdateMessages,
        onUpdateUsage: mockUpdateUsage,
      });

      expect(loggerSpy).toHaveBeenCalledWith('No handler for tool: unknown-tool');
    });
  });
});
