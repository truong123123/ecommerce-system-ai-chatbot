'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { AccountLayout } from '../../../components/account/AccountLayout';
import { accountService } from '../../../services/accountService';
import styles from '../account.module.css';

export default function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setMsg({ text: 'Vui lòng nhập mật khẩu hiện tại.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ text: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMsg(null);
    try {
      await accountService.changePassword({ currentPassword, newPassword });
      setMsg({ text: 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccountLayout title="Đổi mật khẩu & Bảo mật">
      {msg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          background: msg.type === 'success' ? '#e8f5e9' : '#fee2e2',
          color: msg.type === 'success' ? '#166534' : '#991b1b',
        }}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>
        <div className={styles.formGroup}>
          <label>Mật khẩu hiện tại *</label>
          <input
            type="password"
            className={styles.inputField}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Nhập mật khẩu đang dùng"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Mật khẩu mới *</label>
          <input
            type="password"
            className={styles.inputField}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Xác nhận mật khẩu mới *</label>
          <input
            type="password"
            className={styles.inputField}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            required
          />
        </div>

        <div style={{ marginTop: '24px' }}>
          <button type="submit" className={styles.primaryBtn} disabled={submitting}>
            <ShieldCheck size={16} />
            <span>{submitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</span>
          </button>
        </div>
      </form>
    </AccountLayout>
  );
}
