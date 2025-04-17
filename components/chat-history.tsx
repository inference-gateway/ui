'use client';

import { useState, useEffect } from 'react';
import type { Message } from '@/types/chat';
import { PlusIcon, TrashIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  chatSessions: {
    id: string;
    title: string;
    messages: Message[];
    createdAt?: number;
  }[];
  activeChatId: string;
  onNewChatAction: () => void;
  onSelectChatAction: (id: string) => void;
  onDeleteChatAction?: (id: string) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (isOpen: boolean) => void;
  error?: string;
  onErrorDismiss?: () => void;
}

export function ChatHistory({
  chatSessions,
  activeChatId,
  onNewChatAction,
  onSelectChatAction,
  onDeleteChatAction,
  setIsMobileOpen: externalSetMobileOpen,
  error,
  onErrorDismiss,
}: ChatHistoryProps) {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const setIsMobileOpen = externalSetMobileOpen || (() => {});

  const handleSelectChat = (id: string) => {
    onSelectChatAction(id);
    if (isMobileDevice) {
      setIsMobileOpen(false);
    }
  };

  const handleNewChat = () => {
    onNewChatAction();
    if (isMobileDevice) {
      setIsMobileOpen(false);
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteChatAction) {
      onDeleteChatAction(id);
    }
  };

  const handleDismissError = () => {
    if (onErrorDismiss) {
      onErrorDismiss();
    }
  };

  return (
    <aside className="flex flex-col h-full w-full">
      <div className="p-4">
        <h2 className="text-lg text-foreground mb-4">Chat History</h2>

        <button
          onClick={handleNewChat}
          className="w-full h-10 rounded-lg bg-[hsl(var(--chat-new-button-bg))] hover:bg-[hsl(var(--chat-new-button-hover))] flex items-center justify-center gap-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="font-normal text-sm">New Chat</span>
        </button>
      </div>

      {error && (
        <div className="mx-4 mb-2">
          <div className="bg-[hsl(var(--error-bg))] border border-[hsl(var(--error-border))] rounded-md p-3 relative">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-[hsl(var(--error-icon))] mt-0.5 shrink-0" />
              <div className="text-sm text-[hsl(var(--error-text))]">
                <p>Something went wrong, please try again</p>
                <p className="text-xs text-[hsl(var(--error-text-detail))] mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleDismissError}
              className="absolute top-1 right-1 text-[hsl(var(--error-close))] hover:text-[hsl(var(--error-close-hover))] p-1"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2" data-testid="chat-history-container">
        {chatSessions.length === 0 ? (
          <div
            className="p-4 text-center text-[hsl(var(--chat-empty-text))]"
            data-testid="empty-state"
          >
            <p data-testid="empty-message">No chats yet</p>
          </div>
        ) : (
          <div className="space-y-px">
            {[...chatSessions]
              .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
              })
              .map(chat => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectChat(chat.id);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      const next = e.currentTarget.nextElementSibling as HTMLElement;
                      next?.focus();
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      const prev = e.currentTarget.previousElementSibling as HTMLElement;
                      prev?.focus();
                    }
                  }}
                  tabIndex={0}
                  data-testid={`chat-item-${chat.id}`}
                  data-focusable="true"
                  className={cn(
                    'px-3 py-3 cursor-pointer transition-colors group flex items-center justify-between relative',
                    'focus:outline-none',
                    chat.id === activeChatId
                      ? 'text-[hsl(var(--chat-active-item-text))]'
                      : 'text-[hsl(var(--chat-inactive-item-text))] hover:bg-[hsl(var(--chat-item-hover-bg))]',
                    chat.id === activeChatId &&
                      'before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[hsl(var(--chat-active-item-marker))]'
                  )}
                  data-active={chat.id === activeChatId ? 'true' : 'false'}
                  aria-current={chat.id === activeChatId ? 'true' : 'false'}
                >
                  <p className="truncate text-sm flex-1" data-testid="chat-title">
                    {chat.title}
                  </p>
                  {onDeleteChatAction && (
                    <button
                      onClick={e => handleDeleteChat(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-[hsl(var(--chat-delete-icon))] hover:text-[hsl(var(--delete-icon-hover))] transition-opacity rounded"
                      aria-label={`Delete chat ${chat.title}`}
                      title="Delete chat"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </aside>
  );
}
