'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { CHAT_CONFIG } from '../../config/chat';
import styles from './AiChatbox.module.css';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  isOpen: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  isOpen,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động focus vào ô nhập tin nhắn khi mở hộp thoại chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= CHAT_CONFIG.maxMessageLength) {
      setText(val);
    }
  };

  const isSendDisabled = isLoading || !text.trim();

  return (
    <form className={styles.inputContainer} onSubmit={handleSubmit}>
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi về sản phẩm, giá, tồn kho, đơn hàng..."
          className={styles.chatTextarea}
          rows={1}
          disabled={isLoading}
          aria-label="Nội dung tin nhắn tư vấn"
        />
        <button
          type="submit"
          disabled={isSendDisabled}
          className={styles.sendBtn}
          title="Gửi tin nhắn (Enter)"
          aria-label="Gửi tin nhắn"
        >
          <Send size={16} />
        </button>
      </div>

      <div className={styles.inputFooter}>
        <span>Nhấn Enter để gửi, Shift+Enter xuống dòng</span>
        <span>
          {text.length}/{CHAT_CONFIG.maxMessageLength}
        </span>
      </div>
    </form>
  );
};
