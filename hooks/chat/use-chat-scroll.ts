'use client';

import { RefObject, useCallback, useEffect } from 'react';

/**
 * Hook for managing chat container scrolling behavior
 */
export function useChatScroll(
  chatContainerRef: RefObject<HTMLDivElement | null>,
  messages: unknown[],
  isStreaming: boolean
) {
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatContainerRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  useEffect(() => {
    let scrollInterval: NodeJS.Timeout | null = null;
    if (isStreaming) {
      scrollInterval = setInterval(scrollToBottom, 100);
    }
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [isStreaming, scrollToBottom]);

  return { scrollToBottom };
}
