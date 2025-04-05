"use client";

import logger from "@/lib/logger";
import { useState, useEffect } from "react";
import type { Message } from "@/types/chat";
import { Trash2, X, Menu } from "lucide-react";

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
    logger.debug("Selected chat session", { id });
    onSelectChatAction(id);
    if (isMobileDevice) {
      setIsMobileOpen(false);
    }
  };

  const handleNewChat = () => {
    logger.debug("Creating new chat session");
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
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
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
        <div
          className="flex-1 w-full overflow-y-auto overscroll-contain"
          data-testid="chat-history-container"
          style={{ overflowY: "auto" }}
        >
          {chatSessions.length === 0 ? (
            <div
              className="p-4 text-center text-neutral-500"
              data-testid="empty-state"
            >
              <p data-testid="empty-message">No chats yet</p>
            </div>
          ) : (
            [...chatSessions]
              .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
              })
              .map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectChat(chat.id);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      const next = e.currentTarget
                        .nextElementSibling as HTMLElement;
                      next?.focus();
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      const prev = e.currentTarget
                        .previousElementSibling as HTMLElement;
                      prev?.focus();
                    }
                  }}
                  tabIndex={0}
                  ref={null}
                  data-testid={`chat-item-${chat.id}`}
                  data-focusable="true"
                  data-focused={chat.id === activeChatId ? "true" : "false"}
                  className={`p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    chat.id === activeChatId
                      ? "bg-neutral-100 dark:bg-neutral-700 border-l-4 border-blue-500 active"
                      : ""
                  }`}
                  data-active={chat.id === activeChatId ? "true" : "false"}
                  aria-current={chat.id === activeChatId ? "true" : "false"}
                  data-test-active={chat.id === activeChatId ? "true" : "false"}
                  data-test-class-active={
                    chat.id === activeChatId ? "true" : "false"
                  }
                >
                  <div className="flex items-center justify-between w-full group">
                    <div className="flex flex-col">
                      <p
                        className="truncate text-sm md:text-base"
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          display: "block",
                          maxWidth: "100%",
                        }}
                        data-testid="chat-title"
                        data-text-overflow="ellipsis"
                        data-long-title={
                          chat.title.length > 20 ? "true" : "false"
                        }
                      >
                        {chat.title}
                      </p>
                      {chat.messages?.length > 0 && (
                        <p
                          className="text-xs text-neutral-500 dark:text-neutral-400"
                          data-testid={`chat-model-${chat.id}`}
                        >
                          {(() => {
                            if (!chat.messages) return null;

                            const lastAssistantMsg = [...chat.messages]
                              .reverse()
                              .find((m) => m.role === "assistant" && m.model);

                            if (!lastAssistantMsg?.model) return null;

                            const model = lastAssistantMsg.model
                              .split("/")
                              .pop();

                            return model === "gpt-4o"
                              ? "gpt-4o"
                              : model === "claude-3-opus"
                              ? "claude-3-opus"
                              : model;
                          })()}
                        </p>
                      )}
                      {!chat.messages?.length && (
                        <p
                          className="text-xs text-neutral-400 dark:text-neutral-500"
                          data-testid="no-model-info"
                        >
                          No messages yet
                        </p>
                      )}
                    </div>
                    {onDeleteChatAction && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              "Are you sure you want to delete this chat?"
                            )
                          ) {
                            logger.debug("Deleting chat session", {
                              id: chat.id,
                            });
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
              ))
          )}
        </div>
      </aside>
    </>
  );
}
