"use client";

import { useState, useEffect } from "react";
import type { Message } from "@/types/chat";

interface ChatHistoryProps {
  chatSessions: {
    id: string;
    title: string;
    messages: Message[];
  }[];
  activeChatId: string;
  onNewChatAction: () => void;
  onSelectChatAction: (id: string) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (isOpen: boolean) => void;
}

export function ChatHistory({
  chatSessions,
  activeChatId,
  onNewChatAction,
  onSelectChatAction,
  isMobileOpen: externalMobileOpen,
  setIsMobileOpen: externalSetMobileOpen,
}: ChatHistoryProps) {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileDevice(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const isMobileOpen =
    externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen;
  const setIsMobileOpen = externalSetMobileOpen || setInternalMobileOpen;

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

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed z-30 top-3 left-3 p-2 bg-white dark:bg-neutral-800 rounded-md shadow-md"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? "✕" : "☰"}
      </button>

      {/* Chat history sidebar */}
      <aside
        className={`
          w-full h-full flex flex-col
          bg-white dark:bg-neutral-800
          border-r border-neutral-200 dark:border-neutral-700
          ${isMobileDevice && !isMobileOpen ? "hidden md:flex" : "flex"}
        `}
      >
        <div className="w-full p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full py-3 md:py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm md:text-base"
          >
            New Chat
          </button>
        </div>
        <div className="flex-1 w-full overflow-y-auto overscroll-contain">
          {chatSessions.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                chat.id === activeChatId
                  ? "bg-neutral-100 dark:bg-neutral-700 border-l-4 border-blue-500"
                  : ""
              }`}
            >
              <p className="truncate text-sm md:text-base">{chat.title}</p>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
