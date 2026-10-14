'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, LogIn } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { ChatProductCardItem } from './ChatProductCardItem';
import styles from './AiChatbox.module.css';

interface ChatMessageItemProps {
  message: ChatMessage;
  userLoggedIn: boolean;
  currentPath: string;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  userLoggedIn,
  currentPath,
}) => {
  const isUser = message.role === 'user';

  // Kiểm tra điều kiện cần đăng nhập tra cứu đơn hàng
  const contentLower = (message.content || '').toLowerCase();
  const needsLogin =
    !isUser &&
    !userLoggedIn &&
    (contentLower.includes('đăng nhập') ||
      contentLower.includes('chưa đăng nhập') ||
      contentLower.includes('tra cứu đơn hàng'));

  return (
    <div
      className={`${styles.messageRow} ${
        isUser ? styles.messageRowUser : styles.messageRowAssistant
      }`}
    >
      <div
        className={`${styles.messageBubble} ${
          isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant
        }`}
      >
        {/* Render text thuần túy để chống XSS và Injection, TUYỆT ĐỐI không dùng dangerouslySetInnerHTML */}
        {message.content}
      </div>

      {/* Hiển thị thông báo khi AI chạy ở chế độ gợi ý cơ bản / fallback */}
      {!isUser && message.fallback && (
        <div className={styles.fallbackNotice}>
          <AlertCircle size={12} />
          <span>Trợ lý AI đang bận, đây là gợi ý cơ bản</span>
        </div>
      )}

      {/* Nút đăng nhập nhanh nếu bot thông báo cần đăng nhập xem đơn hàng */}
      {needsLogin && (
        <div className={styles.loginPromptBox}>
          <span className={styles.loginPromptText}>
            Bạn cần đăng nhập tài khoản để xem trạng thái đơn hàng.
          </span>
          <Link
            href={`/login?from=${encodeURIComponent(currentPath)}`}
            className={styles.loginPromptBtn}
          >
            <LogIn size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Đăng nhập
          </Link>
        </div>
      )}

      {/* Danh sách thẻ sản phẩm trả về từ kết quả tool */}
      {!isUser && message.products && message.products.length > 0 && (
        <div className={styles.productCardsGrid}>
          {message.products.map((p) => (
            <ChatProductCardItem key={`${p.id}-${p.slug}`} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
