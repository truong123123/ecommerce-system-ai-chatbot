'use client';

import React, { useEffect, useState } from 'react';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { AccountLayout } from '../../../components/account/AccountLayout';
import { accountService, CustomerProfile } from '../../../services/accountService';
import styles from '../account.module.css';

export default function AccountProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('M');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    accountService.getProfile()
      .then((data) => {
        setProfile(data);
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        setGender(data.gender || 'M');
        setBirthDate(data.birthDate || '');
      })
      .catch(() => {
        setMsg({ text: 'Không thể tải thông tin hồ sơ.', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setMsg({ text: 'Họ và tên không được để trống.', type: 'error' });
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      const updated = await accountService.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        gender: gender || undefined,
        birthDate: birthDate || undefined,
      });
      setProfile(updated);
      setMsg({ text: 'Cập nhật thông tin thành công!', type: 'success' });
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountLayout title="Thông tin cá nhân">
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

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải...</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: '640px' }}>
          <div className={styles.formGroup}>
            <label>Họ và tên *</label>
            <input
              type="text"
              className={styles.inputField}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Địa chỉ Email (Không đổi)</label>
              <input
                type="email"
                className={styles.inputField}
                value={profile?.email || ''}
                disabled
                style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Số điện thoại</label>
              <input
                type="tel"
                className={styles.inputField}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987654321"
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Giới tính</label>
              <select
                className={styles.inputField}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="M">Nam</option>
                <option value="F">Nữ</option>
                <option value="O">Khác</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Ngày sinh</label>
              <input
                type="date"
                className={styles.inputField}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      )}
    </AccountLayout>
  );
}
