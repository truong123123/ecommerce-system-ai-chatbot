'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/api';
import styles from '../adminCrud.module.css';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: '',
    hotline: '',
    contact_email: '',
    headquarters_address: '',
    free_shipping_threshold: '',
    standard_shipping_fee: '',
    order_hold_minutes: '',
    system_maintenance: 'false',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/settings');
      if (res.data?.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error('Lỗi tải cấu hình hệ thống:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/admin/settings', settings);
      setAlert({ type: 'success', message: 'Cập nhật cấu hình hệ thống thành công!' });
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi lưu cấu hình'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          Đang tải cấu hình hệ thống...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>Cấu hình Hệ thống (System Settings)</h1>
          <p>Thiết lập thông số vận hành toàn sàn: thông tin nhận diện, chính sách vận chuyển và chế độ bảo trì</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnSecondary} onClick={fetchSettings}>
            Tải lại cấu hình
          </button>
        </div>
      </div>

      {alert && (
        <div className={`${styles.alertBanner} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.message}</span>
          <button className={styles.alertCloseBtn} onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Card 1: Brand & Contact */}
        <div style={{
          background: '#161824',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            🏷️ Thông tin nhận diện & Chăm sóc khách hàng
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Hiển thị trên Header, Footer website và hóa đơn điện tử gửi khách hàng
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tên thương hiệu cửa hàng</label>
              <input
                type="text"
                className={styles.formInput}
                value={settings.store_name || ''}
                onChange={(e) => handleChange('store_name', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Hotline tổng đài tư vấn</label>
              <input
                type="text"
                className={styles.formInput}
                value={settings.hotline || ''}
                onChange={(e) => handleChange('hotline', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email tiếp nhận phản hồi CSKH</label>
              <input
                type="email"
                className={styles.formInput}
                value={settings.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Địa chỉ trụ sở chính</label>
              <input
                type="text"
                className={styles.formInput}
                value={settings.headquarters_address || ''}
                onChange={(e) => handleChange('headquarters_address', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Shipping & Order Policy */}
        <div style={{
          background: '#161824',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            🚚 Chính sách Vận chuyển & Giao dịch
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Quy định phí ship, miễn phí vận chuyển tự động tại màn hình thanh toán
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 8 }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ngưỡng miễn phí vận chuyển (VNĐ)</label>
              <input
                type="number"
                className={styles.formInput}
                value={settings.free_shipping_threshold || ''}
                onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                Đơn hàng đạt từ mức này sẽ được miễn 100% phí ship
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phí giao hàng tiêu chuẩn (VNĐ)</label>
              <input
                type="number"
                className={styles.formInput}
                value={settings.standard_shipping_fee || ''}
                onChange={(e) => handleChange('standard_shipping_fee', e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                Áp dụng cho đơn hàng dưới ngưỡng miễn ship
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Thời gian giữ chỗ thanh toán (Phút)</label>
              <input
                type="number"
                className={styles.formInput}
                value={settings.order_hold_minutes || ''}
                onChange={(e) => handleChange('order_hold_minutes', e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                Tự động hủy đơn VNPay nếu khách chưa thanh toán
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Maintenance & Operation Mode */}
        <div style={{
          background: '#161824',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚙️ Chế độ Vận hành & Bảo trì
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '16px 20px',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>Chế độ Bảo trì hệ thống</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
                Khi bật, khách vãng lai sẽ thấy thông báo bảo trì, chỉ tài khoản Admin mới đăng nhập được
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                  checked={settings.system_maintenance === 'true'}
                  onChange={(e) => handleChange('system_maintenance', e.target.checked ? 'true' : 'false')}
                />
                <span style={{ fontWeight: 700, color: settings.system_maintenance === 'true' ? '#f87171' : '#10b981' }}>
                  {settings.system_maintenance === 'true' ? 'Đang bảo trì' : 'Hoạt động bình thường'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isSaving}
            style={{ padding: '12px 32px', fontSize: '0.95rem' }}
          >
            {isSaving ? 'Đang lưu cấu hình...' : 'Lưu toàn bộ cấu hình'}
          </button>
        </div>
      </form>
    </div>
  );
}
