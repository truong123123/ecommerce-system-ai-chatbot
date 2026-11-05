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

// Kho ảnh banner Cloudinary chuẩn tỉ lệ 1200x375 CellphoneS
const CLOUDINARY_BANNER_PRESETS = [
  {
    name: 'Galaxy S26 Ultra',
    title: 'Galaxy S26 Ultra',
    headline: 'Đặt trước nhận quà khủng',
    subHeadline: 'Thu cũ lên đời trợ giá tới 5 Triệu - Trả góp 0%',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859058/banners/471331_S26-Series-1200x375.webp',
    primaryBtnLink: '/products/samsung-galaxy-s26-ultra',
    primaryBtnText: 'Đặt ngay',
  },
  {
    name: 'iPhone 18 Series',
    title: 'iPhone 18 Series',
    headline: 'Sẵn hàng giá tốt',
    subHeadline: 'Ưu đãi thanh toán ngân hàng - Trả góp 0%',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859066/banners/iphone-18-web-082925157.webp',
    primaryBtnLink: '/products/iphone-17-pro-256gb',
    primaryBtnText: 'Mua ngay',
  },
  {
    name: 'Huawei Watch GT 7',
    title: 'Huawei Watch GT 7',
    headline: 'Đỉnh cao pin 2 tuần',
    subHeadline: 'Thiết kế thể thao sang trọng - Theo dõi sức khỏe chuyên sâu',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859060/banners/666649_KV-HUAWEI-WATCH-GT-7-Series-1200x375.webp',
    primaryBtnLink: '/products?category=dong-ho',
    primaryBtnText: 'Khám phá',
  },
  {
    name: 'Galaxy A18 & A08',
    title: 'Galaxy A18 & A08',
    headline: 'Siêu pin 25W - Giá hời',
    subHeadline: 'Màn hình 90Hz mượt mà - Pin 5000mAh bền bỉ',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859062/banners/702904_KV-SS-A18-_-A08-1200x375-25w.webp',
    primaryBtnLink: '/products?category=dien-thoai',
    primaryBtnText: 'Xem chi tiết',
  },
  {
    name: 'OPPO Find X10',
    title: 'OPPO Find X10 Series',
    headline: 'Nhiếp ảnh bậc thầy',
    subHeadline: 'Camera Hasselblad cao cấp - Sạc siêu tốc 100W',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859063/banners/860851_OPPO-Find-X10-Series-web.webp',
    primaryBtnLink: '/products?category=dien-thoai',
    primaryBtnText: 'Tìm hiểu thêm',
  },
  {
    name: 'iPhone Duo Siêu Phẩm',
    title: 'iPhone Duo Siêu Phẩm',
    headline: 'Đăng ký sớm có lợi thế',
    subHeadline: 'Đột phá thiết kế kép - Màn hình tràn viền',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859067/banners/iphone-duo-web-084156526.webp',
    primaryBtnLink: '/products/iphone-air',
    primaryBtnText: 'Đăng ký nhận tin',
  },
  {
    name: 'Astra 2 AI',
    title: 'Astra 2 AI',
    headline: 'Tương lai công nghệ AI',
    subHeadline: 'Xử lý AI tức thì on-device - Trải nghiệm thông minh đỉnh cao',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859064/banners/astra-2-web-083724546.webp',
    primaryBtnLink: '/products',
    primaryBtnText: 'Trải nghiệm ngay',
  },
];

const QUICK_LINKS = [
  { label: 'Tất cả sản phẩm', url: '/products' },
  { label: 'Điện thoại', url: '/products?category=dien-thoai' },
  { label: 'Laptop', url: '/products?category=laptop' },
  { label: 'Đồng hồ', url: '/products?category=dong-ho' },
  { label: 'S26 Ultra', url: '/products/samsung-galaxy-s26-ultra' },
  { label: 'iPhone 17 Pro', url: '/products/iphone-17-pro-256gb' },
];

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
      primaryBtnLink: '/products',
      displayOrder: banners.length + 1,
      isActive: true,
    });
  };

  const openEditModal = (b: BannerItem) => {
    setIsEditing(true);
    setModalBanner({ ...b });
  };

  const handleSelectPreset = (preset: typeof CLOUDINARY_BANNER_PRESETS[0]) => {
    if (!modalBanner) return;
    setModalBanner({
      ...modalBanner,
      imageUrl: preset.imageUrl,
      title: modalBanner.title ? modalBanner.title : preset.title,
      headline: modalBanner.headline ? modalBanner.headline : preset.headline,
      subHeadline: modalBanner.subHeadline ? modalBanner.subHeadline : preset.subHeadline,
      primaryBtnLink: modalBanner.primaryBtnLink && modalBanner.primaryBtnLink !== '/' && modalBanner.primaryBtnLink !== '/products' ? modalBanner.primaryBtnLink : preset.primaryBtnLink,
      primaryBtnText: modalBanner.primaryBtnText ? modalBanner.primaryBtnText : preset.primaryBtnText,
    });
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
      width: '70px',
      sortable: true,
      render: (item) => <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>#{item.id}</span>,
    },
    {
      key: 'imageUrl',
      title: 'Hình ảnh Banner (1200x375)',
      width: '180px',
      render: (item) => {
        const isCloudinary = item.imageUrl?.includes('cloudinary.com');
        return (
          <div>
            <div style={{ width: 150, height: 48, borderRadius: 6, overflow: 'hidden', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="48" fill="%2364748b"><text x="35" y="28">No Image</text></svg>';
                }}
              />
            </div>
            {isCloudinary && (
              <span style={{ fontSize: '0.65rem', color: '#38bdf8', marginTop: 2, display: 'inline-block', fontWeight: 600 }}>
                ☁️ Cloudinary CDN
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'title',
      title: 'Tiêu đề & Khẩu hiệu',
      sortable: true,
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>{item.title}</div>
          {item.headline && <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: 1 }}>{item.headline}</div>}
          {item.primaryBtnLink && (
            <div style={{ fontSize: '0.75rem', color: '#0066cc', marginTop: 3 }}>
              🔗 Đích đến: <span style={{ color: '#94a3b8' }}>{item.primaryBtnLink}</span>
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
        <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>
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
          label={item.isActive ? 'Đang chiếu' : 'Đã ẩn'}
          variant={item.isActive ? 'success' : 'danger'}
        />
      ),
    },
    {
      key: 'id',
      title: 'Hành động',
      width: '150px',
      align: 'center',
      render: (item) => (
        <div className={styles.actionGroup} style={{ justifyContent: 'center' }}>
          <button
            onClick={() => openEditModal(item)}
            className={styles.btnSecondary}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            Sửa
          </button>
          <button
            onClick={() => setDeleteBanner(item)}
            className={styles.btnDanger}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
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
          <h1>Quản lý Banner Quảng cáo (Hero Slider)</h1>
          <p>Điều hướng banner Slider trang chủ CellphoneS, liên kết Cloudinary CDN và các chiến dịch khuyến mãi</p>
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
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Đang chiếu trang chủ</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{activeCount} banner</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon}`} style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>☁️</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Hệ thống lưu trữ</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>Cloudinary CDN (1200x375)</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminDataTable
        columns={columns}
        data={banners}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm theo tiêu đề, headline, link..."
        searchFields={['title', 'headline', 'primaryBtnLink']}
        isLoading={isLoading}
        emptyMessage="Chưa có banner nào trong hệ thống"
      />

      {/* Modal Add / Edit */}
      {modalBanner && (
        <div className={styles.modalOverlay} onClick={() => setModalBanner(null)}>
          <div
            className={styles.modalDialog}
            style={{ maxWidth: '780px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditing ? 'Chỉnh sửa Banner' : 'Tạo mới Banner quảng cáo'}
              </h2>
              <button className={styles.modalCloseBtn} onClick={() => setModalBanner(null)}>×</button>
            </div>

            <form onSubmit={handleSaveBanner}>
              <div className={styles.modalBody}>
                {/* 1. Kho ảnh Cloudinary có sẵn (Click là điền ngay) */}
                <div style={{ marginBottom: 18, background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                      ☁️ Kho ảnh Cloudinary có sẵn (Click để chọn nhanh)
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Tỉ lệ chuẩn 1200x375</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                    {CLOUDINARY_BANNER_PRESETS.map((preset, idx) => {
                      const isSelected = modalBanner.imageUrl === preset.imageUrl;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectPreset(preset)}
                          style={{
                            border: isSelected ? '2px solid #0066cc' : '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 8,
                            padding: 4,
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(0,102,204,0.18)' : '#0f172a',
                            transition: 'all 0.18s ease',
                          }}
                          title={`Click để dùng: ${preset.name}`}
                        >
                          <div style={{ width: '100%', height: 42, borderRadius: 4, overflow: 'hidden' }}>
                            <img src={preset.imageUrl} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isSelected ? '#38bdf8' : '#cbd5e1', marginTop: 4, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {preset.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Link hình ảnh Cloudinary (Image URL) */}
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className={styles.formLabel} style={{ marginBottom: 0 }}>
                      Link hình ảnh Banner (Image URL) *
                    </label>
                    {modalBanner.imageUrl?.includes('cloudinary.com') && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        ✓ Link Cloudinary hợp lệ
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    className={styles.formInput}
                    placeholder="https://res.cloudinary.com/..."
                    value={modalBanner.imageUrl || ''}
                    onChange={(e) => setModalBanner({ ...modalBanner, imageUrl: e.target.value })}
                  />

                  {/* Real-time Banner Preview */}
                  {modalBanner.imageUrl && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>Xem trước hiển thị (Tỉ lệ 1200x375):</div>
                      <div style={{ width: '100%', aspectRatio: '1200 / 375', maxHeight: '180px', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', background: '#0a0f1d' }}>
                        <img
                          src={modalBanner.imageUrl}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" fill="%2364748b"><text x="220" y="95">Link hình ảnh không hợp lệ</text></svg>';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Tiêu đề & Headline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tiêu đề Tab (Title) *</label>
                    <input
                      type="text"
                      required
                      className={styles.formInput}
                      placeholder="VD: Galaxy S26 Ultra"
                      value={modalBanner.title || ''}
                      onChange={(e) => setModalBanner({ ...modalBanner, title: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Khẩu hiệu ngắn (Headline)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="VD: Đặt trước nhận quà khủng"
                      value={modalBanner.headline || ''}
                      onChange={(e) => setModalBanner({ ...modalBanner, headline: e.target.value })}
                    />
                  </div>
                </div>

                {/* 4. Link liên kết & Nút bấm */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Đường dẫn đích khi click (Link URL)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="VD: /products/samsung-galaxy-s26-ultra"
                      value={modalBanner.primaryBtnLink || ''}
                      onChange={(e) => setModalBanner({ ...modalBanner, primaryBtnLink: e.target.value })}
                    />
                    {/* Gợi ý link nhanh */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {QUICK_LINKS.map((ql, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setModalBanner({ ...modalBanner, primaryBtnLink: ql.url })}
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 6px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 4,
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          + {ql.label}
                        </button>
                      ))}
                    </div>
                  </div>

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
                </div>

                {/* 5. Thứ tự & Trạng thái hiển thị */}
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
                          checked={modalBanner.isActive ?? true}
                          onChange={(e) => setModalBanner({ ...modalBanner, isActive: e.target.checked })}
                        />
                        Kích hoạt hiển thị trang chủ
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
                  {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật Banner' : 'Tạo Banner mới'}
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
