'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import MessageInput from './message-input';
import type { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { Trash2 } from 'lucide-react';
import { ChatArea } from './chat-area';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessageAction: (content: string) => void;
  onClearChatAction: () => void;
  isStreaming?: boolean;
  selectedModel?: string;
}

export default function ChatInterface({
  messages,
  onSendMessageAction,
  onClearChatAction,
  isStreaming = false,
  selectedModel,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleEditMessage = (messageId: string) => {
    const messageToEdit = messages.find(message => message.id === messageId);
    if (messageToEdit && messageToEdit.content) {
      setInputValue(messageToEdit.content);
      setEditingMessageId(messageId);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessageAction(inputValue);
      setInputValue('');
      setEditingMessageId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const processCommand = (input: string) => {
    const trimmedInput = input.trim();

    if (trimmedInput === '/reset' || trimmedInput === '/clear') {
      onClearChatAction();
      return true;
    }

    if (trimmedInput === '/help') {
      onSendMessageAction('/help');
      return true;
    }

    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue.startsWith('/')) {
      const isCommand = processCommand(inputValue);
      if (isCommand) {
        setInputValue('');
        return;
      }
    }

    handleSendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 ? (
          <ChatArea
            messages={messages}
            isStreaming={isStreaming}
            selectedModel={selectedModel}
            onEditMessage={handleEditMessage}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[hsl(var(--chat-empty-text))] dark:text-[hsl(var(--chat-empty-desc-text))]">
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Type a message to begin chatting with the AI assistant</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[hsl(var(--chat-footer-border))] bg-[hsl(var(--chat-footer-bg))] dark:bg-gray-800 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center space-x-2">
            <form onSubmit={handleSubmit} className="flex-1 flex items-end space-x-2">
              <MessageInput
                value={inputValue}
                onChangeAction={e => setInputValue(e.target.value)}
                onKeyDownAction={handleKeyDown}
                placeholder={editingMessageId ? 'Edit your message...' : 'Type a message...'}
              />
              <Button type="submit" disabled={!inputValue.trim()}>
                {editingMessageId ? 'Update' : 'Send'}
              </Button>
              {editingMessageId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingMessageId(null);
                    setInputValue('');
                  }}
                >
                  Cancel
                </Button>
              )}
            </form>
            <Button variant="outline" onClick={() => signIn('oidc')}>
              Login
            </Button>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  onClearChatAction();
                }}
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="mt-2 text-xs text-[hsl(var(--chat-footer-subtext))] dark:text-gray-400">
            <span>
              Press Enter to send, Shift+Enter for new line. Try commands like /help or /reset
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
