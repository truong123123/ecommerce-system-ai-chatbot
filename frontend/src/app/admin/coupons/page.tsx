'use client';

import React, { useEffect, useState, useMemo } from 'react';
import styles from '../adminCrud.module.css';
import { couponService, CouponItem, CreateCouponPayload } from '../../../services/couponService';

export default function AdminCouponPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateCouponPayload>({
    code: '',
    type: 'fixed',
    value: 50000,
    minOrderValue: 200000,
    maxDiscount: undefined,
    usageLimit: 100,
    maxUsagePerUser: 1,
    isActive: true,
    title: '',
    description: '',
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponService.getAdminCoupons();
      setCoupons(data);
    } catch {
      showAlert('error', 'Không thể tải danh sách mã giảm giá từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'fixed',
      value: 50000,
      minOrderValue: 200000,
      maxDiscount: undefined,
      usageLimit: 100,
      maxUsagePerUser: 1,
      isActive: true,
      title: '',
      description: '',
      startsAt: new Date().toISOString().slice(0, 16),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  const openEditModal = (c: CouponItem) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderValue: c.minOrderValue,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      maxUsagePerUser: c.maxUsagePerUser,
      isActive: c.isActive,
      title: c.title || '',
      description: c.description || '',
      startsAt: c.startsAt ? new Date(c.startsAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      endsAt: c.endsAt ? new Date(c.endsAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      categoryId: c.categoryId,
      brandId: c.brandId,
      productId: c.productId,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const updated = await couponService.toggleStatus(id);
      setCoupons((prev) => prev.map((item) => (item.couponId === id ? updated : item)));
      showAlert('success', `Đã cập nhật trạng thái mã ${updated.code}!`);
    } catch {
      showAlert('error', 'Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${code}"?`)) return;
    try {
      await couponService.deleteCoupon(id);
      setCoupons((prev) => prev.filter((item) => item.couponId !== id));
      showAlert('success', `Đã xóa mã ${code} thành công.`);
    } catch {
      showAlert('error', 'Không thể xóa mã giảm giá.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showAlert('error', 'Vui lòng nhập mã giảm giá.');
      return;
    }
    if (!formData.value || formData.value <= 0) {
      showAlert('error', 'Giá trị giảm giá phải lớn hơn 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateCouponPayload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
      };

      if (editingCoupon) {
        const updated = await couponService.updateCoupon(editingCoupon.couponId, payload);
        setCoupons((prev) => prev.map((item) => (item.couponId === updated.couponId ? updated : item)));
        showAlert('success', `Cập nhật mã giảm giá "${updated.code}" thành công!`);
      } else {
        const created = await couponService.createCoupon(payload);
        setCoupons((prev) => [created, ...prev]);
        showAlert('success', `Tạo mã giảm giá "${created.code}" thành công!`);
      }
      setShowModal(false);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      showAlert('error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchKeyword =
        c.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (c.title && c.title.toLowerCase().includes(searchKeyword.toLowerCase()));

      const now = new Date();
      const isExpired = c.endsAt && new Date(c.endsAt) < now;

      if (statusFilter === 'active') {
        return matchKeyword && c.isActive && !isExpired;
      }
      if (statusFilter === 'expired') {
        return matchKeyword && (!c.isActive || isExpired);
      }
      return matchKeyword;
    });
  }, [coupons, searchKeyword, statusFilter]);

  const activeCount = coupons.filter((c) => c.isActive && (!c.endsAt || new Date(c.endsAt) >= new Date())).length;
  const expiredCount = coupons.length - activeCount;

  return (
    <div className={styles.container}>
      {/* Alert */}
      {alert && (
        <div className={`${styles.alert} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý Mã giảm giá (Coupons & Promotions)</h1>
          <p className={styles.subtitle}>Thiết lập mã khuyến mãi, voucher phần trăm hoặc số tiền cố định cho khách hàng</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreateModal}>
          <span>+</span> Thêm Mã Giảm Giá
        </button>
      </div>

      {/* Stats Summary */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{coupons.length}</div>
          <div className={styles.statLabel}>Tổng mã voucher</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#10b981' }}>{activeCount}</div>
          <div className={styles.statLabel}>Đang hiệu lực</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#ef4444' }}>{expiredCount}</div>
          <div className={styles.statLabel}>Hết hạn / Đã khóa</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo mã code, tiêu đề khuyến mãi..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${statusFilter === 'all' ? styles.filterTabActive : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả ({coupons.length})
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === 'active' ? styles.filterTabActive : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Đang hoạt động ({activeCount})
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === 'expired' ? styles.filterTabActive : ''}`}
            onClick={() => setStatusFilter('expired')}
          >
            Hết hạn / Khóa ({expiredCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingWrapper}>Đang tải dữ liệu voucher...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className={styles.emptyState}>Không tìm thấy mã giảm giá nào phù hợp.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã Voucher</th>
                <th>Tiêu đề / Mô tả</th>
                <th>Hình thức giảm</th>
                <th>Đơn tối thiểu</th>
                <th>Lượt dùng</th>
                <th>Thời hạn</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((c) => {
                const now = new Date();
                const isExpired = c.endsAt && new Date(c.endsAt) < now;
                return (
                  <tr key={c.couponId}>
                    <td>
                      <span className={styles.badge} style={{ background: '#3b82f6', color: '#fff', fontWeight: 700, letterSpacing: '1px' }}>
                        {c.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.title || 'Mã giảm giá'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.description || 'Không có mô tả'}</div>
                    </td>
                    <td>
                      {c.type === 'percent' ? (
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                          Giảm {c.value}% {c.maxDiscount ? `(Tối đa ${c.maxDiscount.toLocaleString('vi-VN')}đ)` : ''}
                        </span>
                      ) : (
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          Giảm {Number(c.value).toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </td>
                    <td>{c.minOrderValue ? `${Number(c.minOrderValue).toLocaleString('vi-VN')}đ` : '0đ'}</td>
                    <td>
                      <div>
                        {c.usedCount} / {c.usageLimit || '∞'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Tối đa {c.maxUsagePerUser} lần/người
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <div>Từ: {new Date(c.startsAt).toLocaleDateString('vi-VN')}</div>
                      <div style={{ color: isExpired ? '#ef4444' : '#10b981' }}>
                        Đến: {new Date(c.endsAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td>
                      {isExpired ? (
                        <span className={styles.badge} style={{ background: '#ef4444', color: '#fff' }}>Hết hạn</span>
                      ) : c.isActive ? (
                        <span className={styles.badge} style={{ background: '#10b981', color: '#fff' }}>Kích hoạt</span>
                      ) : (
                        <span className={styles.badge} style={{ background: '#64748b', color: '#fff' }}>Tạm khóa</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.btnSmall}
                          onClick={() => handleToggleStatus(c.couponId)}
                          title={c.isActive ? 'Khóa mã' : 'Kích hoạt mã'}
                        >
                          {c.isActive ? '🔒' : '🔓'}
                        </button>
                        <button
                          className={styles.btnSmall}
                          onClick={() => openEditModal(c)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className={`${styles.btnSmall} ${styles.btnDanger}`}
                          onClick={() => handleDelete(c.couponId, c.code)}
                          title="Xóa mã"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Tạo/Sửa */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '650px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingCoupon ? `Chỉnh sửa mã: ${editingCoupon.code}` : 'Tạo mới mã giảm giá'}
              </h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mã giảm giá (Code) *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="VD: TET2025, GIAM50K..."
                    className={styles.input}
                    style={{ textTransform: 'uppercase', fontWeight: 700 }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Loại giảm giá *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'fixed' | 'percent' })}
                    className={styles.select}
                  >
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                    <option value="percent">Phần trăm (%)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {formData.type === 'percent' ? 'Mức giảm (%) *' : 'Số tiền giảm (VNĐ) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.type === 'percent' ? 100 : undefined}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderValue || 0}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className={styles.input}
                  />
                </div>
              </div>

              {formData.type === 'percent' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Số tiền giảm tối đa (VNĐ, để trống nếu không giới hạn)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="VD: 100000"
                    className={styles.input}
                  />
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tổng lượt sử dụng (để trống nếu không giới hạn)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.usageLimit || ''}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Không giới hạn"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Lượt dùng tối đa mỗi khách hàng</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxUsagePerUser || 1}
                    onChange={(e) => setFormData({ ...formData, maxUsagePerUser: Number(e.target.value) })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Bắt đầu từ *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Kết thúc vào *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tiêu đề hiển thị</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Giảm ngay 50.000đ cho đơn từ 200.000đ"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Điều kiện áp dụng, đối tượng khách hàng..."
                  className={styles.textarea}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Kích hoạt mã ngay sau khi lưu</span>
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" disabled={isSubmitting} className={styles.btnPrimary}>
                  {isSubmitting ? 'Đang lưu...' : editingCoupon ? 'Cập nhật mã' : 'Tạo mã giảm giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
