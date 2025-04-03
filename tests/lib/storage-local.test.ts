import { LocalStorageService } from "../../lib/storage-local";
import { ChatSession } from "../../types/chat";

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
  });
});

beforeEach(() => {
  (localStorage.getItem as jest.Mock).mockClear();
  (localStorage.setItem as jest.Mock).mockClear();
  (localStorage.removeItem as jest.Mock).mockClear();
  localStorage.clear();
});

describe("LocalStorageService", () => {
  const testSession: ChatSession = {
    id: "test-id",
    title: "Test Session",
    messages: [],
    createdAt: Date.now(),
  };

  describe("without userId", () => {
    const service = new LocalStorageService();

    it("should save and get chat sessions", async () => {
      await service.saveChatSessions([testSession]);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "chatSessions",
        JSON.stringify([testSession])
      );

      const sessions = await service.getChatSessions();
      expect(sessions).toEqual([testSession]);
    });

    it("should handle empty chat sessions", async () => {
      const sessions = await service.getChatSessions();
      expect(sessions).toEqual([]);
    });

    it("should save and get active chat ID", async () => {
      await service.saveActiveChatId("test-id");
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "activeChatId",
        "test-id"
      );

      const activeId = await service.getActiveChatId();
      expect(activeId).toBe("test-id");
    });

    it("should return empty string for missing active chat ID", async () => {
      const activeId = await service.getActiveChatId();
      expect(activeId).toBe("");
    });

    it("should clear storage", async () => {
      await service.saveChatSessions([testSession]);
      await service.saveActiveChatId("test-id");
      await service.clear();

      expect(localStorage.removeItem).toHaveBeenCalledWith("chatSessions");
      expect(localStorage.removeItem).toHaveBeenCalledWith("activeChatId");
    });
  });

  describe("with userId", () => {
    const service = new LocalStorageService({ userId: "user-123" });

    it("should use userId in storage keys", async () => {
      await service.saveChatSessions([testSession]);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user-123_chatSessions",
        JSON.stringify([testSession])
      );

      await service.getChatSessions();
      expect(localStorage.getItem).toHaveBeenCalledWith(
        "user-123_chatSessions"
      );
    });

    it("should handle first active chat ID", async () => {
      await service.saveChatSessions([testSession]);
      const activeId = await service.getActiveChatId();

      expect(activeId).toBe(testSession.id);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user-123_activeChatId",
        testSession.id
      );
    });
  });
});
