'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/api';
import { AdminDataTable, StatusBadge, Column, ConfirmDialog } from '../../../components/admin';
import styles from '../adminCrud.module.css';

interface BannerItem {
  id: number;
  title: string;
  headline?: string;
  subHeadline?: string;
  imageUrl: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  bgColor?: string;
  textColor?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalBanner, setModalBanner] = useState<Partial<BannerItem> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteBanner, setDeleteBanner] = useState<BannerItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/banners');
      if (Array.isArray(res.data)) {
        setBanners(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách banner:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setModalBanner({
      title: '',
      headline: '',
      subHeadline: '',
      imageUrl: '',
      primaryBtnText: 'Xem ngay',
      primaryBtnLink: '/',
      displayOrder: banners.length + 1,
      isActive: true,
    });
  };

  const openEditModal = (b: BannerItem) => {
    setIsEditing(true);
    setModalBanner({ ...b });
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBanner?.title || !modalBanner.imageUrl) {
      setAlert({ type: 'error', message: 'Vui lòng điền tiêu đề và link hình ảnh banner' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && modalBanner.id) {
        await apiClient.put(`/admin/banners/${modalBanner.id}`, modalBanner);
        setAlert({ type: 'success', message: 'Cập nhật banner thành công!' });
      } else {
        await apiClient.post('/admin/banners', modalBanner);
        setAlert({ type: 'success', message: 'Tạo banner mới thành công!' });
      }
      setModalBanner(null);
      fetchBanners();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi lưu banner'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!deleteBanner) return;
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/admin/banners/${deleteBanner.id}`);
      setAlert({ type: 'success', message: 'Đã xóa banner thành công!' });
      setDeleteBanner(null);
      fetchBanners();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Không thể xóa banner'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = banners.filter((b) => b.isActive).length;

  const columns: Column<BannerItem>[] = [
    {
      key: 'id',
      title: 'Mã',
      width: '80px',
      sortable: true,
      render: (item) => <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>#{item.id}</span>,
    },
    {
      key: 'imageUrl',
      title: 'Hình ảnh',
      width: '140px',
      render: (item) => (
        <div style={{ width: 110, height: 50, borderRadius: 6, overflow: 'hidden', background: '#1c1f2e', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" fill="%2364748b"><text x="10" y="25">No Image</text></svg>';
            }}
          />
        </div>
      ),
    },
    {
      key: 'title',
      title: 'Tiêu đề & Nội dung',
      sortable: true,
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{item.title}</div>
          {item.headline && <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{item.headline}</div>}
          {item.primaryBtnLink && (
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: 2 }}>
              Link: {item.primaryBtnLink}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'displayOrder',
      title: 'Thứ tự',
      width: '90px',
      sortable: true,
      align: 'center',
      render: (item) => (
        <span style={{ fontWeight: 700, color: '#f59e0b' }}>
          #{item.displayOrder}
        </span>
      ),
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      width: '130px',
      align: 'center',
      render: (item) => (
        <StatusBadge
          status={item.isActive ? 'active' : 'inactive'}
          label={item.isActive ? 'Hiển thị' : 'Ẩn'}
          variant={item.isActive ? 'success' : 'danger'}
        />
      ),
    },
    {
      key: 'id',
      title: 'Hành động',
      width: '160px',
      align: 'center',
      render: (item) => (
        <div className={styles.actionGroup} style={{ justifyContent: 'center' }}>
          <button
            onClick={() => openEditModal(item)}
            className={styles.btnSecondary}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
          >
            Sửa
          </button>
          <button
            onClick={() => setDeleteBanner(item)}
            className={styles.btnDanger}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>Quản lý Banner Quảng cáo (Banners)</h1>
          <p>Điều hướng banner Slider trang chủ, banner danh mục và các chiến dịch khuyến mãi</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnPrimary} onClick={openCreateModal}>
            + Thêm Banner mới
          </button>
        </div>
      </div>

      {alert && (
        <div className={`${styles.alertBanner} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.message}</span>
          <button className={styles.alertCloseBtn} onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      {/* Stats Summary */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>🖼️</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tổng số Banner</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{banners.length} banner</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>✓</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Đang hiển thị</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{activeCount} banner</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminDataTable
        columns={columns}
        data={banners}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm theo tiêu đề, headline, link liên kết..."
        searchFields={['title', 'headline', 'primaryBtnLink']}
        isLoading={isLoading}
        emptyMessage="Chưa có banner nào trong hệ thống"
      />

      {/* Modal Add / Edit */}
      {modalBanner && (
        <div className={styles.modalOverlay} onClick={() => setModalBanner(null)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditing ? 'Chỉnh sửa Banner' : 'Tạo mới Banner quảng cáo'}
              </h2>
              <button className={styles.modalCloseBtn} onClick={() => setModalBanner(null)}>×</button>
            </div>

            <form onSubmit={handleSaveBanner}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tiêu đề banner *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="VD: Siêu Sale Mùa Tựu Trường"
                    value={modalBanner.title || ''}
                    onChange={(e) => setModalBanner({ ...modalBanner, title: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Headline (Khẩu hiệu)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="VD: Giảm ngay 2 triệu cho Tân sinh viên"
                    value={modalBanner.headline || ''}
                    onChange={(e) => setModalBanner({ ...modalBanner, headline: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Link hình ảnh (Image URL) *</label>
                  <input
                    type="url"
                    required
                    className={styles.formInput}
                    placeholder="https://..."
                    value={modalBanner.imageUrl || ''}
                    onChange={(e) => setModalBanner({ ...modalBanner, imageUrl: e.target.value })}
                  />
                  {modalBanner.imageUrl && (
                    <div style={{ marginTop: 8, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={modalBanner.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Chữ trên nút (Button Text)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="VD: Mua ngay"
                      value={modalBanner.primaryBtnText || ''}
                      onChange={(e) => setModalBanner({ ...modalBanner, primaryBtnText: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Đường dẫn đích (Link URL)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="VD: /products?category=laptop"
                      value={modalBanner.primaryBtnLink || ''}
                      onChange={(e) => setModalBanner({ ...modalBanner, primaryBtnLink: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Thứ tự hiển thị (Order)</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={modalBanner.displayOrder || 0}
                      onChange={(e) => setModalBanner({ ...modalBanner, displayOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Hiển thị trên website</label>
                    <div style={{ marginTop: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={modalBanner.isActive || false}
                          onChange={(e) => setModalBanner({ ...modalBanner, isActive: e.target.checked })}
                        />
                        Kích hoạt hiển thị
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setModalBanner(null)}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteBanner}
        title="Xóa Banner quảng cáo"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn banner "${deleteBanner?.title}"?`}
        confirmText="Xóa banner"
        confirmVariant="danger"
        isLoading={isSubmitting}
        onConfirm={handleDeleteBanner}
        onCancel={() => setDeleteBanner(null)}
      />
    </div>
  );
}
