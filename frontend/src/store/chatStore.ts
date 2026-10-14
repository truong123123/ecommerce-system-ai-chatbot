import { create } from 'zustand';
import { ChatMessage } from '../types/chat';
import { CHAT_CONFIG } from '../config/chat';
import { chatService } from '../services/chatService';

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  sessionId: string | null;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  resetSession: () => void;
  initSessionFromStorage: () => void;
}

export function createWelcomeMessage(): ChatMessage {
  return {
    id: 'welcome-msg',
    role: 'assistant',
    content: CHAT_CONFIG.welcomeMessage,
    createdAt: new Date().toISOString(),
  };
}

function loadFromStorage(): {
  sessionId: string | null;
  messages: ChatMessage[];
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CHAT_CONFIG.sessionStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
      return {
        sessionId:
          typeof parsed.sessionId === 'string' ? parsed.sessionId : null,
        messages: parsed.messages.slice(-CHAT_CONFIG.maxStoredMessages),
      };
    }
  } catch (e) {
    console.warn('Lỗi khi đọc sessionStorage của chat:', e);
  }
  return null;
}

function saveToStorage(sessionId: string | null, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    const data = {
      sessionId,
      messages: messages.slice(-CHAT_CONFIG.maxStoredMessages),
    };
    window.sessionStorage.setItem(
      CHAT_CONFIG.sessionStorageKey,
      JSON.stringify(data)
    );
  } catch (e) {
    console.warn('Lỗi khi lưu chat vào sessionStorage:', e);
  }
}

function clearStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(CHAT_CONFIG.sessionStorageKey);
  } catch (e) {
    console.warn('Lỗi khi xóa chat sessionStorage:', e);
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [createWelcomeMessage()],
  sessionId: null,
  isLoading: false,
  isHydrated: false,

  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  initSessionFromStorage: () => {
    if (get().isHydrated) return;
    const stored = loadFromStorage();
    if (stored) {
      set({
        sessionId: stored.sessionId,
        messages: stored.messages,
        isHydrated: true,
      });
    } else {
      set({ isHydrated: true });
    }
  },

  sendMessage: async (text: string) => {
    const { isLoading, messages, sessionId } = get();
    if (isLoading) return;

    const trimmed = (text || '').trim();
    if (!trimmed) return;

    const messageContent =
      trimmed.length > CHAT_CONFIG.maxMessageLength
        ? trimmed.substring(0, CHAT_CONFIG.maxMessageLength)
        : trimmed;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: messageContent,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];

    set({
      messages: nextMessages,
      isLoading: true,
    });
    saveToStorage(sessionId, nextMessages);

    try {
      const historyToSend = nextMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatService.sendChatMessage({
        sessionId,
        message: messageContent,
        history: historyToSend,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'assistant',
        content: res.reply,
        products: res.products || [],
        fallback: res.fallback || false,
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...nextMessages, assistantMessage];
      const newSessionId = res.sessionId || sessionId;

      set({
        sessionId: newSessionId,
        messages: finalMessages,
        isLoading: false,
      });
      saveToStorage(newSessionId, finalMessages);
    } catch {
      const fallbackMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          'Xin lỗi, hiện tại không thể kết nối tới máy chủ. Vui lòng thử lại sau ít phút.',
        fallback: true,
        createdAt: new Date().toISOString(),
      };
      const finalMessages = [...nextMessages, fallbackMessage];
      set({
        messages: finalMessages,
        isLoading: false,
      });
      saveToStorage(sessionId, finalMessages);
    }
  },

  resetSession: () => {
    clearStorage();
    const welcome = createWelcomeMessage();
    set({
      sessionId: null,
      messages: [welcome],
      isLoading: false,
    });
    saveToStorage(null, [welcome]);
  },
}));
