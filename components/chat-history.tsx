'use client';

import { useState, useEffect } from 'react';
import type { Message } from '@/types/chat';
import { TrashIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  chatSessions: {
    id: string;
    title: string;
    messages: Message[];
    createdAt?: string;
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
    <aside className="flex flex-col h-full w-full overflow-hidden pt-14">
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

      <div className="flex-1 overflow-y-auto px-2 py-2" data-testid="chat-history-container">
        {chatSessions.length === 0 ? (
          <div
            className="p-4 text-center text-[hsl(var(--chat-empty-text))]"
            data-testid="empty-state"
          >
            <p data-testid="empty-message">No chats yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
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
                    'px-3 py-2.5 cursor-pointer rounded-md transition-colors group flex items-center justify-between relative',
                    'focus:outline-none focus:ring-1 focus:ring-primary/20',
                    chat.id === activeChatId
                      ? 'bg-accent/50 text-foreground'
                      : 'text-[hsl(var(--chat-inactive-item-text))] hover:bg-accent/20'
                  )}
                  data-active={chat.id === activeChatId ? 'true' : 'false'}
                  aria-current={chat.id === activeChatId ? 'true' : 'false'}
                >
                  {chat.id === activeChatId && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"
                      aria-hidden="true"
                    ></div>
                  )}
                  <p className="truncate text-sm flex-1" data-testid="chat-title">
                    {chat.title}
                  </p>
                  {onDeleteChatAction && (
                    <button
                      onClick={e => handleDeleteChat(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity rounded"
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
