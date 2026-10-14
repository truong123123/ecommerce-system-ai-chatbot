import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChatMessageItem } from '../components/chat/ChatMessageItem';
import { ChatMessage } from '../types/chat';

describe('chatSecurity Tests', () => {
  it('xác nhận component KHÔNG render HTML nguy hiểm từ tin nhắn bot (chống XSS)', () => {
    const maliciousPayload = '<img src=x onerror="alert(\'XSS\')" /><script>alert(1)</script>';

    const botMessage: ChatMessage = {
      id: 'bot-msg-1',
      role: 'assistant',
      content: maliciousPayload,
      createdAt: new Date().toISOString(),
    };

    const element = React.createElement(ChatMessageItem, {
      message: botMessage,
      userLoggedIn: false,
      currentPath: '/',
    });

    const markup = renderToStaticMarkup(element);

    // Chuỗi mã độc phải được escape thành ký tự thực thể an toàn
    expect(markup).toContain('&lt;img src=x onerror=&quot;alert(&#x27;XSS&#x27;)&quot; /&gt;');
    expect(markup).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');

    // Tuyệt đối không được xuất hiện thẻ <img> chưa escape hoặc thẻ <script> thật
    expect(markup).not.toContain('<img src=x');
    expect(markup).not.toContain('<script>');
  });

  it('xác nhận tin nhắn người dùng cũng không render HTML thô', () => {
    const userPayload = '<b>Chữ đậm HTML</b>';

    const userMessage: ChatMessage = {
      id: 'user-msg-1',
      role: 'user',
      content: userPayload,
      createdAt: new Date().toISOString(),
    };

    const element = React.createElement(ChatMessageItem, {
      message: userMessage,
      userLoggedIn: true,
      currentPath: '/',
    });

    const markup = renderToStaticMarkup(element);

    expect(markup).toContain('&lt;b&gt;Chữ đậm HTML&lt;/b&gt;');
    expect(markup).not.toContain('<b>Chữ đậm HTML</b>');
  });
});
