'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/api';
import { AdminDataTable, StatusBadge, Column, ConfirmDialog } from '../../../components/admin';
import { ROLE_LABELS } from '../../../lib/rbac';
import styles from '../adminCrud.module.css';

interface StaffItem {
  staffId: number;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  hiredAt: string;
  lastLoginAt?: string;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Quản trị viên tối cao (Admin)' },
  { value: 'sales', label: 'Nhân viên bán hàng (Sales)' },
  { value: 'warehouse', label: 'Nhân viên kho vận (Warehouse)' },
  { value: 'support', label: 'Chăm sóc khách hàng (Support)' },
  { value: 'accountant', label: 'Kế toán tài chính (Accountant)' },
];

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalStaff, setModalStaff] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toggleStaff, setToggleStaff] = useState<StaffItem | null>(null);
  const [deleteStaffItem, setDeleteStaffItem] = useState<StaffItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/staff');
      if (Array.isArray(res.data)) {
        setStaffList(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách nhân sự:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setModalStaff({
      fullName: '',
      email: '',
      password: '',
      role: 'sales',
      phone: '',
    });
  };

  const openEditModal = (s: StaffItem) => {
    setIsEditing(true);
    setModalStaff({
      staffId: s.staffId,
      fullName: s.fullName,
      email: s.email,
      role: s.role,
      phone: s.phone || '',
      password: '',
    });
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStaff?.fullName || !modalStaff.role) {
      setAlert({ type: 'error', message: 'Vui lòng điền họ tên và chọn vai trò' });
      return;
    }
    if (!isEditing && (!modalStaff.email || !modalStaff.password)) {
      setAlert({ type: 'error', message: 'Vui lòng nhập email và mật khẩu khởi tạo' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await apiClient.put(`/admin/staff/${modalStaff.staffId}`, {
          fullName: modalStaff.fullName,
          role: modalStaff.role,
          phone: modalStaff.phone,
          password: modalStaff.password || undefined,
        });
        setAlert({ type: 'success', message: 'Cập nhật nhân viên thành công!' });
      } else {
        await apiClient.post('/admin/staff', modalStaff);
        setAlert({ type: 'success', message: 'Thêm nhân viên mới thành công!' });
      }
      setModalStaff(null);
      fetchStaff();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhân viên'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleStaff) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.put(`/admin/staff/${toggleStaff.staffId}/toggle-status`);
      setAlert({
        type: 'success',
        message: res.data?.message || 'Cập nhật trạng thái nhân viên thành công!'
      });
      setToggleStaff(null);
      fetchStaff();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Không thể đổi trạng thái nhân viên'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteStaffItem) return;
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/admin/staff/${deleteStaffItem.staffId}`);
      setAlert({ type: 'success', message: 'Đã xóa tài khoản nhân viên thành công!' });
      setDeleteStaffItem(null);
      fetchStaff();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Không thể xóa tài khoản nhân viên'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const adminCount = staffList.filter((s) => s.role === 'admin').length;
  const salesCount = staffList.filter((s) => s.role === 'sales').length;
  const activeCount = staffList.filter((s) => s.isActive).length;

  const columns: Column<StaffItem>[] = [
    {
      key: 'staffId',
      title: 'Mã NV',
      width: '90px',
      sortable: true,
      render: (item) => <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>#NV{item.staffId}</span>,
    },
    {
      key: 'fullName',
      title: 'Họ và tên',
      sortable: true,
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{item.fullName}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Vai trò (RBAC)',
      width: '160px',
      sortable: true,
      render: (item) => {
        const roleKey = item.role?.toLowerCase();
        const label = ROLE_LABELS[roleKey as keyof typeof ROLE_LABELS] || item.role;
        return (
          <span style={{
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: '0.75rem',
            fontWeight: 700,
            background: roleKey === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            color: roleKey === 'admin' ? '#f87171' : '#60a5fa',
            border: `1px solid ${roleKey === 'admin' ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`
          }}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'phone',
      title: 'Điện thoại',
      width: '130px',
      render: (item) => <span style={{ color: '#cbd5e1' }}>{item.phone || '—'}</span>,
    },
    {
      key: 'hiredAt',
      title: 'Ngày tuyển',
      width: '130px',
      sortable: true,
      render: (item) => (
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {item.hiredAt ? new Date(item.hiredAt).toLocaleDateString('vi-VN') : '—'}
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
          label={item.isActive ? 'Hoạt động' : 'Đã khóa'}
          variant={item.isActive ? 'success' : 'danger'}
        />
      ),
    },
    {
      key: 'staffId',
      title: 'Hành động',
      width: '190px',
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
            onClick={() => setToggleStaff(item)}
            className={item.isActive ? styles.btnDanger : styles.btnSecondary}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
          >
            {item.isActive ? 'Khóa' : 'Mở khóa'}
          </button>
          <button
            onClick={() => setDeleteStaffItem(item)}
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
          <h1>Quản trị Nhân sự & Phân quyền (Staff & Permissions)</h1>
          <p>Quản lý tài khoản nội bộ và ủy quyền truy cập 15 phân hệ theo mô hình RBAC chặt chẽ</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnPrimary} onClick={openCreateModal}>
            + Thêm nhân viên mới
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
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>👨‍💼</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tổng nhân viên</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{staffList.length} nhân sự</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>🛡️</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Quản trị viên (Admin)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>{adminCount} người</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconInfo}`}>🛍️</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Kinh doanh (Sales)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{salesCount} người</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>✓</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Đang hoạt động</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{activeCount} tài khoản</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminDataTable
        columns={columns}
        data={staffList}
        keyExtractor={(item) => item.staffId}
        searchPlaceholder="Tìm theo họ tên, email, số điện thoại, vai trò..."
        searchFields={['fullName', 'email', 'phone', 'role']}
        isLoading={isLoading}
        emptyMessage="Chưa có nhân viên nào trong danh sách"
      />

      {/* Modal Add / Edit */}
      {modalStaff && (
        <div className={styles.modalOverlay} onClick={() => setModalStaff(null)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditing ? `Cập nhật nhân viên #${modalStaff.staffId}` : 'Tạo mới tài khoản nhân viên'}
              </h2>
              <button className={styles.modalCloseBtn} onClick={() => setModalStaff(null)}>×</button>
            </div>

            <form onSubmit={handleSaveStaff}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Họ và tên *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="VD: Nguyễn Văn A"
                    value={modalStaff.fullName || ''}
                    onChange={(e) => setModalStaff({ ...modalStaff, fullName: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email đăng nhập *</label>
                  <input
                    type="email"
                    required
                    disabled={isEditing}
                    className={styles.formInput}
                    placeholder="VD: sales@store.com"
                    value={modalStaff.email || ''}
                    onChange={(e) => setModalStaff({ ...modalStaff, email: e.target.value })}
                  />
                  {isEditing && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                      Email tài khoản không được phép thay đổi sau khi tạo
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {isEditing ? 'Mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu khởi tạo *'}
                  </label>
                  <input
                    type="password"
                    required={!isEditing}
                    minLength={6}
                    className={styles.formInput}
                    placeholder={isEditing ? 'Nhập mật khẩu mới...' : 'Tối thiểu 6 ký tự'}
                    value={modalStaff.password || ''}
                    onChange={(e) => setModalStaff({ ...modalStaff, password: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Vai trò (Role RBAC) *</label>
                    <select
                      className={styles.formSelect}
                      value={modalStaff.role || 'sales'}
                      onChange={(e) => setModalStaff({ ...modalStaff, role: e.target.value })}
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số điện thoại</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="VD: 0987654321"
                      value={modalStaff.phone || ''}
                      onChange={(e) => setModalStaff({ ...modalStaff, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setModalStaff(null)}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Lock/Unlock */}
      <ConfirmDialog
        isOpen={!!toggleStaff}
        title={toggleStaff?.isActive ? 'Khóa tài khoản nhân viên' : 'Mở khóa tài khoản nhân viên'}
        message={`Bạn có chắc chắn muốn ${toggleStaff?.isActive ? 'vô hiệu hóa quyền đăng nhập của' : 'mở khóa lại cho'} nhân viên "${toggleStaff?.fullName}" (${toggleStaff?.email})?`}
        confirmText={toggleStaff?.isActive ? 'Xác nhận khóa' : 'Mở khóa'}
        confirmVariant={toggleStaff?.isActive ? 'danger' : 'primary'}
        isLoading={isSubmitting}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleStaff(null)}
      />

      {/* Confirm Delete Staff */}
      <ConfirmDialog
        isOpen={!!deleteStaffItem}
        title="Xóa tài khoản nhân viên"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản nhân viên "${deleteStaffItem?.fullName}" (${deleteStaffItem?.email})? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa tài khoản"
        confirmVariant="danger"
        isLoading={isSubmitting}
        onConfirm={handleDeleteStaff}
        onCancel={() => setDeleteStaffItem(null)}
      />
    </div>
  );
}
