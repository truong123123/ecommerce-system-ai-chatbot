'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/api';
import { StatusBadge } from '../../../components/admin';
import styles from '../adminCrud.module.css';

interface ChatSession {
  sessionId: string;
  customerId?: number;
  customerName: string;
  customerEmail?: string;
  lastMessage: string;
  lastRole: string;
  messageCount: number;
  lastMessageAt: string;
}

interface MessageItem {
  id: number;
  role: string;
  content: string;
  toolName?: string;
  model?: string;
  createdAt: string;
}

export default function AdminSupportPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/support/chats');
      if (Array.isArray(res.data)) {
        setSessions(res.data);
        if (res.data.length > 0 && !activeSessionId) {
          setActiveSessionId(res.data[0].sessionId);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách phiên chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchThread = async (sessionId: string) => {
    setLoadingThread(true);
    try {
      const res = await apiClient.get(`/admin/support/chats/${sessionId}`);
      if (Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải đoạn hội thoại:', err);
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    if (activeSessionId) {
      fetchThread(activeSessionId);
    }
  }, [activeSessionId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSessionId) return;

    setIsSending(true);
    try {
      const res = await apiClient.post(`/admin/support/chats/${activeSessionId}/reply`, {
        content: replyText.trim(),
      });
      setReplyText('');
      setAlert({ type: 'success', message: 'Đã gửi phản hồi thành công đến phiên chat!' });
      // Thêm ngay tin nhắn mới vào thread
      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
      fetchSessions();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Không thể gửi phản hồi'
      });
    } finally {
      setIsSending(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(q) ||
      (s.customerEmail && s.customerEmail.toLowerCase().includes(q)) ||
      s.lastMessage.toLowerCase().includes(q)
    );
  });

  const activeSession = sessions.find((s) => s.sessionId === activeSessionId);

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>Trung tâm Hỗ trợ Khách hàng (Customer Support Desk)</h1>
          <p>Giám sát các cuộc hội thoại trợ lý AI, can thiệp tư vấn trực tiếp và giải đáp khiếu nại khách hàng</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnSecondary} onClick={fetchSessions}>
            Làm mới hội thoại
          </button>
        </div>
      </div>

      {alert && (
        <div className={`${styles.alertBanner} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.message}</span>
          <button className={styles.alertCloseBtn} onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      {/* Main Support Chat Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 360px) 1fr',
        gap: 16,
        background: '#161824',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        overflow: 'hidden',
        minHeight: 650
      }}>
        {/* Left Column: Sessions List */}
        <div style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          background: '#141622'
        }}>
          {/* Search box */}
          <div style={{ padding: 14, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <input
              type="text"
              placeholder="Tìm khách hàng, nội dung..."
              className={styles.formInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* Sessions items */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {isLoading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>
                Đang tải các phiên chat...
              </div>
            ) : filteredSessions.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                Không tìm thấy phiên hỗ trợ nào
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isSelected = s.sessionId === activeSessionId;
                return (
                  <div
                    key={s.sessionId}
                    onClick={() => setActiveSessionId(s.sessionId)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: isSelected ? 'rgba(227, 0, 25, 0.12)' : 'transparent',
                      borderLeft: isSelected ? '3px solid #e30019' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: isSelected ? '#fff' : '#e2e8f0', fontSize: '0.9rem' }}>
                        {s.customerName}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {s.lastMessageAt ? new Date(s.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    {s.customerEmail && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                        {s.customerEmail}
                      </div>
                    )}

                    <div style={{
                      fontSize: '0.8rem',
                      color: isSelected ? '#cbd5e1' : '#64748b',
                      marginTop: 6,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {s.lastRole === 'user' ? 'Khách: ' : 'Hệ thống: '}
                      {s.lastMessage}
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <span style={{
                        fontSize: '0.7rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        color: '#94a3b8'
                      }}>
                        {s.messageCount} tin nhắn
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Thread & Reply */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Active Header */}
          {activeSession ? (
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#181b2a'
            }}>
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>
                  {activeSession.customerName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Session ID: <span style={{ fontFamily: 'monospace' }}>{activeSession.sessionId}</span>
                  {activeSession.customerEmail && ` • ${activeSession.customerEmail}`}
                </div>
              </div>

              <div>
                <StatusBadge status="active" label="Đang kết nối" variant="success" />
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, color: '#94a3b8' }}>Vui lòng chọn một phiên chat</div>
          )}

          {/* Messages list */}
          <div style={{
            flex: 1,
            padding: 20,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: '#0f111a'
          }}>
            {loadingThread ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                Đang tải đoạn hội thoại...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                Chưa có tin nhắn trong phiên chat này
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === 'user';
                const isStaff = msg.model && msg.model.startsWith('staff-support');
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isUser ? 'flex-start' : 'flex-end',
                      maxWidth: '78%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#64748b',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span>{isUser ? 'Khách hàng' : isStaff ? 'Tư vấn viên (Staff)' : 'AI Smart Bot'}</span>
                      <span>•</span>
                      <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('vi-VN') : ''}</span>
                    </div>

                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: isUser ? '#1f2438' : isStaff ? '#e30019' : '#232840',
                      color: '#fff',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      borderTopLeftRadius: isUser ? 2 : 12,
                      borderTopRightRadius: !isUser ? 2 : 12,
                    }}>
                      {msg.content}
                    </div>

                    {msg.toolName && (
                      <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: 3 }}>
                        ⚙ Gọi công cụ tra cứu: {msg.toolName}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          {activeSessionId && (
            <form onSubmit={handleSendReply} style={{
              padding: '14px 18px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#161824',
              display: 'flex',
              gap: 12,
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="Nhập nội dung phản hồi trực tiếp cho khách hàng..."
                className={styles.formInput}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={isSending}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={isSending || !replyText.trim()}
                style={{ padding: '9px 18px' }}
              >
                {isSending ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
