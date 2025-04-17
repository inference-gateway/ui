'use client';

import { Menu, PlusSquare, ChevronLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import ModelSelector from '@/components/model-selector';
import { ChatHistory } from '@/components/chat-history';
import { ChatArea } from '@/components/chat-area';
import { InputArea } from '@/components/input-area';
import { useChat } from '@/hooks/use-chat';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/theme-toggle';

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
        <header className="border-b border-[hsl(var(--chat-sidebar-border))] bg-[hsl(var(--chat-background))] py-4 px-3.5 relative h-14">
          {/* Left - Chat history button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={cn(
              'absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center',
              'w-7 h-7 rounded-md hover:bg-accent',
              'text-muted-foreground hover:text-foreground transition-colors'
            )}
            aria-label="Toggle chat history"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Model selector */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="px-2 py-1 rounded-md border border-[hsla(var(--model-selector-border)_/_0.5)] hover:bg-[hsla(var(--model-selector-bg)_/_0.8)] transition-colors">
              <ModelSelector selectedModel={selectedModel} onSelectModelAction={setSelectedModel} />
            </div>
          </div>

          {/* New chat button */}
          <button
            onClick={handleNewChat}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="New chat"
          >
            <PlusSquare className="h-5 w-5" />
          </button>

          {/* Theme toggle button */}
          <div className="absolute right-14 top-1/2 -translate-y-1/2">
            <ThemeToggle />
          </div>
        </header>

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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
