'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import styles from '../adminCrud.module.css';
import { brandService, BrandItem, BrandRequest } from '../../../services/brandService';

export default function AdminBrandPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Form State
  const [formData, setFormData] = useState<BrandRequest>({
    name: '',
    slug: '',
    country: '',
    logoUrl: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  });

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await brandService.getBrands({ activeOnly: false });
      setBrands(data);
    } catch (err) {
      showAlert('error', 'Không thể tải danh sách thương hiệu từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  // Tạo slug từ chuỗi tiếng Việt
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug ? generateSlug(val) : prev.slug,
    }));
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setAutoSlug(true);
    setFormData({
      name: '',
      slug: '',
      country: '',
      logoUrl: '',
      description: '',
      sortOrder: (brands.length + 1) * 5,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (b: BrandItem) => {
    setEditingBrand(b);
    setAutoSlug(false);
    setFormData({
      name: b.name,
      slug: b.slug,
      country: b.country || '',
      logoUrl: b.logoUrl || '',
      description: b.description || '',
      sortOrder: b.sortOrder,
      isActive: b.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showAlert('error', 'Vui lòng nhập tên thương hiệu!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BrandRequest = {
        name: formData.name.trim(),
        slug: formData.slug?.trim() || generateSlug(formData.name),
        country: formData.country?.trim() || null,
        logoUrl: formData.logoUrl?.trim() || null,
        description: formData.description?.trim() || null,
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: formData.isActive,
      };

      if (editingBrand) {
        await brandService.updateBrand(editingBrand.brandId, payload);
        showAlert('success', `Cập nhật thương hiệu "${payload.name}" thành công!`);
      } else {
        await brandService.createBrand(payload);
        showAlert('success', `Thêm thương hiệu "${payload.name}" thành công!`);
      }

      setShowModal(false);
      await loadBrands();
    } catch (err: any) {
      console.error('Lỗi khi lưu thương hiệu:', err);
      const errMsg = err?.response?.data?.message || err.message || 'Lỗi khi lưu thương hiệu.';
      showAlert('error', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickToggleActive = async (b: BrandItem) => {
    const newActive = !b.isActive;
    setBrands((prev) =>
      prev.map((item) => (item.brandId === b.brandId ? { ...item, isActive: newActive } : item))
    );
    try {
      await brandService.updateBrand(b.brandId, {
        name: b.name,
        slug: b.slug,
        isActive: newActive,
      });
      showAlert('success', `Đã ${newActive ? 'kích hoạt' : 'vô hiệu hóa'} thương hiệu "${b.name}".`);
    } catch (err: any) {
      setBrands((prev) =>
        prev.map((item) => (item.brandId === b.brandId ? { ...item, isActive: !newActive } : item))
      );
      const msg = err?.response?.data?.message || 'Không thể thay đổi trạng thái thương hiệu.';
      showAlert('error', msg);
    }
  };

  const handleDelete = async (b: BrandItem) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thương hiệu "${b.name}" (ID: ${b.brandId})?`)) {
      return;
    }

    try {
      await brandService.deleteBrand(b.brandId);
      showAlert('success', `Đã xóa thương hiệu "${b.name}" thành công!`);
      await loadBrands();
    } catch (err: any) {
      console.error('Lỗi khi xóa thương hiệu:', err);
      if (err?.response?.status === 409) {
        showAlert(
          'error',
          `Không thể xóa thương hiệu "${b.name}" vì đang có sản phẩm thuộc thương hiệu này! Vui lòng đổi thương hiệu cho các sản phẩm trước.`
        );
      } else {
        showAlert('error', err?.response?.data?.message || 'Lỗi hệ thống khi xóa thương hiệu.');
      }
    }
  };

  // Thống kê
  const stats = useMemo(() => {
    const total = brands.length;
    const active = brands.filter((b) => b.isActive).length;
    const inactive = total - active;
    const countries = new Set(brands.map((b) => b.country).filter(Boolean)).size;
    return { total, active, inactive, countries };
  }, [brands]);

  // Bộ lọc
  const filteredBrands = useMemo(() => {
    return brands.filter((item) => {
      const matchKeyword =
        !searchKeyword ||
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (item.country && item.country.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        item.brandId.toString().includes(searchKeyword);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.isActive) ||
        (statusFilter === 'inactive' && !item.isActive);

      return matchKeyword && matchStatus;
    });
  }, [brands, searchKeyword, statusFilter]);

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>🏷️ Quản lý Thương hiệu (Brands)</h1>
          <p>Quản lý các đối tác sản xuất, logo thương hiệu và gán cho các danh mục sản phẩm</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnPrimary} onClick={openCreateModal}>
            <span>➕</span> Thêm Thương hiệu mới
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div className={`${styles.alertBanner} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.message}</span>
          <button className={styles.alertCloseBtn} onClick={() => setAlert(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>🏷️</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Tổng số thương hiệu</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>✅</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.active}</span>
            <span className={styles.statLabel}>Đang kích hoạt</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>⏸️</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.inactive}</span>
            <span className={styles.statLabel}>Đang tạm ẩn</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconInfo}`}>🌐</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.countries}</span>
            <span className={styles.statLabel}>Quốc gia xuất xứ</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className={styles.toolbarCard}>
        <div className={styles.filterGroup}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên thương hiệu, slug, quốc gia..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Chỉ đang hiện (Active)</option>
            <option value="inactive">Chỉ đang ẩn (Inactive)</option>
          </select>
        </div>

        <div style={{ fontSize: 13, color: '#9ca3af' }}>
          Hiển thị: <strong style={{ color: '#fff' }}>{filteredBrands.length}</strong> / {brands.length} thương hiệu
        </div>
      </div>

      {/* Table Content */}
      <div className={styles.contentCard}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <p className={styles.emptyTitle}>Đang tải danh sách thương hiệu...</p>
          </div>
        ) : brands.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏷️</div>
            <p className={styles.emptyTitle}>Chưa có thương hiệu nào</p>
            <p className={styles.emptyDesc}>Bấm &quot;Thêm Thương hiệu mới&quot; để tạo thương hiệu đầu tiên.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th style={{ width: 80 }}>Logo</th>
                  <th>Tên thương hiệu</th>
                  <th>Slug URL</th>
                  <th>Quốc gia</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Thứ tự</th>
                  <th style={{ textAlign: 'center', width: 130 }}>Trạng thái</th>
                  <th style={{ textAlign: 'center', width: 120 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                      Không tìm thấy thương hiệu phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((b) => (
                    <tr key={b.brandId}>
                      <td style={{ fontWeight: 700, color: '#9ca3af' }}>#{b.brandId}</td>
                      <td>
                        {b.logoUrl ? (
                          <div style={{ width: 44, height: 44, position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#fff', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                              src={b.logoUrl}
                              alt={b.name}
                              width={36}
                              height={36}
                              style={{ objectFit: 'contain' }}
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 8,
                              background: 'rgba(255,255,255,0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 18,
                              fontWeight: 800,
                              color: '#9ca3af',
                            }}
                          >
                            {b.name.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{b.name}</div>
                        {b.description && (
                          <div
                            style={{
                              fontSize: 12,
                              color: '#9ca3af',
                              maxWidth: 320,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: 2,
                            }}
                          >
                            {b.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={styles.treeSlug}>/{b.slug}</span>
                      </td>
                      <td>
                        <span style={{ color: b.country ? '#e5e7eb' : '#6b7280' }}>
                          {b.country || 'Chưa cập nhật'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{b.sortOrder}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={styles.btnToggle}
                          onClick={() => handleQuickToggleActive(b)}
                          title="Nhấn để đổi trạng thái"
                        >
                          {b.isActive ? (
                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>● Đang hiện</span>
                          ) : (
                            <span className={`${styles.badge} ${styles.badgeMuted}`}>○ Đang ẩn</span>
                          )}
                        </button>
                      </td>
                      <td>
                        <div className={styles.actionGroup} style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className={`${styles.btnIcon} ${styles.btnIconEdit}`}
                            title="Sửa thương hiệu"
                            onClick={() => openEditModal(b)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className={`${styles.btnIcon} ${styles.btnIconDelete}`}
                            title="Xóa thương hiệu"
                            onClick={() => handleDelete(b)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL THÊM / SỬA THƯƠNG HIỆU */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => !isSubmitting && setShowModal(false)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingBrand ? '✏️ Chỉnh sửa Thương hiệu' : '➕ Thêm Thương hiệu mới'}
              </h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => !isSubmitting && setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className={styles.modalBody}>
                {/* Tên thương hiệu */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Tên thương hiệu <span className={styles.formRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Ví dụ: Apple, Samsung, ASUS, Sony, Xiaomi..."
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                  />
                </div>

                {/* Slug */}
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.formLabel}>Slug đường dẫn URL</label>
                    <label style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                      />
                      Tự sinh từ tên
                    </label>
                  </div>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="apple, samsung, asus..."
                    value={formData.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                  />
                  <span className={styles.formHelp}>Đường link nhận diện thương hiệu: /brand/{formData.slug || 'slug'}</span>
                </div>

                {/* Quốc gia & Sort Order */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Quốc gia xuất xứ</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Mỹ, Hàn Quốc, Đài Loan, Nhật Bản..."
                      value={formData.country || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Thứ tự hiển thị</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      placeholder="0, 10, 20..."
                      value={formData.sortOrder}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Logo URL */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Logo URL</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="https://... hoặc /images/brands/..."
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  />
                  {formData.logoUrl && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Xem trước:</span>
                      <div style={{ background: '#fff', padding: 4, borderRadius: 6, display: 'inline-flex' }}>
                        <Image
                          src={formData.logoUrl}
                          alt="Preview"
                          width={32}
                          height={32}
                          style={{ objectFit: 'contain' }}
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mô tả */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mô tả thương hiệu</label>
                  <textarea
                    rows={2}
                    className={styles.formTextarea}
                    placeholder="Thông tin ngắn về thương hiệu, triết lý sản phẩm..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Bật / Tắt kích hoạt */}
                <div className={styles.switchContainer}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <span className={styles.slider} />
                  </label>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>
                      {formData.isActive ? 'Đang kích hoạt (Hiển thị ngoài web)' : 'Đang tạm ẩn'}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      Cho phép lọc và hiển thị thương hiệu này trong Mega Menu và trang danh sách
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  disabled={isSubmitting}
                  onClick={() => setShowModal(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : editingBrand ? '💾 Lưu thay đổi' : '➕ Tạo thương hiệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
