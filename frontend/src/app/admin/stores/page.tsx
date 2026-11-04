'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/api';
import { AdminDataTable, StatusBadge, Column, ConfirmDialog } from '../../../components/admin';
import styles from '../adminCrud.module.css';

interface StoreItem {
  warehouseId: number;
  name: string;
  address: string;
  province: string;
  district?: string;
  ward?: string;
  phone?: string;
  openHours?: string;
  isStore: boolean;
  isActive: boolean;
  isRegionalHub?: boolean;
  region?: string;
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalStore, setModalStore] = useState<Partial<StoreItem> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toggleStore, setToggleStore] = useState<StoreItem | null>(null);
  const [deleteStoreItem, setDeleteStoreItem] = useState<StoreItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/stores');
      if (Array.isArray(res.data)) {
        setStores(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách cửa hàng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setModalStore({
      name: '',
      address: '',
      province: 'Hồ Chí Minh',
      district: '',
      ward: '',
      phone: '',
      openHours: '08:00 - 22:00',
      isStore: true,
      isActive: true,
      isRegionalHub: false,
      region: 'Miền Nam',
    });
  };

  const openEditModal = (store: StoreItem) => {
    setIsEditing(true);
    setModalStore({ ...store });
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStore?.name || !modalStore.address || !modalStore.province) {
      setAlert({ type: 'error', message: 'Vui lòng điền đầy đủ tên chi nhánh, địa chỉ và tỉnh/thành' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && modalStore.warehouseId) {
        await apiClient.put(`/admin/stores/${modalStore.warehouseId}`, modalStore);
        setAlert({ type: 'success', message: 'Cập nhật thông tin chi nhánh thành công!' });
      } else {
        await apiClient.post('/admin/stores', modalStore);
        setAlert({ type: 'success', message: 'Thêm mới chi nhánh thành công!' });
      }
      setModalStore(null);
      fetchStores();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin chi nhánh'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleStore) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.put(`/admin/stores/${toggleStore.warehouseId}/toggle-status`);
      setAlert({
        type: 'success',
        message: res.data?.message || 'Cập nhật trạng thái chi nhánh thành công!'
      });
      setToggleStore(null);
      fetchStores();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Không thể đổi trạng thái chi nhánh'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!deleteStoreItem) return;
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/admin/stores/${deleteStoreItem.warehouseId}`);
      setAlert({ type: 'success', message: 'Đã xóa chi nhánh thành công!' });
      setDeleteStoreItem(null);
      fetchStores();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Không thể xóa chi nhánh'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueProvinces = new Set(stores.map((s) => s.province).filter(Boolean)).size;
  const activeStores = stores.filter((s) => s.isActive).length;

  const columns: Column<StoreItem>[] = [
    {
      key: 'warehouseId',
      title: 'Mã',
      width: '80px',
      sortable: true,
      render: (item) => <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>#{item.warehouseId}</span>,
    },
    {
      key: 'name',
      title: 'Tên chi nhánh',
      sortable: true,
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{item.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.address}</div>
        </div>
      ),
    },
    {
      key: 'province',
      title: 'Khu vực',
      width: '160px',
      sortable: true,
      render: (item) => (
        <div>
          <div style={{ color: '#fff', fontWeight: 600 }}>{item.province}</div>
          {item.district && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.district}</div>}
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Hotline',
      width: '130px',
      render: (item) => <span style={{ color: '#cbd5e1' }}>{item.phone || '—'}</span>,
    },
    {
      key: 'openHours',
      title: 'Giờ mở cửa',
      width: '140px',
      render: (item) => <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.openHours || '08:00 - 22:00'}</span>,
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      width: '140px',
      align: 'center',
      render: (item) => (
        <StatusBadge
          status={item.isActive ? 'active' : 'inactive'}
          label={item.isActive ? 'Mở cửa' : 'Tạm đóng'}
          variant={item.isActive ? 'success' : 'danger'}
        />
      ),
    },
    {
      key: 'warehouseId',
      title: 'Hành động',
      width: '180px',
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
            onClick={() => setToggleStore(item)}
            className={item.isActive ? styles.btnDanger : styles.btnSecondary}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
          >
            {item.isActive ? 'Đóng cửa' : 'Mở lại'}
          </button>
          <button
            onClick={() => setDeleteStoreItem(item)}
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
          <h1>Quản lý Hệ thống Cửa hàng & Chi nhánh (Stores)</h1>
          <p>Mạng lưới cửa hàng bán lẻ toàn quốc phục vụ giao nhanh và nhận hàng trực tiếp (Store Pickup)</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnPrimary} onClick={openCreateModal}>
            + Thêm chi nhánh mới
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
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>🏬</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tổng số chi nhánh</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{stores.length} cửa hàng</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>✓</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Đang hoạt động</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{activeStores} cửa hàng</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconInfo}`}>📍</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tỉnh/Thành phố phủ sóng</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{uniqueProvinces} tỉnh thành</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminDataTable
        columns={columns}
        data={stores}
        keyExtractor={(item) => item.warehouseId}
        searchPlaceholder="Tìm theo tên chi nhánh, đường, quận huyện, hotline..."
        searchFields={['name', 'address', 'province', 'district', 'phone']}
        isLoading={isLoading}
        emptyMessage="Chưa có cửa hàng nào được thiết lập"
      />

      {/* Create / Edit Modal */}
      {modalStore && (
        <div className={styles.modalOverlay} onClick={() => setModalStore(null)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditing ? 'Chỉnh sửa chi nhánh' : 'Thêm mới chi nhánh bán lẻ'}
              </h2>
              <button className={styles.modalCloseBtn} onClick={() => setModalStore(null)}>×</button>
            </div>

            <form onSubmit={handleSaveStore}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tên chi nhánh *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="VD: Chi nhánh Nguyễn Thái Học"
                    value={modalStore.name || ''}
                    onChange={(e) => setModalStore({ ...modalStore, name: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Địa chỉ cụ thể *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="VD: 134 Nguyễn Thái Học, P. Phạm Ngũ Lão, Quận 1, TP. HCM"
                    value={modalStore.address || ''}
                    onChange={(e) => setModalStore({ ...modalStore, address: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tỉnh / Thành phố *</label>
                    <input
                      type="text"
                      required
                      className={styles.formInput}
                      placeholder="VD: Hồ Chí Minh, Hà Nội..."
                      value={modalStore.province || ''}
                      onChange={(e) => setModalStore({ ...modalStore, province: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Quận / Huyện</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="VD: Quận 1, Cầu Giấy..."
                      value={modalStore.district || ''}
                      onChange={(e) => setModalStore({ ...modalStore, district: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số điện thoại hotline</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="VD: 02871000134"
                      value={modalStore.phone || ''}
                      onChange={(e) => setModalStore({ ...modalStore, phone: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Giờ mở cửa</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="VD: 08:00 - 22:00"
                      value={modalStore.openHours || '08:00 - 22:00'}
                      onChange={(e) => setModalStore({ ...modalStore, openHours: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Vùng miền</label>
                    <select
                      className={styles.formSelect}
                      value={modalStore.region || 'Miền Nam'}
                      onChange={(e) => setModalStore({ ...modalStore, region: e.target.value })}
                    >
                      <option value="Miền Bắc">Miền Bắc</option>
                      <option value="Miền Trung">Miền Trung</option>
                      <option value="Miền Nam">Miền Nam</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Kho trung chuyển (Hub)?</label>
                    <div style={{ marginTop: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={modalStore.isRegionalHub || false}
                          onChange={(e) => setModalStore({ ...modalStore, isRegionalHub: e.target.checked })}
                        />
                        Là Hub vùng miền
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setModalStore(null)}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo chi nhánh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Toggle Status */}
      <ConfirmDialog
        isOpen={!!toggleStore}
        title={toggleStore?.isActive ? 'Đóng cửa chi nhánh' : 'Mở lại chi nhánh'}
        message={`Bạn có chắc muốn ${toggleStore?.isActive ? 'tạm dừng nhận khách tại' : 'kích hoạt mở cửa lại'} "${toggleStore?.name}"?`}
        confirmText={toggleStore?.isActive ? 'Xác nhận đóng cửa' : 'Mở lại'}
        confirmVariant={toggleStore?.isActive ? 'danger' : 'primary'}
        isLoading={isSubmitting}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleStore(null)}
      />

      {/* Confirm Delete Store */}
      <ConfirmDialog
        isOpen={!!deleteStoreItem}
        title="Xóa chi nhánh cửa hàng"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn chi nhánh "${deleteStoreItem?.name}" (${deleteStoreItem?.address})?`}
        confirmText="Xóa chi nhánh"
        confirmVariant="danger"
        isLoading={isSubmitting}
        onConfirm={handleDeleteStore}
        onCancel={() => setDeleteStoreItem(null)}
      />
    </div>
  );
}
