'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, MapPin } from 'lucide-react';
import { AccountLayout } from '../../../components/account/AccountLayout';
import { accountService, CustomerAddress } from '../../../services/accountService';
import styles from '../account.module.css';

export default function AccountAddressPage() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = () => {
    setLoading(true);
    accountService.getAddresses()
      .then((data) => setAddresses(data))
      .catch((err) => console.error('Fetch addresses error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setReceiverName('');
    setReceiverPhone('');
    setProvince('Hồ Chí Minh');
    setDistrict('Quận 1');
    setWard('Phường Bến Nghé');
    setStreetAddress('');
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: CustomerAddress) => {
    setEditingId(addr.id);
    setReceiverName(addr.receiverName);
    setReceiverPhone(addr.receiverPhone);
    setProvince(addr.province);
    setDistrict(addr.district);
    setWard(addr.ward || '');
    setStreetAddress(addr.streetAddress);
    setIsDefault(addr.isDefault);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim() || !receiverPhone.trim() || !streetAddress.trim()) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        province: province.trim(),
        district: district.trim(),
        ward: ward.trim(),
        streetAddress: streetAddress.trim(),
        isDefault
      };

      if (editingId) {
        await accountService.updateAddress(editingId, payload);
      } else {
        await accountService.addAddress(payload);
      }

      setIsModalOpen(false);
      fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await accountService.deleteAddress(id);
      fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa địa chỉ.');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await accountService.setDefaultAddress(id);
      fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể đặt làm mặc định.');
    }
  };

  return (
    <AccountLayout
      title="Sổ địa chỉ nhận hàng"
      actionButton={
        <button type="button" className={styles.primaryBtn} onClick={openAddModal}>
          <Plus size={16} /> Thêm địa chỉ mới
        </button>
      }
    >
      {loading ? (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải danh sách địa chỉ...</p>
      ) : addresses.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', background: 'var(--color-bg-page)', borderRadius: '10px' }}>
          <MapPin size={40} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '15px', color: '#4b5563', fontWeight: 600 }}>Chưa có địa chỉ nào</p>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            Thêm địa chỉ giao hàng để thanh toán nhanh hơn trong các đơn hàng tới.
          </p>
          <button type="button" className={styles.primaryBtn} onClick={openAddModal} style={{ marginTop: '16px' }}>
            <Plus size={16} /> Thêm địa chỉ ngay
          </button>
        </div>
      ) : (
        addresses.map((addr) => (
          <div key={addr.id} className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ''}`}>
            {addr.isDefault && <span className={styles.defaultBadge}>Mặc định</span>}

            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-title)' }}>
              {addr.receiverName}
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>{addr.receiverPhone}</span>
            </div>

            <div style={{ fontSize: '13px', color: '#4b5563', margin: '8px 0 14px', lineHeight: '1.4' }}>
              {addr.fullAddress}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => openEditModal(addr)}
              >
                <Edit2 size={13} /> Chỉnh sửa
              </button>

              {!addr.isDefault && (
                <>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    <Check size={13} /> Đặt làm mặc định
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                    onClick={() => handleDelete(addr.id)}
                  >
                    <Trash2 size={13} /> Xóa
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-title)' }}>
                {editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ nhận hàng'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Tên người nhận *</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    className={styles.inputField}
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="0987654321"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Tỉnh / Thành phố *</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Hồ Chí Minh"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Quận / Huyện *</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Quận 1"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Phường / Xã</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Phường Bến Nghé"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Số nhà, tên đường *</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="123 Đường Lê Lợi"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 20px' }}>
                <input
                  type="checkbox"
                  id="isDefaultAddr"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <label htmlFor="isDefaultAddr" style={{ fontSize: '13px', color: 'var(--color-text-title)', cursor: 'pointer' }}>
                  Đặt làm địa chỉ nhận hàng mặc định
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                  {submitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
