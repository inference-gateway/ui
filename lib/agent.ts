import {
  InferenceGatewayClient,
  SchemaChatCompletionTool,
  SchemaChatCompletionMessageToolCall,
} from '@inference-gateway/sdk';
import { Message, MessageRole } from '@/types/chat';
import { SYSTEM_PROMPT } from '@/lib/constants';
import { ToolHandlers } from '@/lib/tools';
import logger from '@/lib/logger';

function generateUniqueId(prefix = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

interface AgentRunnerOptions {
  model: string;
  messages: Message[];
  tools?: SchemaChatCompletionTool[];
  client: InferenceGatewayClient;
  onUpdateMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  onUpdateUsage: (usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }) => void;
}

export async function runAgentLoop({
  model,
  messages,
  tools,
  client,
  onUpdateMessages,
  onUpdateUsage,
}: AgentRunnerOptions): Promise<void> {
  let currentAssistantContent = '';
  let currentReasoningContent = '';
  const toolCalls: SchemaChatCompletionMessageToolCall[] = [];
  let currentMessages = [...messages];

  const assistantMessageId = generateUniqueId('assistant-');
  const assistantMessage: Message = {
    id: assistantMessageId,
    role: MessageRole.assistant,
    content: '',
  };

  currentMessages = [...currentMessages, assistantMessage];
  onUpdateMessages(currentMessages);

  try {
    await client.streamChatCompletion(
      {
        model,
        messages: prepareMessages(messages, model),
        tools,
      },
      {
        onContent: delta => {
          currentAssistantContent += delta;
          currentMessages = updateMessageContent(
            currentMessages,
            assistantMessageId,
            currentAssistantContent
          );
          onUpdateMessages(currentMessages);
        },
        onReasoning: reasoning => {
          currentReasoningContent += reasoning;
          currentMessages = updateMessageReasoning(
            currentMessages,
            assistantMessageId,
            currentReasoningContent
          );
          onUpdateMessages(currentMessages);
        },
        onTool: async toolCall => {
          toolCalls.push(toolCall);
          currentMessages = updateMessageToolCalls(currentMessages, assistantMessageId, toolCalls);
          onUpdateMessages(currentMessages);

          await executeToolAndResume(
            toolCall,
            model,
            client,
            tools,
            currentMessages,
            onUpdateMessages,
            onUpdateUsage
          );
        },
        onUsageMetrics: usage => {
          if (usage) onUpdateUsage(usage);
        },
        onError: err => {
          logger.error('Agent loop error', {
            error: err instanceof Error ? err.message : String(err),
          });
        },
      }
    );
  } catch (err) {
    logger.error('Agent streaming failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function prepareMessages(messages: Message[], model: string) {
  const isO1Mini = model === 'openai/o1-mini';
  const systemMessage = { role: MessageRole.system, content: SYSTEM_PROMPT };

  const formattedMessages = messages.map(msg => {
    return {
      role: msg.role,
      content: msg.content || '',
      ...(msg.tool_call_id && { tool_call_id: msg.tool_call_id }),
      ...(msg.tool_calls && { tool_calls: msg.tool_calls }),
    };
  });

  return isO1Mini ? formattedMessages : [systemMessage, ...formattedMessages];
}

function updateMessageContent(messages: Message[], id: string, content: string) {
  return messages.map(msg => (msg.id === id ? { ...msg, content } : msg));
}

function updateMessageReasoning(messages: Message[], id: string, reasoning: string) {
  return messages.map(msg => (msg.id === id ? { ...msg, reasoning } : msg));
}

function updateMessageToolCalls(
  messages: Message[],
  id: string,
  toolCalls: SchemaChatCompletionMessageToolCall[]
) {
  return messages.map(msg => (msg.id === id ? { ...msg, tool_calls: toolCalls } : msg));
}

async function executeToolAndResume(
  toolCall: SchemaChatCompletionMessageToolCall,
  model: string,
  client: InferenceGatewayClient,
  tools: SchemaChatCompletionTool[] | undefined,
  currentMessages: Message[],
  onUpdateMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
  onUpdateUsage: (usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }) => void
) {
  const { function: funcCall } = toolCall;
  const handler = ToolHandlers[funcCall.name];

  if (!handler) {
    logger.error(`No handler for tool: ${funcCall.name}`);
    return;
  }

  let args = {};
  try {
    args = JSON.parse(funcCall.arguments);
  } catch (err) {
    logger.error('Failed to parse tool arguments', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const toolResult = await handler.call(args);

  const toolMessageId = generateUniqueId('tool-');
  const toolMessage: Message = {
    id: toolMessageId,
    role: MessageRole.tool,
    content: JSON.stringify(toolResult),
    tool_call_id: toolCall.id,
  };

  currentMessages = [...currentMessages, toolMessage];
  onUpdateMessages(currentMessages);

  await runAgentLoop({
    model,
    messages: currentMessages,
    tools,
    client,
    onUpdateMessages,
    onUpdateUsage,
  });
}
