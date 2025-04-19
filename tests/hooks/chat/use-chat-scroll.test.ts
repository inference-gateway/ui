import { useChatScroll } from '@/hooks/chat/use-chat-scroll';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

describe('useChatScroll Hook', () => {
  let mockRef: {
    current: {
      scrollTop: number;
      scrollHeight: number;
    } | null;
  };

  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;

  beforeEach(() => {
    mockRef = {
      current: {
        scrollTop: 0,
        scrollHeight: 1000,
      },
    };

    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
    jest.useRealTimers();
  });

  test('scrolls to bottom when messages change', () => {
    const messages = [{ id: '1', content: 'test' }];

    renderHook(() => useChatScroll(mockRef as RefObject<HTMLDivElement | null>, messages, false));

    expect(mockRef.current?.scrollTop).toBe(mockRef.current?.scrollHeight);
  });

  test('scrolls to bottom when isStreaming becomes true', () => {
    const messages = [{ id: '1', content: 'test' }];

    const { rerender } = renderHook(
      ({ msgs, streaming }) =>
        useChatScroll(mockRef as RefObject<HTMLDivElement | null>, msgs, streaming),
      { initialProps: { msgs: messages, streaming: false } }
    );

    if (mockRef.current) {
      mockRef.current.scrollTop = 0;
    }

    rerender({ msgs: messages, streaming: true });

    expect(mockRef.current?.scrollTop).toBe(mockRef.current?.scrollHeight);

    act(() => {
      if (mockRef.current) {
        mockRef.current.scrollTop = 0;
      }

      jest.advanceTimersByTime(100);

      expect(mockRef.current?.scrollTop).toBe(mockRef.current?.scrollHeight);
    });
  });

  test('starts interval when streaming and clears interval when not streaming', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const messages = [{ id: '1', content: 'test' }];

    const { rerender } = renderHook(
      ({ streaming }) =>
        useChatScroll(mockRef as RefObject<HTMLDivElement | null>, messages, streaming),
      { initialProps: { streaming: true } }
    );

    expect(setIntervalSpy).toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenLastCalledWith(expect.any(Function), 100);

    rerender({ streaming: false });

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  test('returns scrollToBottom function that works when called', () => {
    const messages = [{ id: '1', content: 'test' }];

    const { result } = renderHook(() =>
      useChatScroll(mockRef as RefObject<HTMLDivElement | null>, messages, false)
    );

    if (mockRef.current) {
      mockRef.current.scrollTop = 0;
    }

    act(() => {
      result.current.scrollToBottom();
    });

    expect(mockRef.current?.scrollTop).toBe(mockRef.current?.scrollHeight);
  });

  test('does nothing if ref is null', () => {
    const messages = [{ id: '1', content: 'test' }];
    mockRef.current = null;

    const { result } = renderHook(() =>
      useChatScroll(mockRef as RefObject<HTMLDivElement | null>, messages, false)
    );

    act(() => {
      result.current.scrollToBottom();
    });
  });
});
