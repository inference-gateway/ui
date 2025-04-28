'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChatHistory } from '@/components/chat-history';
import { ChatArea } from '@/components/chat-area';
import { InputArea } from '@/components/input-area';
import { useChat } from '@/hooks/use-chat';
import { useState, useEffect } from 'react';
import { ChatHeader } from '@/components/chat-header';
import { ChevronLeft, Menu } from 'lucide-react';
import { Session } from 'next-auth';

export const dynamic = 'force-dynamic';

export interface PageClientProps {
  session?: Session | null;
}

export default function PageClient({ session }: PageClientProps) {
  const {
    chatSessions,
    activeChatId,
    messages,
    selectedModel,
    isLoading,
    isStreaming,
    isWebSearchEnabled,
    tokenUsage,
    error,
    clearError,
    setSelectedModel,
    handleNewChat,
    handleSendMessage,
    handleSelectChat,
    handleDeleteChat,
    chatContainerRef,
    toggleWebSearch,
  } = useChat();

  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [hasMessages, setHasMessages] = useState(messages.length > 0);
  const [isDeepResearchActive, setIsDeepResearchActive] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState<string>('');

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    setHasMessages(messages.length > 0);
  }, [messages]);

  useEffect(() => {
    if (editingMessageId && editMessageContent) {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        const inputArea = textarea as HTMLTextAreaElement & {
          setInputValue?: (value: string) => void;
        };
        if (inputArea.setInputValue) {
          inputArea.setInputValue(editMessageContent);
        } else {
          textarea.value = editMessageContent;
          const event = new Event('input', { bubbles: true });
          textarea.dispatchEvent(event);
        }
        textarea.focus();
      }
    }
  }, [editingMessageId, editMessageContent]);

  const handleSearchAction = () => {
    toggleWebSearch();
    setIsDeepResearchActive(false);
  };

  const handleDeepResearchAction = () => {
    setIsDeepResearchActive(prev => !prev);
    if (!isDeepResearchActive && isWebSearchEnabled) {
      toggleWebSearch();
    }
  };

  const handleEditLastUserMessage = () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');

    if (lastUserMessage) {
      setEditingMessageId(lastUserMessage.id);
      setEditMessageContent(lastUserMessage.content || '');
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={cn(
          'fixed top-3.5 left-3.5 z-50 flex items-center justify-center',
          'w-8 h-8 rounded-md bg-background shadow-sm border border-input',
          'text-muted-foreground hover:text-foreground transition-colors',
          'focus:outline-none focus:ring-1 focus:ring-primary'
        )}
        aria-label="Toggle sidebar"
        title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
      >
        {showSidebar ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 h-full transition-all duration-300 ease-in-out',
          'bg-[hsl(var(--chat-sidebar-background))] border-r border-[hsl(var(--chat-sidebar-border))]',
          showSidebar ? 'w-[260px]' : 'w-0',
          showSidebar ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-0 pointer-events-none'
        )}
      >
        <ChatHistory
          chatSessions={chatSessions}
          activeChatId={activeChatId}
          onNewChatAction={handleNewChat}
          onSelectChatAction={handleSelectChat}
          onDeleteChatAction={handleDeleteChat}
          isMobileOpen={showSidebar}
          setIsMobileOpen={setShowSidebar}
          error={error?.toString()}
          onErrorDismiss={clearError}
        />
      </div>

      <div
        className={cn(
          'flex-1 flex flex-col h-full overflow-hidden relative',
          'transition-all duration-300 ease-in-out',
          showSidebar && !isMobile ? 'ml-[260px]' : 'ml-0'
        )}
      >
        <ChatHeader
          session={session}
          isMobile={isMobile}
          showSidebar={showSidebar}
          selectedModel={selectedModel}
          setShowSidebar={setShowSidebar}
          handleNewChat={handleNewChat}
          setSelectedModel={setSelectedModel}
        />

        <div
          ref={chatContainerRef}
          className={cn(
            'flex-1 overflow-y-auto bg-[hsl(var(--chat-background))]',
            !hasMessages && 'flex flex-col justify-center'
          )}
          onClick={() => isMobile && setShowSidebar(false)}
        >
          <ChatArea
            messages={messages}
            isStreaming={isStreaming}
            selectedModel={selectedModel}
            onEditMessage={messageId => {
              const messageToEdit = messages.find(msg => msg.id === messageId);
              if (messageToEdit && messageToEdit.content) {
                setEditingMessageId(messageId);
                setEditMessageContent(messageToEdit.content);
              }
            }}
          />
        </div>

        <div
          className={cn(
            'w-full bg-[hsl(var(--chat-background))] transition-all duration-500 ease-in-out px-4',
            hasMessages
              ? 'sticky bottom-0 border-t border-[hsl(var(--chat-sidebar-border))]'
              : 'absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 max-w-[800px]'
          )}
        >
          <div className={cn('mx-auto', hasMessages ? 'max-w-[800px]' : '')}>
            <InputArea
              isLoading={isLoading}
              selectedModel={selectedModel}
              tokenUsage={tokenUsage}
              onSendMessageAction={content => {
                if (editingMessageId) {
                  handleSendMessage(content, editingMessageId);
                  setEditingMessageId(null);
                  setEditMessageContent('');
                } else {
                  handleSendMessage(content);
                }
              }}
              isSearchActive={isWebSearchEnabled}
              isDeepResearchActive={isDeepResearchActive}
              onSearchAction={handleSearchAction}
              onDeepResearchAction={handleDeepResearchAction}
              editingMessageId={editingMessageId}
              onCancelEdit={() => {
                setEditingMessageId(null);
                setEditMessageContent('');
              }}
              onEditLastUserMessage={handleEditLastUserMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
