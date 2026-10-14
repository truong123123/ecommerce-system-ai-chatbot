'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, Bot, RotateCcw, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { CHAT_CONFIG } from '../../config/chat';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import styles from './AiChatbox.module.css';

export const AiChatbox: React.FC = () => {
  const pathname = usePathname() || '/';
  const {
    isOpen,
    messages,
    isLoading,
    toggleChat,
    closeChat,
    sendMessage,
    resetSession,
    initSessionFromStorage,
  } = useChatStore();

  const user = useAuthStore((state) => state.user);

  // Nạp lại phiên hội thoại từ sessionStorage sau khi component mount trên client
  useEffect(() => {
    initSessionFromStorage();
  }, [initSessionFromStorage]);

  // Đóng hộp thoại khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeChat]);

  return (
    <>
      {/* Nút nổi mở/đóng chatbot ở góc màn hình */}
      <button
        type="button"
        className={styles.floatingBtn}
        onClick={toggleChat}
        aria-label="Mở trợ lý ảo tư vấn"
        aria-expanded={isOpen}
        title="Trợ lý tư vấn mua sắm"
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
        {!isOpen && <span className={styles.unreadBadge} aria-hidden="true" />}
      </button>

      {/* Hộp thoại chat AI */}
      {isOpen && (
        <div
          className={styles.chatWindow}
          role="dialog"
          aria-modal="true"
          aria-label="Hộp thoại trợ lý AI"
        >
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.assistantAvatar}>
                <Bot size={20} />
              </div>
              <div className={styles.assistantDetails}>
                <span className={styles.assistantName}>
                  {CHAT_CONFIG.assistantName}
                </span>
                <span className={styles.assistantStatus}>
                  <span className={styles.statusDot} />
                  Trực tuyến • Hỗ trợ AI
                </span>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.headerIconBtn}
                onClick={resetSession}
                title="Làm mới hội thoại"
                aria-label="Làm mới cuộc trò chuyện"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                className={styles.headerIconBtn}
                onClick={closeChat}
                title="Đóng hộp thoại (Esc)"
                aria-label="Đóng trợ lý"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Danh sách tin nhắn & Gợi ý nhanh */}
          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            onSelectSuggestion={sendMessage}
            userLoggedIn={Boolean(user)}
            currentPath={pathname}
          />

          {/* Ô nhập tin nhắn */}
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            isOpen={isOpen}
          />
        </div>
      )}
    </>
  );
};
