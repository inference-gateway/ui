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

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        handleSendMessage(inputValue);
        setInputValue('');
      }
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-[#131314] dark:bg-[#131314]">
      {/* Chat History Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 h-full transition-all duration-300 ease-in-out',
          'bg-[#0d0d0e] dark:bg-[#0d0d0e] border-r border-[#2a2a2d] dark:border-[#2a2a2d]',
          'w-[320px]',
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar toggle button */}
        <button
          onClick={() => setShowSidebar(false)}
          className={cn(
            'absolute right-0 top-2 translate-x-1/2 z-50 flex items-center justify-center',
            'bg-[#131314] border border-[#2a2a2d] rounded-full w-6 h-6',
            'text-gray-300 hover:text-white transition-opacity',
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
          'flex-1 flex flex-col h-full overflow-hidden',
          'transition-all duration-300 ease-in-out',
          showSidebar && !isMobile ? 'ml-[320px]' : 'ml-0'
        )}
      >
        {/* Header */}
        <header className="border-b border-[#2a2a2d] dark:border-[#2a2a2d] bg-[#131314] dark:bg-[#131314] py-4 px-3.5 relative h-14">
          {/* Left - Chat history button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={cn(
              'absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center',
              'w-7 h-7 rounded-md hover:bg-gray-700/30',
              'text-gray-300 hover:text-white transition-colors'
            )}
            aria-label="Toggle chat history"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Model selector */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <ModelSelector selectedModel={selectedModel} onSelectModelAction={setSelectedModel} />
          </div>

          {/* New chat button */}
          <button
            onClick={handleNewChat}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
            aria-label="New chat"
          >
            <PlusSquare className="h-5 w-5" />
          </button>
        </header>

        {/* Chat Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto bg-[#131314] dark:bg-[#131314]"
          onClick={() => isMobile && setShowSidebar(false)}
        >
          <ChatArea messages={messages} isStreaming={isStreaming} />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 w-full bg-[#131314] dark:bg-[#131314] border-t border-[#2a2a2d] dark:border-[#2a2a2d]">
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
  );
}
