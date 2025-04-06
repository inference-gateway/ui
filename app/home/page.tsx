"use client";

import { Moon, Sun, Menu, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import ModelSelector from "@/components/model-selector";
import { ChatHistory } from "@/components/chat-history";
import { ChatArea } from "@/components/chat-area";
import { InputArea } from "@/components/input-area";
import { useChat } from "@/hooks/use-chat";
import { useState, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { signOut } from "next-auth/react";

export default function Home() {
  const { session } = useSession();

  console.debug("Session data", session);

  const {
    chatSessions,
    activeChatId,
    messages,
    selectedModel,
    isLoading,
    isStreaming,
    tokenUsage,
    setSelectedModel,
    handleNewChat,
    handleSendMessage,
    handleSelectChat,
    handleDeleteChat,
    clearMessages,
    chatContainerRef,
  } = useChat();

  const [inputValue, setInputValue] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        handleSendMessage(inputValue);
        setInputValue("");
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="h-screen bg-neutral-50 dark:bg-neutral-900 flex overflow-hidden">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="fixed top-4 left-4 z-50 h-10 w-10 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 flex items-center justify-center"
        >
          <Menu className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
        </button>
      )}

      {/* Chat History Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out h-full bg-white dark:bg-neutral-800",
          isMobile ? "fixed inset-y-0 z-40 w-64" : "w-64",
          showSidebar ? "translate-x-0" : "-translate-x-full"
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
        />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-transform duration-300",
          isMobile && showSidebar ? "translate-x-64" : ""
        )}
      >
        {/* Header */}
        <header className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-neutral-800 dark:text-white">
                Inference Gateway UI
              </h1>
              {session?.user?.name && (
                <span className="text-neutral-600 dark:text-neutral-300">
                  | {session.user.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Model Selector */}
              <ModelSelector
                selectedModel={selectedModel}
                onSelectModelAction={setSelectedModel}
              />

              {/* Sign Out Button */}
              {session && (
                <button
                  onClick={() => signOut()}
                  className="h-10 w-10 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 flex items-center justify-center"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="h-10 w-10 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 flex items-center justify-center"
                title="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                ) : (
                  <Moon className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
          onClick={() => isMobile && setShowSidebar(false)}
        >
          <ChatArea messages={messages} isStreaming={isStreaming} />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 w-full bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
          <InputArea
            inputValue={inputValue}
            isLoading={isLoading}
            selectedModel={selectedModel}
            tokenUsage={tokenUsage}
            messages={messages}
            onInputChange={setInputValue}
            onKeyDown={handleKeyDown}
            onSendMessage={() => handleSendMessage(inputValue)}
            onClearMessages={clearMessages}
          />
        </div>
      </div>
    </div>
  );
}
