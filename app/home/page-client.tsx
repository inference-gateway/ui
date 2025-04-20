'use client';

import { ChevronLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChatHistory } from '@/components/chat-history';
import { ChatArea } from '@/components/chat-area';
import { InputArea } from '@/components/input-area';
import { useChat } from '@/hooks/use-chat';
import { useState, useEffect } from 'react';
import { ChatHeader } from '@/components/chat-header';

export const dynamic = 'force-dynamic';

export default function PageClient() {
  const {
    chatSessions,
    activeChatId,
    messages,
    selectedModel,
    isLoading,
    isStreaming,
    tokenUsage,
    error,
    clearError,
    setSelectedModel,
    handleNewChat,
    handleSendMessage,
    handleSelectChat,
    handleDeleteChat,
    chatContainerRef,
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [hasMessages, setHasMessages] = useState(messages.length > 0);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isDeepResearchActive, setIsDeepResearchActive] = useState(false);

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    setHasMessages(messages.length > 0);
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        handleSendMessage(inputValue);
        setInputValue('');
      }
    }
  };

  const handleSearchAction = () => {
    setIsSearchActive(prev => !prev);
    setIsDeepResearchActive(false);
  };

  const handleDeepResearchAction = () => {
    setIsDeepResearchActive(prev => !prev);
    setIsSearchActive(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Chat History Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 h-full transition-all duration-300 ease-in-out',
          'bg-[hsl(var(--chat-sidebar-background))] border-r border-[hsl(var(--chat-sidebar-border))]',
          'w-[320px]',
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar toggle button */}
        <button
          onClick={() => setShowSidebar(false)}
          className={cn(
            'absolute right-0 top-2 translate-x-1/2 z-50 flex items-center justify-center',
            'bg-[hsl(var(--chat-background))] border border-[hsl(var(--chat-sidebar-border))] rounded-full w-6 h-6',
            'text-muted-foreground hover:text-foreground transition-opacity',
            !showSidebar && 'opacity-0 pointer-events-none'
          )}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

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

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 flex flex-col h-full overflow-hidden relative',
          'transition-all duration-300 ease-in-out',
          showSidebar && !isMobile ? 'ml-[320px]' : 'ml-0'
        )}
      >
        {/* Header */}
        <ChatHeader
          isMobile={isMobile}
          showSidebar={showSidebar}
          selectedModel={selectedModel}
          setShowSidebar={setShowSidebar}
          handleNewChat={handleNewChat}
          setSelectedModel={setSelectedModel}
        />

        {/* Chat Area */}
        <div
          ref={chatContainerRef}
          className={cn(
            'flex-1 overflow-y-auto bg-[hsl(var(--chat-background))]',
            !hasMessages && 'flex flex-col justify-center'
          )}
          onClick={() => isMobile && setShowSidebar(false)}
        >
          <ChatArea messages={messages} isStreaming={isStreaming} />
        </div>

        {/* Input Area */}
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
              inputValue={inputValue}
              isLoading={isLoading}
              selectedModel={selectedModel}
              tokenUsage={tokenUsage}
              onInputChangeAction={setInputValue}
              onKeyDownAction={handleKeyDown}
              onSendMessageAction={() => {
                if (inputValue.trim()) {
                  handleSendMessage(inputValue);
                  setInputValue('');
                }
              }}
              isSearchActive={isSearchActive}
              isDeepResearchActive={isDeepResearchActive}
              onSearchAction={handleSearchAction}
              onDeepResearchAction={handleDeepResearchAction}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
