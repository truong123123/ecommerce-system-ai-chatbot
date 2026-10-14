'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types/chat';
import { CHAT_CONFIG } from '../../config/chat';
import { ChatMessageItem } from './ChatMessageItem';
import styles from './AiChatbox.module.css';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectSuggestion: (text: string) => void;
  userLoggedIn: boolean;
  currentPath: string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  onSelectSuggestion,
  userLoggedIn,
  currentPath,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống dưới cùng khi có tin nhắn mới hoặc trạng thái loading thay đổi
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const showSuggestions = messages.length <= 1;

  return (
    <>
      <div className={styles.messageList}>
        {messages.map((m) => (
          <ChatMessageItem
            key={m.id}
            message={m}
            userLoggedIn={userLoggedIn}
            currentPath={currentPath}
          />
        ))}

        {/* Hiệu ứng đang trả lời... */}
        {isLoading && (
          <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
            <div className={styles.typingIndicator} aria-label="Trợ lý đang soạn câu trả lời">
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Gợi ý câu hỏi nhanh ở lần mở đầu */}
      {showSuggestions && (
        <div className={styles.quickSuggestionsContainer}>
          <div className={styles.quickSuggestionsTitle}>Gợi ý nhanh</div>
          <div className={styles.quickSuggestionsRow}>
            {CHAT_CONFIG.quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className={styles.suggestionChip}
                onClick={() => onSelectSuggestion(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
