"use client";

import { useState, useEffect } from "react";
import type { Message } from "@/types/chat";
import { Trash2 } from "lucide-react";

interface ChatHistoryProps {
  chatSessions: {
    id: string;
    title: string;
    messages: Message[];
  }[];
  activeChatId: string;
  onNewChatAction: () => void;
  onSelectChatAction: (id: string) => void;
  onDeleteChatAction?: (id: string) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (isOpen: boolean) => void;
}

export function ChatHistory({
  chatSessions,
  activeChatId,
  onNewChatAction,
  onSelectChatAction,
  onDeleteChatAction,
  isMobileOpen: externalMobileOpen,
  setIsMobileOpen: externalSetMobileOpen,
}: ChatHistoryProps) {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileDevice(window.innerWidth < 768);
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
              <div className="flex items-center justify-between w-full group">
                <p className="truncate text-sm md:text-base">{chat.title}</p>
                {onDeleteChatAction && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm("Are you sure you want to delete this chat?")
                      ) {
                        onDeleteChatAction(chat.id);
                      }
                    }}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-1 -mr-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
