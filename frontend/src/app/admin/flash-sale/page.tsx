'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './flashSaleAdmin.module.css';
import {
  FlashSaleCampaign,
  PublishStatus,
  RuntimeStatus,
  CampaignStats,
} from '../../../types/flashSale';
import { flashSaleService } from '../../../services/flashSaleService';
import {
  Flame,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ShoppingBag,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { formatVietnamDateTime } from '../../../utils/dateTime';

function formatVNRange(start?: string, end?: string) {
  if (!start || !end) return 'Chưa có khung giờ';
  try {
    const s = formatVietnamDateTime(start);
    const e = formatVietnamDateTime(end);
    return `${s} → ${e}`;
  } catch {
    return `${start} - ${end}`;
  }
}

function formatCurrency(val?: number) {
  if (!val) return '0 ₫';
  return val.toLocaleString('vi-VN') + ' ₫';
}

export default function AdminFlashSaleListPage() {
  const [campaigns, setCampaigns] = useState<FlashSaleCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CampaignStats>({
    runningCount: 0,
    upcomingCount: 0,
    endedCount: 0,
    draftOrPausedCount: 0,
    totalSoldAll: 0,
    totalRevenueAll: 0,
  });

  // Pagination & Filtering
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [runtimeFilter, setRuntimeFilter] = useState('ALL');
  const [publishFilter, setPublishFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('created_desc');

  // Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', disclaimer: '', publishStatus: 'DRAFT' as PublishStatus });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<FlashSaleCampaign | null>(null);
  const [editForm, setEditForm] = useState({ title: '', disclaimer: '', publishStatus: 'DRAFT' as PublishStatus });

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<FlashSaleCampaign | null>(null);
  const [duplicateForm, setDuplicateForm] = useState({ newTitle: '', shiftDays: 1, copyProducts: true });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FlashSaleCampaign | null>(null);

  const [confirmToggleTarget, setConfirmToggleTarget] = useState<{ campaign: FlashSaleCampaign; nextStatus: PublishStatus } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await flashSaleService.getCampaignsPaginated({
        page,
        size: pageSize,
        sort: sortBy,
        q: searchKeyword,
        runtimeStatus: runtimeFilter,
        publishStatus: publishFilter,
      });

      setCampaigns(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      setStats(res.stats);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Không thể tải danh sách chiến dịch');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, searchKeyword, runtimeFilter, publishFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle Switch publishStatus
  const handleTogglePublish = async (c: FlashSaleCampaign) => {
    const isCurrentlyActive = c.publishStatus === 'ACTIVE';
    const nextStatus: PublishStatus = isCurrentlyActive ? 'PAUSED' : 'ACTIVE';

    // Xác nhận khi tắt campaign đang RUNNING
    if (isCurrentlyActive && c.runtimeStatus === 'RUNNING') {
      setConfirmToggleTarget({ campaign: c, nextStatus });
      return;
    }

    try {
      await flashSaleService.updateCampaignStatus(c.id, nextStatus);
      showToast('success', `Đã chuyển trạng thái chiến dịch thành ${nextStatus}`);
      loadData();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggleTarget) return;
    try {
      await flashSaleService.updateCampaignStatus(confirmToggleTarget.campaign.id, confirmToggleTarget.nextStatus);
      showToast('success', `Đã chuyển chiến dịch sang trạng thái ${confirmToggleTarget.nextStatus}`);
      setConfirmToggleTarget(null);
      loadData();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi cập nhật trạng thái');
    }
  };

  // Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      showToast('error', 'Vui lòng nhập tên chiến dịch');
      return;
    }
    try {
      await flashSaleService.createCampaign({
        title: createForm.title.trim(),
        disclaimer: createForm.disclaimer.trim(),
        publishStatus: createForm.publishStatus,
      });
      showToast('success', 'Tạo chiến dịch Flash Sale thành công!');
      setShowCreateModal(false);
      setCreateForm({ title: '', disclaimer: '', publishStatus: 'DRAFT' });
      loadData();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi tạo chiến dịch');
    }
  };

  // Edit Campaign
  const openEditModal = (c: FlashSaleCampaign) => {
    setEditingCampaign(c);
    setEditForm({
      title: c.title,
      disclaimer: c.disclaimer || c.note || '',
      publishStatus: (c.publishStatus as PublishStatus) || 'DRAFT',
    });
    setShowEditModal(true);
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    try {
      await flashSaleService.updateCampaign(editingCampaign.id, {
        title: editForm.title.trim(),
        disclaimer: editForm.disclaimer.trim(),
        publishStatus: editForm.publishStatus,
      });
      showToast('success', 'Cập nhật chiến dịch thành công!');
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi cập nhật chiến dịch');
    }
  };

  // Duplicate Campaign
  const openDuplicateModal = (c: FlashSaleCampaign) => {
    setDuplicateTarget(c);
    setDuplicateForm({
      newTitle: `${c.title} (Bản sao)`,
      shiftDays: 1,
      copyProducts: true,
    });
    setShowDuplicateModal(true);
  };

  const handleDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateTarget) return;
    try {
      await flashSaleService.duplicateCampaign(duplicateTarget.id, {
        newTitle: duplicateForm.newTitle.trim(),
        shiftDays: Number(duplicateForm.shiftDays) || 0,
        copyProducts: duplicateForm.copyProducts,
      });
      showToast('success', 'Nhân bản chiến dịch thành công! Bản sao ở trạng thái Nháp (DRAFT).');
      setShowDuplicateModal(false);
      loadData();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi nhân bản chiến dịch');
    }
  };

  // Delete Campaign
  const openDeleteModal = (c: FlashSaleCampaign) => {
    setDeleteTarget(c);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await flashSaleService.deleteCampaign(deleteTarget.id);
      showToast('success', 'Xóa chiến dịch thành công!');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Không thể xóa chiến dịch');
    }
  };

  // Helper render runtime badge
  const renderRuntimeBadge = (status?: RuntimeStatus, isPublishedActive?: boolean) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className={`${styles.badge} ${styles.badgeRunning}`} title="Chiến dịch đang có ít nhất 1 khung giờ diễn ra mở bán">
            <span className={styles.badgePulse} /> Đang diễn ra
          </span>
        );
      case 'UPCOMING':
        return (
          <span className={`${styles.badge} ${styles.badgeUpcoming}`} title="Chưa đến giờ mở bán của khung giờ sớm nhất">
            <Clock size={12} /> Sắp diễn ra
          </span>
        );
      case 'WAITING_NEXT':
        return (
          <span className={`${styles.badge} ${styles.badgeWaitingNext}`} title="Đang giữa các slot, vẫn còn khung giờ sắp diễn ra">
            <Clock size={12} /> Chờ slot tiếp
          </span>
        );
      case 'ENDED':
        return (
          <span className={`${styles.badge} ${styles.badgeEnded}`} title="Tất cả khung giờ đã kết thúc">
            Đã kết thúc
          </span>
        );
      case 'NO_SLOT':
      default:
        return (
          <span className={`${styles.badge} ${styles.badgeNoSlot}`} title={isPublishedActive ? "Cảnh báo: Chiến dịch BẬT nhưng chưa thiết lập khung giờ nào!" : "Chưa có khung giờ"}>
            <AlertTriangle size={12} /> Chưa có khung giờ
          </span>
        );
    }
  };

  const renderPublishBadge = (status?: PublishStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className={`${styles.badge} ${styles.badgeActive}`}>ACTIVE</span>;
      case 'PAUSED':
        return <span className={`${styles.badge} ${styles.badgePaused}`}>TẠM DỪNG</span>;
      case 'DRAFT':
      default:
        return <span className={`${styles.badge} ${styles.badgeDraft}`}>NHÁP</span>;
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '14px',
          backdropFilter: 'blur(8px)',
        }}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>
            <Flame color="#e11d48" size={28} />
            Quản Lý Chiến Dịch Flash Sale
          </h1>
          <p>Thiết lập lịch khung giờ, danh sách sản phẩm ưu đãi và giám sát hiệu quả mở bán.</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => loadData()}
            className={`${styles.btn} ${styles.btnSecondary}`}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <Plus size={16} />
            Tạo chiến dịch mới
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
            <Flame size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Đang diễn ra</span>
            <span className={styles.statValue}>{stats.runningCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Clock size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Sắp diễn ra</span>
            <span className={styles.statValue}>{stats.upcomingCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }}>
            <CheckCircle size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Đã kết thúc</span>
            <span className={styles.statValue}>{stats.endedCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
            <Layers size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Nháp / Tạm dừng</span>
            <span className={styles.statValue}>{stats.draftOrPausedCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c' }}>
            <ShoppingBag size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tổng suất đã bán</span>
            <span className={styles.statValue}>{stats.totalSoldAll.toLocaleString('vi-VN')}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <DollarSign size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Doanh thu Flash Sale</span>
            <span className={styles.statValue}>{formatCurrency(stats.totalRevenueAll)}</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className={styles.toolbarCard}>
        <div className={styles.filterGroup}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên hoặc ID chiến dịch..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setPage(0);
              }}
            />
          </div>

          <select
            className={styles.customSelect}
            value={runtimeFilter}
            onChange={(e) => {
              setRuntimeFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="ALL">Tất cả trạng thái chạy</option>
            <option value="RUNNING">Đang diễn ra (RUNNING)</option>
            <option value="UPCOMING">Sắp diễn ra (UPCOMING)</option>
            <option value="WAITING_NEXT">Chờ slot tiếp (WAITING)</option>
            <option value="ENDED">Đã kết thúc (ENDED)</option>
            <option value="NO_SLOT">Chưa có slot (NO_SLOT)</option>
          </select>

          <select
            className={styles.customSelect}
            value={publishFilter}
            onChange={(e) => {
              setPublishFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="ALL">Tất cả cấu hình</option>
            <option value="ACTIVE">ACTIVE (Đang bật)</option>
            <option value="PAUSED">PAUSED (Tạm dừng)</option>
            <option value="DRAFT">DRAFT (Bản nháp)</option>
          </select>

          <select
            className={styles.customSelect}
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(0);
            }}
          >
            <option value="created_desc">Mới nhất trước</option>
            <option value="title_asc">Tên (A → Z)</option>
            <option value="title_desc">Tên (Z → A)</option>
            <option value="start_asc">Thời gian bắt đầu tăng dần</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.mainTable}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th style={{ minWidth: '220px' }}>Tên & Ghi chú</th>
                <th style={{ minWidth: '220px' }}>Khoảng thời gian</th>
                <th>Trạng thái chạy</th>
                <th>Cấu hình</th>
                <th style={{ textAlign: 'center' }}>Số slot</th>
                <th style={{ textAlign: 'center' }}>Sản phẩm</th>
                <th style={{ minWidth: '150px' }}>Đã bán / Quota</th>
                <th>Cập nhật lần cuối</th>
                <th style={{ textAlign: 'right', minWidth: '160px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <RefreshCw className="animate-spin" size={20} />
                      <span>Đang tải dữ liệu chiến dịch...</span>
                    </div>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '48px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                      <AlertTriangle size={36} />
                      <span style={{ fontSize: '15px', fontWeight: 600 }}>Không tìm thấy chiến dịch Flash Sale nào</span>
                      <p style={{ margin: 0, fontSize: '13px' }}>Hãy thử đổi bộ lọc tìm kiếm hoặc tạo một chiến dịch mới.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => {
                  const quota = c.totalQuota || 0;
                  const sold = c.totalSoldQuantity || 0;
                  const percent = quota > 0 ? Math.min(100, Math.round((sold / quota) * 100)) : 0;
                  const isPublishedActive = c.publishStatus === 'ACTIVE';

                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: '#94a3b8' }}>#{c.id}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <Link
                            href={`/admin/flash-sale/${c.id}`}
                            style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}
                            className="hover:underline"
                          >
                            {c.title}
                          </Link>
                          {(c.disclaimer || c.note) && (
                            <span style={{ fontSize: '12px', color: '#64748b', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.disclaimer || c.note}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12.5px', color: '#cbd5e1' }}>
                          {formatVNRange(c.calculatedStartAt || c.startTime, c.calculatedEndAt || c.endTime)}
                        </div>
                      </td>
                      <td>{renderRuntimeBadge(c.runtimeStatus, isPublishedActive)}</td>
                      <td>
                        <div className={styles.switchContainer}>
                          <label className={styles.switch} title={`Nhấn để ${isPublishedActive ? 'Tạm dừng' : 'Bật hoạt động'}`}>
                            <input
                              type="checkbox"
                              checked={isPublishedActive}
                              onChange={() => handleTogglePublish(c)}
                            />
                            <span className={styles.slider} />
                          </label>
                          {renderPublishBadge(c.publishStatus)}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{c.totalSlotsCount || (c.slots ? c.slots.length : 0)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{c.totalProductsCount || (c.products ? c.products.length : 0)}</td>
                      <td>
                        <div className={styles.soldProgressWrapper}>
                          <div className={styles.soldText}>
                            <span style={{ color: '#ffffff' }}>{sold}</span>
                            <span style={{ color: '#64748b' }}>/ {quota}</span>
                            <span style={{ color: '#f97316' }}>({percent}%)</span>
                          </div>
                          <div className={styles.progressBarTrack}>
                            <div className={styles.progressBarFill} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                          <span style={{ color: '#cbd5e1' }}>{c.createdAt ? formatVietnamDateTime(c.createdAt) : '-'}</span>
                          <span style={{ color: '#64748b' }}>Bởi: {c.updatedBy || 'Admin'}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
                          <Link
                            href={`/admin/flash-sale/${c.id}`}
                            className={`${styles.iconBtn} ${styles.iconBtnPrimary}`}
                            title="Quản lý chi tiết lịch & sản phẩm"
                            aria-label="Quản lý chi tiết"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <button
                            onClick={() => openEditModal(c)}
                            className={styles.iconBtn}
                            title="Chỉnh sửa thông tin chung"
                            aria-label="Sửa chiến dịch"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => openDuplicateModal(c)}
                            className={styles.iconBtn}
                            title="Nhân bản chiến dịch sang ngày mới"
                            aria-label="Nhân bản chiến dịch"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(c)}
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            title="Xóa chiến dịch"
                            aria-label="Xóa chiến dịch"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className={styles.paginationBar}>
          <div>
            Hiển thị <b>{campaigns.length}</b> trên tổng số <b>{totalElements}</b> chiến dịch
          </div>
          <div className={styles.pageControls}>
            <select
              className={styles.customSelect}
              style={{ padding: '6px 10px', fontSize: '12px' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
            >
              <option value={10}>10 dòng / trang</option>
              <option value={20}>20 dòng / trang</option>
              <option value={50}>50 dòng / trang</option>
            </select>
            <button
              className={styles.iconBtn}
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              title="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 700, color: '#ffffff', padding: '0 6px' }}>
              Trang {page + 1} / {totalPages || 1}
            </span>
            <button
              className={styles.iconBtn}
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              title="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Tạo mới Campaign */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Tạo Chiến Dịch Flash Sale Mới</h2>
              <button className={styles.iconBtn} onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCampaign}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tên chiến dịch *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="VD: Flash Sale Cuối Tuần Siêu Ưu Đãi"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ghi chú / Điều khoản hiển thị</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="VD: Mỗi khách hàng chỉ được mua tối đa 1 sản phẩm. Số lượng có hạn."
                    value={createForm.disclaimer}
                    onChange={(e) => setCreateForm({ ...createForm, disclaimer: e.target.value })}
                    maxLength={500}
                  />
                  <div className={styles.charCounter}>{createForm.disclaimer.length} / 500 ký tự</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trạng thái cấu hình ban đầu</label>
                  <select
                    className={styles.customSelect}
                    value={createForm.publishStatus}
                    onChange={(e) => setCreateForm({ ...createForm, publishStatus: e.target.value as PublishStatus })}
                  >
                    <option value="DRAFT">Nháp (DRAFT) - Chưa công khai</option>
                    <option value="ACTIVE">Kích hoạt (ACTIVE) - Mở bán theo lịch</option>
                    <option value="PAUSED">Tạm dừng (PAUSED)</option>
                  </select>
                </div>

                <div style={{ background: '#0b0d17', padding: '12px', borderRadius: '8px', fontSize: '12.5px', color: '#94a3b8' }}>
                  <Info size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px', color: '#60a5fa' }} />
                  Thời gian bắt đầu và kết thúc của chiến dịch sẽ được <b>tự động tính</b> từ các khung giờ bạn thiết lập sau khi tạo.
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Tạo chiến dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Chỉnh sửa Campaign */}
      {showEditModal && editingCampaign && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Sửa Chiến Dịch #{editingCampaign.id}</h2>
              <button className={styles.iconBtn} onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateCampaign}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tên chiến dịch *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ghi chú / Điều khoản</label>
                  <textarea
                    className={styles.formTextarea}
                    value={editForm.disclaimer}
                    onChange={(e) => setEditForm({ ...editForm, disclaimer: e.target.value })}
                    maxLength={500}
                  />
                  <div className={styles.charCounter}>{editForm.disclaimer.length} / 500 ký tự</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trạng thái cấu hình</label>
                  <select
                    className={styles.customSelect}
                    value={editForm.publishStatus}
                    onChange={(e) => setEditForm({ ...editForm, publishStatus: e.target.value as PublishStatus })}
                  >
                    <option value="DRAFT">Nháp (DRAFT)</option>
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="PAUSED">Tạm dừng (PAUSED)</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Nhân bản Campaign */}
      {showDuplicateModal && duplicateTarget && (
        <div className={styles.modalOverlay} onClick={() => setShowDuplicateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nhân Bản Chiến Dịch #{duplicateTarget.id}</h2>
              <button className={styles.iconBtn} onClick={() => setShowDuplicateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleDuplicate}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tên chiến dịch mới *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={duplicateForm.newTitle}
                    onChange={(e) => setDuplicateForm({ ...duplicateForm, newTitle: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Dời lịch (Tịnh tiến N ngày cho mọi slot)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    min={0}
                    max={365}
                    value={duplicateForm.shiftDays}
                    onChange={(e) => setDuplicateForm({ ...duplicateForm, shiftDays: Number(e.target.value) })}
                  />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Ví dụ: Nhập <b>1</b> để lùi toàn bộ khung giờ sang ngày mai; nhập <b>7</b> để lùi sang tuần sau.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    id="copyProdCheck"
                    checked={duplicateForm.copyProducts}
                    onChange={(e) => setDuplicateForm({ ...duplicateForm, copyProducts: e.target.checked })}
                  />
                  <label htmlFor="copyProdCheck" style={{ fontSize: '13.5px', color: '#ffffff', cursor: 'pointer' }}>
                    Sao chép toàn bộ sản phẩm trong các khung giờ (lượt đã bán được reset về 0)
                  </label>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowDuplicateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Xác nhận nhân bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Xóa Campaign */}
      {showDeleteModal && deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Xác Nhận Xóa Chiến Dịch
              </h2>
              <button className={styles.iconBtn} onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '14px', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa chiến dịch <b>"{deleteTarget.title}"</b> (ID: #{deleteTarget.id})?
              </p>
              {deleteTarget.totalSoldQuantity && deleteTarget.totalSoldQuantity > 0 ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '12px', borderRadius: '8px', color: '#fca5a5', fontSize: '13px' }}>
                  <b>Không thể xóa cứng:</b> Chiến dịch này đã phát sinh <b>{deleteTarget.totalSoldQuantity}</b> lượt mua thực tế. Quy tắc hệ thống chỉ cho phép chuyển sang trạng thái <b>TẠM DỪNG (PAUSED)</b> để bảo toàn dữ liệu lịch sử đơn hàng.
                </div>
              ) : (
                <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.35)', padding: '12px', borderRadius: '8px', color: '#fef08a', fontSize: '13px' }}>
                  Chiến dịch chưa có lượt mua nào. Thao tác này sẽ xóa vĩnh viễn chiến dịch và tất cả các khung giờ liên quan!
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
              {deleteTarget.totalSoldQuantity && deleteTarget.totalSoldQuantity > 0 ? (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={async () => {
                    await flashSaleService.updateCampaignStatus(deleteTarget.id, 'PAUSED');
                    showToast('success', 'Đã chuyển chiến dịch sang trạng thái TẠM DỪNG.');
                    setShowDeleteModal(false);
                    loadData();
                  }}
                >
                  Chuyển sang TẠM DỪNG
                </button>
              ) : (
                <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDelete}>
                  Xóa vĩnh viễn
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Xác nhận tắt campaign đang RUNNING */}
      {confirmToggleTarget && (
        <div className={styles.modalOverlay} onClick={() => setConfirmToggleTarget(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Xác Nhận Tắt Chiến Dịch Đang Chạy
              </h2>
              <button className={styles.iconBtn} onClick={() => setConfirmToggleTarget(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '14px', lineHeight: 1.5 }}>
                Chiến dịch <b>"{confirmToggleTarget.campaign.title}"</b> hiện <b>ĐANG DIỄN RA (RUNNING)</b> với khách hàng trên website!
              </p>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '12px', borderRadius: '8px', color: '#fde68a', fontSize: '13px' }}>
                Nếu bạn tắt (chuyển sang PAUSED), toàn bộ khối Flash Sale trên trang chủ sẽ ngay lập tức bị ẩn hoặc ngừng áp dụng giá ưu đãi cho người dùng. Bạn có chắc chắn muốn thực hiện?
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setConfirmToggleTarget(null)}>
                Giữ nguyên mở bán
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={handleConfirmToggle}>
                Xác nhận Tắt chiến dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
