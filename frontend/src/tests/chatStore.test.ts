import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChatStore } from '../store/chatStore';
import { chatService } from '../services/chatService';
import { CHAT_CONFIG } from '../config/chat';

class MockStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

describe('chatStore Unit Tests', () => {
  let mockSessionStorage: MockStorage;
  let mockLocalStorage: MockStorage;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockSessionStorage = new MockStorage();
    mockLocalStorage = new MockStorage();

    // Setup global window and storages in Node test environment
    const globalAny = global as unknown as {
      window: unknown;
      sessionStorage: Storage;
      localStorage: Storage;
    };

    globalAny.sessionStorage = mockSessionStorage;
    globalAny.localStorage = mockLocalStorage;
    globalAny.window = {
      sessionStorage: mockSessionStorage,
      localStorage: mockLocalStorage,
    };

    useChatStore.getState().resetSession();
  });

  it('khởi tạo với tin nhắn chào mừng và trạng thái đóng', () => {
    const state = useChatStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].role).toBe('assistant');
    expect(state.messages[0].content).toBe(CHAT_CONFIG.welcomeMessage);
  });

  it('toggleChat, openChat, closeChat thay đổi đúng trạng thái isOpen', () => {
    const store = useChatStore.getState();

    store.openChat();
    expect(useChatStore.getState().isOpen).toBe(true);

    store.closeChat();
    expect(useChatStore.getState().isOpen).toBe(false);

    store.toggleChat();
    expect(useChatStore.getState().isOpen).toBe(true);

    store.toggleChat();
    expect(useChatStore.getState().isOpen).toBe(false);
  });

  it('chặn gửi tin nhắn khi chuỗi rỗng hoặc chỉ có khoảng trắng', async () => {
    const sendSpy = vi.spyOn(chatService, 'sendChatMessage');
    const store = useChatStore.getState();

    await store.sendMessage('');
    await store.sendMessage('    ');

    expect(sendSpy).not.toHaveBeenCalled();
    expect(useChatStore.getState().messages).toHaveLength(1);
  });

  it('chặn gửi tin nhắn mới khi đang trong trạng thái isLoading', async () => {
    const sendSpy = vi
      .spyOn(chatService, 'sendChatMessage')
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  sessionId: 's-1',
                  reply: 'Phản hồi',
                  products: [],
                  fallback: false,
                }),
              50
            )
          )
      );

    const store = useChatStore.getState();
    const p1 = store.sendMessage('Tin nhắn 1');
    const p2 = store.sendMessage('Tin nhắn 2 cố gửi khi đang load');

    await Promise.all([p1, p2]);

    expect(sendSpy).toHaveBeenCalledTimes(1);
  });

  it('giới hạn độ dài tin nhắn tối đa 500 ký tự khi gửi', async () => {
    const sendSpy = vi.spyOn(chatService, 'sendChatMessage').mockResolvedValueOnce({
      sessionId: 'session-1',
      reply: 'Đã nhận',
      products: [],
      fallback: false,
    });

    const store = useChatStore.getState();
    const longMsg = 'a'.repeat(600);
    await store.sendMessage(longMsg);

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'a'.repeat(500),
      })
    );

    const messages = useChatStore.getState().messages;
    const userMsg = messages.find((m) => m.role === 'user');
    expect(userMsg?.content).toHaveLength(500);
  });

  it('lưu vào sessionStorage (KHÔNG dùng localStorage) và nạp lại an toàn', () => {
    const store = useChatStore.getState();
    store.resetSession();

    // Kiểm tra localStorage không hề bị ghi
    expect(mockLocalStorage.getItem(CHAT_CONFIG.sessionStorageKey)).toBeNull();

    // Giả lập lưu dữ liệu phiên trước vào sessionStorage
    const savedData = {
      sessionId: 'test-session-999',
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: 'Xin chào',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    mockSessionStorage.setItem(
      CHAT_CONFIG.sessionStorageKey,
      JSON.stringify(savedData)
    );

    // Kích hoạt hydrate
    useChatStore.setState({ isHydrated: false });
    useChatStore.getState().initSessionFromStorage();

    const state = useChatStore.getState();
    expect(state.sessionId).toBe('test-session-999');
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].content).toBe('Xin chào');
  });

  it('resetSession xóa sạch hội thoại và trả về tin chào mừng mới', () => {
    const store = useChatStore.getState();
    useChatStore.setState({
      sessionId: 'old-session',
      messages: [
        {
          id: 'u-1',
          role: 'user',
          content: 'Tôi muốn mua máy tính',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    store.resetSession();

    const state = useChatStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].role).toBe('assistant');
    expect(state.messages[0].content).toBe(CHAT_CONFIG.welcomeMessage);
  });
});
