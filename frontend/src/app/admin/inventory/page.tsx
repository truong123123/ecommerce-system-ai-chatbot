'use client';

import React, { useEffect, useState, useMemo } from 'react';
import styles from '../adminCrud.module.css';
import {
  inventoryService,
  InventoryItem,
  WarehouseItem,
  AdjustStockPayload,
  InventoryMovementItem,
} from '../../../services/inventoryService';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Điều chỉnh tồn kho
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustData, setAdjustData] = useState<AdjustStockPayload>({
    warehouseId: 0,
    variantId: 0,
    type: 'IMPORT',
    changeQty: 10,
    reason: 'import',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Lịch sử biến động
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyMovements, setHistoryMovements] = useState<InventoryMovementItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, whData] = await Promise.all([
        inventoryService.getInventory({
          warehouseId: selectedWarehouseId === 'all' ? undefined : selectedWarehouseId,
          status: statusFilter,
          keyword: searchKeyword,
        }),
        inventoryService.getWarehouses(),
      ]);
      setItems(invData);
      setWarehouses(whData);
    } catch {
      showAlert('error', 'Không thể tải dữ liệu tồn kho từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWarehouseId, statusFilter]);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustData({
      warehouseId: item.warehouseId,
      variantId: item.variantId,
      type: 'IMPORT',
      changeQty: 10,
      reason: 'import',
      notes: '',
    });
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustData.changeQty || adjustData.changeQty <= 0) {
      showAlert('error', 'Số lượng phải lớn hơn 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await inventoryService.adjustStock(adjustData);
      setItems((prev) =>
        prev.map((i) =>
          i.warehouseId === updated.warehouseId && i.variantId === updated.variantId ? updated : i
        )
      );
      showAlert('success', `Đã cập nhật tồn kho cho sản phẩm ${selectedItem?.productName || ''}!`);
      setShowAdjustModal(false);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Lỗi khi điều chỉnh tồn kho.';
      showAlert('error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openHistoryModal = async (variantId: number) => {
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const history = await inventoryService.getMovements(variantId);
      setHistoryMovements(history);
    } catch {
      showAlert('error', 'Không thể tải lịch sử biến động.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchKeyword.trim()) return items;
    const kw = searchKeyword.toLowerCase();
    return items.filter(
      (item) =>
        item.productName.toLowerCase().includes(kw) ||
        item.sku.toLowerCase().includes(kw) ||
        item.warehouseName.toLowerCase().includes(kw)
    );
  }, [items, searchKeyword]);

  const inStockCount = items.filter((i) => i.status === 'IN_STOCK').length;
  const lowStockCount = items.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStockCount = items.filter((i) => i.status === 'OUT_OF_STOCK').length;

  return (
    <div className={styles.container}>
      {alert && (
        <div className={`${styles.alert} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý Tồn kho & Kho hàng (Inventory)</h1>
          <p className={styles.subtitle}>
            Giám sát mức tồn kho thực tế, tồn giữ chỗ, xuất nhập kho và lịch sử biến động
          </p>
        </div>
        <button className={styles.btnSecondary} onClick={loadData}>
          <span>🔄</span> Làm mới dữ liệu
        </button>
      </div>

      {/* KPI Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{items.length}</div>
          <div className={styles.statLabel}>Tổng vị trí hàng hóa</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#10b981' }}>
            {inStockCount}
          </div>
          <div className={styles.statLabel}>Còn hàng dồi dào</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#f59e0b' }}>
            {lowStockCount}
          </div>
          <div className={styles.statLabel}>Sắp hết hàng</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#ef4444' }}>
            {outOfStockCount}
          </div>
          <div className={styles.statLabel}>Hết hàng (Out of stock)</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, mã SKU, kho..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={selectedWarehouseId}
            onChange={(e) =>
              setSelectedWarehouseId(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className={styles.select}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="all">Tất cả kho hàng ({warehouses.length})</option>
            {warehouses.map((w) => (
              <option key={w.warehouseId} value={w.warehouseId}>
                {w.name} {w.isStore ? '(Cửa hàng)' : '(Kho tổng)'}
              </option>
            ))}
          </select>

          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${statusFilter === 'ALL' ? styles.filterTabActive : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              Tất cả
            </button>
            <button
              className={`${styles.filterTab} ${statusFilter === 'IN_STOCK' ? styles.filterTabActive : ''}`}
              onClick={() => setStatusFilter('IN_STOCK')}
            >
              Còn hàng
            </button>
            <button
              className={`${styles.filterTab} ${statusFilter === 'LOW_STOCK' ? styles.filterTabActive : ''}`}
              onClick={() => setStatusFilter('LOW_STOCK')}
            >
              Cảnh báo ({lowStockCount})
            </button>
            <button
              className={`${styles.filterTab} ${statusFilter === 'OUT_OF_STOCK' ? styles.filterTabActive : ''}`}
              onClick={() => setStatusFilter('OUT_OF_STOCK')}
            >
              Hết hàng ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingWrapper}>Đang truy vấn dữ liệu kho hàng...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>Không tìm thấy dữ liệu tồn kho nào.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sản phẩm / Biến thể</th>
                <th>Kho hàng</th>
                <th style={{ textAlign: 'center' }}>Tồn thực tế</th>
                <th style={{ textAlign: 'center' }}>Đang giữ chỗ</th>
                <th style={{ textAlign: 'center' }}>Khả dụng bán</th>
                <th style={{ textAlign: 'center' }}>Mức báo động</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={`${item.warehouseId}-${item.variantId}`}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.productName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>SKU: {item.sku}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.warehouseName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.warehouseAddress}</div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                  <td style={{ textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>
                    {item.reservedQty}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color:
                        item.availableQty <= 0
                          ? '#ef4444'
                          : item.availableQty <= item.reorderLevel
                          ? '#f59e0b'
                          : '#10b981',
                    }}
                  >
                    {item.availableQty}
                  </td>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{item.reorderLevel}</td>
                  <td>
                    {item.status === 'OUT_OF_STOCK' ? (
                      <span className={styles.badge} style={{ background: '#ef4444', color: '#fff' }}>
                        Hết hàng
                      </span>
                    ) : item.status === 'LOW_STOCK' ? (
                      <span className={styles.badge} style={{ background: '#f59e0b', color: '#fff' }}>
                        Sắp hết
                      </span>
                    ) : (
                      <span className={styles.badge} style={{ background: '#10b981', color: '#fff' }}>
                        Đủ hàng
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.actionGroup}>
                      <button
                        className={styles.btnSmall}
                        onClick={() => openAdjustModal(item)}
                        title="Điều chỉnh tồn kho"
                      >
                        ⚖️ Điều chỉnh
                      </button>
                      <button
                        className={styles.btnSmall}
                        onClick={() => openHistoryModal(item.variantId)}
                        title="Xem lịch sử biến động"
                      >
                        📋 Lịch sử
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Điều chỉnh tồn kho */}
      {showAdjustModal && selectedItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '550px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Điều chỉnh tồn kho</h2>
              <button className={styles.closeBtn} onClick={() => setShowAdjustModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className={styles.form}>
              <div
                style={{
                  background: '#1e293b',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                }}
              >
                <div>
                  <strong>Sản phẩm:</strong> {selectedItem.productName} ({selectedItem.sku})
                </div>
                <div>
                  <strong>Kho:</strong> {selectedItem.warehouseName}
                </div>
                <div>
                  <strong>Tồn hiện tại:</strong> {selectedItem.quantity} (Giữ chỗ:{' '}
                  {selectedItem.reservedQty} | Khả dụng: {selectedItem.availableQty})
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Loại nghiệp vụ *</label>
                <select
                  value={adjustData.type}
                  onChange={(e) =>
                    setAdjustData({
                      ...adjustData,
                      type: e.target.value as 'IMPORT' | 'EXPORT' | 'ADJUST',
                      reason:
                        e.target.value === 'IMPORT'
                          ? 'import'
                          : e.target.value === 'EXPORT'
                          ? 'export'
                          : 'adjustment',
                    })
                  }
                  className={styles.select}
                >
                  <option value="IMPORT">📥 Nhập kho thêm (IMPORT)</option>
                  <option value="EXPORT">📤 Xuất kho bớt (EXPORT)</option>
                  <option value="ADJUST">🔄 Kiểm kê / Thiết lập số lượng mới (ADJUST)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {adjustData.type === 'ADJUST'
                    ? 'Tổng số lượng thực tế mới sau kiểm kê *'
                    : 'Số lượng thay đổi *'}
                </label>
                <input
                  type="number"
                  required
                  min={adjustData.type === 'ADJUST' ? selectedItem.reservedQty : 1}
                  value={adjustData.changeQty}
                  onChange={(e) => setAdjustData({ ...adjustData, changeQty: Number(e.target.value) })}
                  className={styles.input}
                />
                {adjustData.type === 'EXPORT' && (
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                    Tối đa có thể xuất: {selectedItem.availableQty}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Lý do biến động *</label>
                <select
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  className={styles.select}
                >
                  <option value="import">Nhập hàng mới từ nhà cung cấp (import)</option>
                  <option value="export">Xuất hàng điều chuyển / bán hàng (export)</option>
                  <option value="adjustment">Điều chỉnh sau kiểm kê kho định kỳ (adjustment)</option>
                  <option value="damaged">Hàng hỏng hóc, lỗi hoặc hao hụt (damaged)</option>
                  <option value="return">Khách trả lại hàng (return)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ghi chú nghiệp vụ</label>
                <textarea
                  rows={2}
                  value={adjustData.notes || ''}
                  onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                  placeholder="Ghi chú số phiếu nhập/xuất hoặc lý do cụ thể..."
                  className={styles.textarea}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowAdjustModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" disabled={isSubmitting} className={styles.btnPrimary}>
                  {isSubmitting ? 'Đang lưu...' : 'Xác nhận điều chỉnh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lịch sử biến động */}
      {showHistoryModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '750px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Lịch sử biến động tồn kho (Movements)</h2>
              <button className={styles.closeBtn} onClick={() => setShowHistoryModal(false)}>
                ✕
              </button>
            </div>

            {loadingHistory ? (
              <div className={styles.loadingWrapper}>Đang tải lịch sử...</div>
            ) : historyMovements.length === 0 ? (
              <div className={styles.emptyState}>Chưa có ghi nhận biến động nào cho sản phẩm này.</div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Kho hàng</th>
                      <th>Loại lý do</th>
                      <th style={{ textAlign: 'center' }}>Số lượng</th>
                      <th>Người thực hiện</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyMovements.map((m) => (
                      <tr key={m.movementId}>
                        <td style={{ fontSize: '0.8rem' }}>
                          {new Date(m.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td>{m.warehouseName}</td>
                        <td>
                          <span
                            className={styles.badge}
                            style={{
                              background: '#334155',
                              color: '#e2e8f0',
                              fontSize: '0.75rem',
                            }}
                          >
                            {m.reason}
                          </span>
                        </td>
                        <td
                          style={{
                            textAlign: 'center',
                            fontWeight: 700,
                            color: m.changeQty > 0 ? '#10b981' : '#ef4444',
                          }}
                        >
                          {m.changeQty > 0 ? `+${m.changeQty}` : m.changeQty}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{m.staffName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowHistoryModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
