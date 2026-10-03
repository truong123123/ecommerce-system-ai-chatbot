'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from '../adminCrud.module.css';
import {
  FlashSaleCampaign,
  FlashSaleItem,
  FlashSaleTimeSlot,
  CampaignSlotPayload,
  AddCampaignItemPayload,
} from '../../../types/flashSale';
import { flashSaleService } from '../../../services/flashSaleService';
import { ProductItem } from '../../../services/productService';
import { ProductPickerModal } from '../../../components/admin/ProductPickerModal';
import {
  Flame,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  X,
  Package,
  Layers,
} from 'lucide-react';
import {
  isoToVietnamDateTimeInput,
  vietnamDateTimeInputToIso,
  formatVietnamDateTime,
} from '../../../utils/dateTime';

function formatVNDateOnly(isoStr: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(isoStr));
  } catch {
    return isoStr;
  }
}

function formatVNTimeOnly(isoStr: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(isoStr));
  } catch {
    return isoStr;
  }
}

function formatPrice(v?: number) {
  if (v == null) return '0đ';
  return v.toLocaleString('vi-VN') + 'đ';
}

function getSlotBadge(status?: string) {
  if (status === 'live') {
    return { label: 'Đang diễn ra', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' };
  }
  if (status === 'upcoming') {
    return { label: 'Sắp diễn ra', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
  }
  return { label: 'Đã kết thúc', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
}

function getCampaignBadge(status?: string) {
  switch (status) {
    case 'ACTIVE':
      return { label: 'ACTIVE', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
    case 'UPCOMING':
      return { label: 'UPCOMING', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' };
    case 'ENDED':
      return { label: 'ENDED', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
    case 'INACTIVE':
      return { label: 'INACTIVE', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
    default:
      return { label: status || 'DRAFT', color: '#eab308', bg: 'rgba(234,179,8,0.15)' };
  }
}

export default function AdminFlashSalePage() {
  const [campaigns, setCampaigns] = useState<FlashSaleCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Campaign: Create / Edit
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<FlashSaleCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    disclaimer: '',
    startTime: '',
    endTime: '',
    status: 'ACTIVE',
  });

  // Modal Detail / Manage (Slots & Items)
  const [selectedCampaign, setSelectedCampaign] = useState<FlashSaleCampaign | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTab, setDetailTab] = useState<'slots' | 'products' | 'info'>('slots');

  // Modal Slot: Create / Edit
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<FlashSaleTimeSlot | null>(null);
  const [slotForm, setSlotForm] = useState({
    label: '',
    startTime: '',
    endTime: '',
    isActive: true,
  });

  // Modal Add Item: Product Picker + Price / Quota / Slot form
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [pickedProduct, setPickedProduct] = useState<ProductItem | null>(null);
  const [itemForm, setItemForm] = useState({
    slotId: 0,
    salePrice: '',
    originalPrice: '',
    totalStock: '10',
    maxQuantityPerUser: '1',
  });

  // Modal Edit Item
  const [editingItem, setEditingItem] = useState<FlashSaleItem | null>(null);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editItemForm, setEditItemForm] = useState({
    slotId: 0,
    salePrice: '',
    originalPrice: '',
    totalStock: '10',
    maxQuantityPerUser: '1',
  });

  const showAlertMsg = useCallback((type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4500);
  }, []);

  // 1. Tải danh sách chiến dịch Flash Sale
  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const list = await flashSaleService.getAllCampaigns();
      setCampaigns(list);
    } catch {
      showAlertMsg('error', 'Lỗi khi tải danh sách chiến dịch Flash Sale.');
    } finally {
      setLoading(false);
    }
  }, [showAlertMsg]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Refresh single campaign detail
  const refreshSelectedCampaign = useCallback(async (campaignId: number) => {
    try {
      const updated = await flashSaleService.getCampaignById(campaignId);
      setSelectedCampaign(updated);
      // Cập nhật lại trong danh sách
      setCampaigns((prev) => prev.map((c) => (c.campaignId === campaignId ? updated : c)));
    } catch {
      // ignore
    }
  }, []);

  // Lọc danh sách chiến dịch
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchKeyword =
        !searchKeyword ||
        c.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.campaignId.toString().includes(searchKeyword);

      const matchStatus =
        statusFilter === 'all' ||
        c.computedStatus?.toLowerCase() === statusFilter.toLowerCase() ||
        c.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchKeyword && matchStatus;
    });
  }, [campaigns, searchKeyword, statusFilter]);

  // Thống kê tổng quan từ danh sách thật
  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter(
      (c) => c.isActive && (c.computedStatus === 'ACTIVE' || c.status === 'ACTIVE')
    ).length;
    const totalProds = campaigns.reduce(
      (acc, c) => acc + (c.totalProductsCount ?? c.products?.length ?? 0),
      0
    );
    const totalSold = campaigns.reduce(
      (acc, c) => acc + (c.totalSoldQuantity ?? 0),
      0
    );
    return { total, active, totalProds, totalSold };
  }, [campaigns]);

  // ==========================================
  // CAMPAIGN CRUD ACTIONS
  // ==========================================

  const handleOpenCreateCampaign = () => {
    setEditingCampaign(null);
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setCampaignForm({
      title: 'FLASHSALE TỰU TRƯỜNG',
      disclaimer:
        'Chỉ áp dụng thanh toán online thành công — Mỗi SĐT chỉ được mua 1 sản phẩm cùng loại - Không áp dụng cùng ưu đãi S-Student',
      startTime: isoToVietnamDateTimeInput(now.toISOString()),
      endTime: isoToVietnamDateTimeInput(end.toISOString()),
      status: 'ACTIVE',
    });
    setShowCampaignModal(true);
  };

  const handleOpenEditCampaign = (c: FlashSaleCampaign) => {
    setEditingCampaign(c);
    setCampaignForm({
      title: c.title,
      disclaimer: c.disclaimer || '',
      startTime: isoToVietnamDateTimeInput(c.startTime),
      endTime: isoToVietnamDateTimeInput(c.endTime),
      status: c.status || 'ACTIVE',
    });
    setShowCampaignModal(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.title.trim()) {
      showAlertMsg('error', 'Tên chiến dịch không được để trống.');
      return;
    }
    if (!campaignForm.startTime || !campaignForm.endTime || campaignForm.startTime >= campaignForm.endTime) {
      showAlertMsg('error', 'Thời gian kết thúc phải sau thời gian bắt đầu.');
      return;
    }

    try {
      const payload = {
        title: campaignForm.title.trim(),
        disclaimer: campaignForm.disclaimer.trim(),
        startTime: vietnamDateTimeInputToIso(campaignForm.startTime),
        endTime: vietnamDateTimeInputToIso(campaignForm.endTime),
        status: campaignForm.status,
      };

      if (editingCampaign) {
        await flashSaleService.updateCampaign(editingCampaign.campaignId, payload);
        showAlertMsg('success', `Đã cập nhật chiến dịch #${editingCampaign.campaignId}!`);
      } else {
        await flashSaleService.createCampaign(payload);
        showAlertMsg('success', 'Đã tạo chiến dịch Flash Sale mới thành công!');
      }

      setShowCampaignModal(false);
      loadCampaigns();
    } catch (e: any) {
      showAlertMsg('error', e.response?.data?.message || 'Lỗi khi lưu chiến dịch.');
    }
  };

  const handleToggleCampaignStatus = async (c: FlashSaleCampaign) => {
    const nextStatus = c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await flashSaleService.updateCampaignStatus(c.campaignId, nextStatus);
      showAlertMsg(
        'success',
        `Đã chuyển chiến dịch #${c.campaignId} sang trạng thái ${nextStatus}.`
      );
      loadCampaigns();
    } catch (e: any) {
      showAlertMsg('error', e.response?.data?.message || 'Lỗi thay đổi trạng thái.');
    }
  };

  const handleDeleteCampaign = async (c: FlashSaleCampaign) => {
    if (!confirm(`Bạn có chắc muốn xóa chiến dịch "${c.title}" (#${c.campaignId})?`)) return;
    try {
      await flashSaleService.deleteCampaign(c.campaignId);
      showAlertMsg('success', `Đã xóa chiến dịch #${c.campaignId}.`);
      if (selectedCampaign?.campaignId === c.campaignId) {
        setShowDetailModal(false);
        setSelectedCampaign(null);
      }
      loadCampaigns();
    } catch (e: any) {
      showAlertMsg('error', e.response?.data?.message || 'Không thể xóa chiến dịch.');
    }
  };

  // Mở xem chi tiết campaign (Khung giờ + Sản phẩm)
  const handleOpenDetail = async (c: FlashSaleCampaign, initialTab: 'slots' | 'products' | 'info' = 'slots') => {
    setSelectedCampaign(c);
    setDetailTab(initialTab);
    setShowDetailModal(true);
    refreshSelectedCampaign(c.campaignId);
  };

  // ==========================================
  // SLOT MANAGEMENT ACTIONS (TAB KHUNG GIỜ)
  // ==========================================

  const handleOpenAddSlot = () => {
    if (!selectedCampaign) return;
    setEditingSlot(null);
    const campaignStart = selectedCampaign.startTime ? new Date(selectedCampaign.startTime) : new Date();
    const now = new Date();
    const start = now > campaignStart ? now : campaignStart;
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    setSlotForm({
      label: '',
      startTime: isoToVietnamDateTimeInput(start.toISOString()),
      endTime: isoToVietnamDateTimeInput(end.toISOString()),
      isActive: true,
    });
    setShowSlotModal(true);
  };

  const handleOpenEditSlot = (slot: FlashSaleTimeSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      label: slot.label || '',
      startTime: isoToVietnamDateTimeInput(slot.startTime),
      endTime: isoToVietnamDateTimeInput(slot.endTime),
      isActive: slot.isActive,
    });
    setShowSlotModal(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    if (!slotForm.startTime || !slotForm.endTime) {
      showAlertMsg('error', 'Vui lòng chọn thời gian bắt đầu và kết thúc.');
      return;
    }
    if (slotForm.startTime >= slotForm.endTime) {
      showAlertMsg('error', 'Thời gian kết thúc khung giờ phải sau thời gian bắt đầu.');
      return;
    }

    try {
      const payload: CampaignSlotPayload = {
        label: slotForm.label.trim() || undefined,
        startTime: vietnamDateTimeInputToIso(slotForm.startTime),
        endTime: vietnamDateTimeInputToIso(slotForm.endTime),
        isActive: slotForm.isActive,
      };

      if (editingSlot) {
        await flashSaleService.updateSlot(selectedCampaign.campaignId, editingSlot.id, payload);
        showAlertMsg('success', `Đã cập nhật khung giờ #${editingSlot.id}!`);
      } else {
        await flashSaleService.addSlot(selectedCampaign.campaignId, payload);
        showAlertMsg('success', 'Đã thêm khung giờ mới vào chiến dịch!');
      }

      setShowSlotModal(false);
      refreshSelectedCampaign(selectedCampaign.campaignId);
      loadCampaigns();
    } catch (e: any) {
      showAlertMsg('error', e.response?.data?.message || 'Lỗi khi lưu khung giờ.');
    }
  };

  const handleDeleteSlot = async (slot: FlashSaleTimeSlot) => {
    if (!selectedCampaign) return;
    const count = slot.productCount || 0;
    if (count > 0) {
      showAlertMsg(
        'error',
        `Không thể xóa khung giờ này vì đang có ${count} sản phẩm. Hãy gỡ hoặc chuyển sản phẩm sang khung giờ khác trước.`
      );
      return;
    }
    if (
      !confirm(
        `Xác nhận xóa khung giờ "${slot.label}" (${formatVNTimeOnly(slot.startTime)} - ${formatVNTimeOnly(
          slot.endTime
        )})?`
      )
    ) {
      return;
    }

    try {
      await flashSaleService.deleteSlot(selectedCampaign.campaignId, slot.id);
      showAlertMsg('success', 'Đã xóa khung giờ thành công.');
      refreshSelectedCampaign(selectedCampaign.campaignId);
      loadCampaigns();
    } catch (e: any) {
      showAlertMsg('error', e.response?.data?.message || 'Không thể xóa khung giờ.');
    }
  };

  // ==========================================
  // PRODUCT MANAGEMENT ACTIONS (TAB SẢN PHẨM)
  // ==========================================

  const handleOpenAddProduct = () => {
    if (!selectedCampaign) return;
    const slots = selectedCampaign.timeSlots || [];
    if (slots.length === 0) {
      showAlertMsg(
        'error',
        'Chiến dịch chưa có khung giờ nào! Vui lòng sang tab "Khung giờ" tạo ít nhất 1 khung giờ trước khi thêm sản phẩm.'
      );
      return;
    }
    setPickedProduct(null);
    setShowProductPicker(true);
  };

  const handleProductPicked = (product: ProductItem) => {
    setPickedProduct(product);
    setShowProductPicker(false);

    // Mặc định chọn slot đầu tiên của chiến dịch
    const defaultSlotId = selectedCampaign?.timeSlots?.[0]?.id || 0;
    const origPrice = product.price || product.variants?.[0]?.salePrice || 0;

    setItemForm({
      slotId: defaultSlotId,
      originalPrice: String(origPrice),
      salePrice: origPrice > 0 ? String(Math.round(origPrice * 0.85)) : '',
      totalStock: '10',
      maxQuantityPerUser: '1',
    });
    setShowAddItemModal(true);
  };

  const handleSaveAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !pickedProduct) return;

    const slotId = Number(itemForm.slotId);
    if (!slotId) {
      showAlertMsg('error', 'Vui lòng chọn khung giờ cho sản phẩm.');
      return;
    }

    const salePrice = parseInt(itemForm.salePrice, 10);
    const origPrice = parseInt(itemForm.originalPrice, 10);
    const totalStock = parseInt(itemForm.totalStock, 10);
    const maxPerUser = parseInt(itemForm.maxQuantityPerUser, 10) || 1;

    if (!salePrice || !origPrice || salePrice >= origPrice) {
      showAlertMsg('error', 'Giá Flash Sale phải nhỏ hơn giá gốc và lớn hơn 0.');
      return;
    }
    if (!totalStock || totalStock < 1) {
      showAlertMsg('error', 'Số lượng suất bán (quota) phải lớn hơn 0.');
      return;
    }

    try {
      const payload: AddCampaignItemPayload = {
        productId: pickedProduct.id,
        slotId: slotId,
        salePrice: salePrice,
        totalStock: totalStock,
        maxQuantityPerUser: maxPerUser,
      };

      await flashSaleService.addItem(selectedCampaign.campaignId, payload);
      showAlertMsg('success', `Đã thêm sản phẩm "${pickedProduct.name}" vào khung giờ!`);
      setShowAddItemModal(false);
      setPickedProduct(null);
      refreshSelectedCampaign(selectedCampaign.campaignId);
      loadCampaigns();
    } catch (e: any) {
      showAlertMsg('error', e.response?.data?.message || 'Lỗi khi thêm sản phẩm vào Flash Sale.');
    }
  };

  const handleOpenEditItem = (item: FlashSaleItem) => {
    setEditingItem(item);
    setEditItemForm({
      slotId: item.slotId || selectedCampaign?.timeSlots?.[0]?.id || 0,
      originalPrice: String(item.originalPrice || 0),
      salePrice: String(item.salePrice || 0),
      totalStock: String(item.totalStock || 10),
      maxQuantityPerUser: String(item.maxQuantityPerUser || 1),
    });
    setShowEditItemModal(true);
  };

  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !editingItem) return;

    const salePrice = parseInt(editItemForm.salePrice, 10);
    const origPrice = parseInt(editItemForm.originalPrice, 10);
    const totalStock = parseInt(editItemForm.totalStock, 10);
    const maxPerUser = parseInt(editItemForm.maxQuantityPerUser, 10) || 1;
    const slotId = Number(editItemForm.slotId);

    if (!salePrice || (origPrice && salePrice >= origPrice)) {
      showAlertMsg('error', 'Giá Flash Sale phải nhỏ hơn giá gốc.');
      return;
    }
    if (totalStock < (editingItem.soldCount || 0)) {
      showAlertMsg(
        'error',
        `Số lượng suất bán không được nhỏ hơn số đã bán (${editingItem.soldCount}).`
      );
      return;
    }

    try {
      await flashSaleService.updateItem(editingItem.id, {
        salePrice,
        totalStock,
        maxQuantityPerUser: maxPerUser,
        slotId: slotId || undefined,
      });

      showAlertMsg('success', `Đã cập nhật sản phẩm "${editingItem.name}"!`);
      setShowEditItemModal(false);
      setEditingItem(null);
      refreshSelectedCampaign(selectedCampaign.campaignId);
      loadCampaigns();
    } catch (e: any) {
      showAlertMsg('error', e.response?.data?.message || 'Lỗi khi cập nhật sản phẩm.');
    }
  };

  const handleDeleteItem = async (item: FlashSaleItem) => {
    if (!selectedCampaign) return;
    if (!confirm(`Xóa sản phẩm "${item.name}" khỏi chiến dịch Flash Sale?`)) return;

    try {
      await flashSaleService.removeItem(item.id);
      showAlertMsg('success', `Đã gỡ sản phẩm "${item.name}" khỏi Flash Sale.`);
      refreshSelectedCampaign(selectedCampaign.campaignId);
      loadCampaigns();
    } catch (e: any) {
      showAlertMsg('error', e.response?.data?.message || 'Lỗi khi xóa sản phẩm.');
    }
  };

  return (
    <div className={styles.adminPageContainer}>
      {/* Toast Alert */}
      {alert && (
        <div
          className={`${styles.alertBanner} ${
            alert.type === 'success' ? styles.alertSuccess : styles.alertError
          }`}
          style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, minWidth: '320px' }}
        >
          {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame style={{ color: '#ef4444' }} /> Quản lý Flash Sale
          </h1>
          <p className={styles.pageSubtitle}>
            Thiết lập chiến dịch giờ vàng, quản lý khung giờ (slots), phân bổ sản phẩm và theo dõi suất bán thời gian thực
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={handleOpenCreateCampaign}>
          <Plus size={18} /> Tạo Flash Sale Mới
        </button>
      </div>

      {/* Thống kê Tổng quan (Dữ liệu thật 100% từ Database) */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Flame size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Tổng chiến dịch</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.active}</div>
            <div className={styles.statLabel}>Đang hoạt động (ACTIVE)</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Package size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.totalProds}</div>
            <div className={styles.statLabel}>Sản phẩm tham gia Flash Sale</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.totalSold}</div>
            <div className={styles.statLabel}>Tổng lượt đã bán</div>
          </div>
        </div>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm theo tên chiến dịch hoặc ID..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <select
          className={styles.selectFilter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
          <option value="UPCOMING">Sắp diễn ra (UPCOMING)</option>
          <option value="ENDED">Đã kết thúc (ENDED)</option>
          <option value="INACTIVE">Đã tắt (INACTIVE)</option>
        </select>
      </div>

      {/* Bảng danh sách Chiến dịch */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Đang tải dữ liệu chiến dịch Flash Sale từ máy chủ...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Chưa có chiến dịch Flash Sale nào phù hợp với bộ lọc.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Tên Flash Sale</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Trạng thái</th>
                <th>Số khung giờ</th>
                <th>Sản phẩm</th>
                <th>Đã bán</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((c) => {
                const badge = getCampaignBadge(c.computedStatus || c.status);
                const slotsCount = c.totalSlotsCount ?? c.timeSlots?.length ?? 0;
                const prodsCount = c.totalProductsCount ?? c.products?.length ?? 0;
                const soldCount = c.totalSoldQuantity ?? 0;

                return (
                  <tr key={c.campaignId}>
                    <td style={{ fontWeight: 600, color: '#64748b' }}>#{c.campaignId}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '14px' }}>{c.title}</div>
                      {c.disclaimer && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            maxWidth: '300px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={c.disclaimer}
                        >
                          {c.disclaimer}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {formatVietnamDateTime(c.startTime)}
                    </td>
                    <td style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {formatVietnamDateTime(c.endTime)}
                    </td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{ color: badge.color, backgroundColor: badge.bg }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color: slotsCount > 0 ? '#38bdf8' : '#64748b',
                          background: slotsCount > 0 ? 'rgba(56,189,248,0.1)' : 'transparent',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      >
                        {slotsCount} khung giờ
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{prodsCount}</span>{' '}
                      <span style={{ fontSize: '12px', color: '#64748b' }}>sản phẩm</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#ef4444' }}>{soldCount}</span>{' '}
                      <span style={{ fontSize: '12px', color: '#64748b' }}>suất</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionBtns}>
                        <button
                          className={styles.iconBtn}
                          title="Xem chi tiết / Quản lý khung giờ & sản phẩm"
                          onClick={() => handleOpenDetail(c, 'slots')}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={styles.iconBtn}
                          title="Chỉnh sửa thông tin chiến dịch"
                          onClick={() => handleOpenEditCampaign(c)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className={styles.iconBtn}
                          title={c.status === 'ACTIVE' ? 'Tắt chiến dịch' : 'Bật chiến dịch'}
                          onClick={() => handleToggleCampaignStatus(c)}
                        >
                          {c.status === 'ACTIVE' ? (
                            <CheckCircle size={16} style={{ color: '#22c55e' }} />
                          ) : (
                            <XCircle size={16} style={{ color: '#ef4444' }} />
                          )}
                        </button>
                        <button
                          className={styles.iconBtnDanger}
                          title="Xóa chiến dịch"
                          onClick={() => handleDeleteCampaign(c)}
                        >
                          <Trash2 size={16} />
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

      {/* ============================================================ */}
      {/* MODAL: TẠO / SỬA CHIẾN DỊCH FLASH SALE                       */}
      {/* ============================================================ */}
      {showCampaignModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowCampaignModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingCampaign ? `Sửa Chiến Dịch #${editingCampaign.campaignId}` : 'Tạo Flash Sale Mới'}</h3>
              <button className={styles.iconBtn} onClick={() => setShowCampaignModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCampaign} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tên chiến dịch Flash Sale *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ví dụ: FLASHSALE TỰU TRƯỜNG"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Điều khoản / Ghi chú chính sách</label>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  placeholder="Ví dụ: Chỉ áp dụng thanh toán online thành công — Mỗi SĐT chỉ được mua 1 sản phẩm..."
                  value={campaignForm.disclaimer}
                  onChange={(e) => setCampaignForm((f) => ({ ...f, disclaimer: e.target.value }))}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Thời gian bắt đầu * (Giờ Việt Nam)</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={campaignForm.startTime}
                    onChange={(e) => setCampaignForm((f) => ({ ...f, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Thời gian kết thúc * (Giờ Việt Nam)</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={campaignForm.endTime}
                    onChange={(e) => setCampaignForm((f) => ({ ...f, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Trạng thái chiến dịch</label>
                <select
                  className={styles.select}
                  value={campaignForm.status}
                  onChange={(e) => setCampaignForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="ACTIVE">ACTIVE (Kích hoạt)</option>
                  <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
                  <option value="DRAFT">DRAFT (Bản nháp)</option>
                </select>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowCampaignModal(false)}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {editingCampaign ? 'Lưu thay đổi' : 'Tạo chiến dịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CHI TIẾT: QUẢN LÝ KHUNG GIỜ & SẢN PHẨM CỦA CAMPAIGN    */}
      {/* ============================================================ */}
      {showDetailModal && selectedCampaign && (
        <div className={styles.modalBackdrop} onClick={() => setShowDetailModal(false)}>
          <div
            className={styles.modal}
            style={{ maxWidth: '1000px', width: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame style={{ color: '#ef4444' }} size={20} />
                  {selectedCampaign.title}{' '}
                  <span style={{ fontSize: '13px', color: '#64748b' }}>#{selectedCampaign.campaignId}</span>
                </h3>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Diễn ra từ: {formatVietnamDateTime(selectedCampaign.startTime)} đến{' '}
                  {formatVietnamDateTime(selectedCampaign.endTime)}
                </div>
              </div>
              <button className={styles.iconBtn} onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #1e293b', padding: '0 20px' }}>
              <button
                type="button"
                onClick={() => setDetailTab('slots')}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: detailTab === 'slots' ? '2px solid #38bdf8' : '2px solid transparent',
                  color: detailTab === 'slots' ? '#38bdf8' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Clock size={16} /> Khung giờ ({selectedCampaign.timeSlots?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setDetailTab('products')}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: detailTab === 'products' ? '2px solid #38bdf8' : '2px solid transparent',
                  color: detailTab === 'products' ? '#38bdf8' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Package size={16} /> Sản phẩm ({selectedCampaign.products?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setDetailTab('info')}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: detailTab === 'info' ? '2px solid #38bdf8' : '2px solid transparent',
                  color: detailTab === 'info' ? '#38bdf8' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Layers size={16} /> Thông tin chung
              </button>
            </div>

            {/* TAB CONTENT */}
            <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* ==================================================== */}
              {/* TAB 1: KHUNG GIỜ (SLOTS)                            */}
              {/* ==================================================== */}
              {detailTab === 'slots' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#f8fafc' }}>
                        Danh sách khung giờ (Slots)
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                        Mỗi khung giờ đại diện cho một đợt mở bán Flash Sale với sản phẩm & số lượng riêng biệt
                      </p>
                    </div>
                    <button className={styles.btnPrimary} onClick={handleOpenAddSlot}>
                      <Plus size={16} /> Thêm khung giờ
                    </button>
                  </div>

                  {(!selectedCampaign.timeSlots || selectedCampaign.timeSlots.length === 0) ? (
                    <div
                      style={{
                        padding: '30px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        background: 'rgba(15,23,42,0.6)',
                        borderRadius: '8px',
                      }}
                    >
                      Chiến dịch chưa có khung giờ nào. Hãy bấm <strong>"Thêm khung giờ"</strong> để bắt đầu mở bán!
                    </div>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên / Nhãn</th>
                          <th>Ngày</th>
                          <th>Giờ bắt đầu</th>
                          <th>Giờ kết thúc</th>
                          <th>Trạng thái</th>
                          <th>Số sản phẩm</th>
                          <th style={{ textAlign: 'right' }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCampaign.timeSlots.map((slot) => {
                          const badge = getSlotBadge(slot.status);
                          return (
                            <tr key={slot.id}>
                              <td style={{ color: '#64748b' }}>#{slot.id}</td>
                              <td style={{ fontWeight: 600, color: '#f8fafc' }}>{slot.label}</td>
                              <td>{formatVNDateOnly(slot.startTime)}</td>
                              <td>{formatVNTimeOnly(slot.startTime)}</td>
                              <td>{formatVNTimeOnly(slot.endTime)}</td>
                              <td>
                                <span
                                  className={styles.badge}
                                  style={{ color: badge.color, backgroundColor: badge.bg }}
                                >
                                  {badge.label}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontWeight: 600, color: '#38bdf8' }}>
                                  {slot.productCount || 0}
                                </span>{' '}
                                <span style={{ fontSize: '12px', color: '#64748b' }}>sản phẩm</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div className={styles.actionBtns}>
                                  <button
                                    className={styles.iconBtn}
                                    title="Sửa khung giờ"
                                    onClick={() => handleOpenEditSlot(slot)}
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    className={styles.iconBtnDanger}
                                    title="Xóa khung giờ"
                                    onClick={() => handleDeleteSlot(slot)}
                                  >
                                    <Trash2 size={15} />
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
              )}

              {/* ==================================================== */}
              {/* TAB 2: SẢN PHẨM (GROUPED BY SLOT)                   */}
              {/* ==================================================== */}
              {detailTab === 'products' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#f8fafc' }}>
                        Sản phẩm tham gia Flash Sale
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                        Danh sách sản phẩm được nhóm theo từng khung giờ đã phân bổ
                      </p>
                    </div>
                    <button className={styles.btnPrimary} onClick={handleOpenAddProduct}>
                      <Plus size={16} /> Thêm sản phẩm
                    </button>
                  </div>

                  {(!selectedCampaign.timeSlots || selectedCampaign.timeSlots.length === 0) ? (
                    <div
                      style={{
                        padding: '30px',
                        textAlign: 'center',
                        color: '#eab308',
                        background: 'rgba(234,179,8,0.1)',
                        borderRadius: '8px',
                      }}
                    >
                      <AlertCircle size={24} style={{ marginBottom: '8px' }} />
                      <div>Chiến dịch chưa có khung giờ nào!</div>
                      <div style={{ fontSize: '13px', marginTop: '4px' }}>
                        Vui lòng chuyển sang tab <strong>"Khung giờ"</strong> và tạo khung giờ trước khi thêm sản phẩm.
                      </div>
                    </div>
                  ) : (
                    <div>
                      {selectedCampaign.timeSlots.map((slot) => {
                        const slotProducts = (selectedCampaign.products || []).filter(
                          (p) => p.slotId === slot.id
                        );
                        const badge = getSlotBadge(slot.status);

                        return (
                          <div
                            key={slot.id}
                            style={{
                              marginBottom: '20px',
                              background: '#0f172a',
                              border: '1px solid #1e293b',
                              borderRadius: '10px',
                              overflow: 'hidden',
                            }}
                          >
                            {/* Slot Section Header */}
                            <div
                              style={{
                                padding: '12px 16px',
                                background: '#1e293b',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Clock size={16} style={{ color: '#38bdf8' }} />
                                <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '14px' }}>
                                  Khung giờ: {slot.label} ({formatVNTimeOnly(slot.startTime)} -{' '}
                                  {formatVNTimeOnly(slot.endTime)} ngày {formatVNDateOnly(slot.startTime)})
                                </span>
                                <span
                                  className={styles.badge}
                                  style={{ color: badge.color, backgroundColor: badge.bg, fontSize: '11px' }}
                                >
                                  {badge.label}
                                </span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                <strong>{slotProducts.length}</strong> sản phẩm
                              </span>
                            </div>

                            {/* Products Table in Slot */}
                            {slotProducts.length === 0 ? (
                              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                                Chưa có sản phẩm nào trong khung giờ này. Bấm "+ Thêm sản phẩm" để thêm.
                              </div>
                            ) : (
                              <table className={styles.table}>
                                <thead>
                                  <tr>
                                    <th>Sản phẩm</th>
                                    <th>Giá Flash Sale</th>
                                    <th>Giá gốc</th>
                                    <th>Giảm</th>
                                    <th>Đã bán / Quota</th>
                                    <th>Max/Khách</th>
                                    <th style={{ textAlign: 'right' }}>Hành động</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {slotProducts.map((p) => {
                                    const percent =
                                      p.originalPrice > p.salePrice
                                        ? Math.round(
                                            ((p.originalPrice - p.salePrice) / p.originalPrice) * 100
                                          )
                                        : 0;

                                    return (
                                      <tr key={p.id}>
                                        <td>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={
                                                p.imageUrl ||
                                                'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&q=80'
                                              }
                                              alt={p.name}
                                              style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                              }}
                                            />
                                            <div>
                                              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '13px' }}>
                                                {p.name}
                                              </div>
                                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                Item #{p.id} | Prod #{p.productId}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#ef4444' }}>
                                          {formatPrice(p.salePrice)}
                                        </td>
                                        <td style={{ textDecoration: 'line-through', color: '#64748b' }}>
                                          {formatPrice(p.originalPrice)}
                                        </td>
                                        <td>
                                          <span
                                            style={{
                                              color: '#ef4444',
                                              fontWeight: 700,
                                              fontSize: '12px',
                                            }}
                                          >
                                            -{percent}%
                                          </span>
                                        </td>
                                        <td>
                                          <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                                            {p.soldCount}
                                          </span>{' '}
                                          / {p.totalStock} suất
                                        </td>
                                        <td>{p.maxQuantityPerUser || 1}</td>
                                        <td style={{ textAlign: 'right' }}>
                                          <div className={styles.actionBtns}>
                                            <button
                                              className={styles.iconBtn}
                                              title="Sửa giá / suất bán"
                                              onClick={() => handleOpenEditItem(p)}
                                            >
                                              <Edit2 size={15} />
                                            </button>
                                            <button
                                              className={styles.iconBtnDanger}
                                              title="Gỡ sản phẩm"
                                              onClick={() => handleDeleteItem(p)}
                                            >
                                              <Trash2 size={15} />
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
                        );
                      })}

                      {/* Sản phẩm chưa gắn khung giờ (nếu có) */}
                      {(() => {
                        const unassigned = (selectedCampaign.products || []).filter((p) => !p.slotId);
                        if (unassigned.length === 0) return null;
                        return (
                          <div
                            style={{
                              marginBottom: '20px',
                              background: '#0f172a',
                              border: '1px solid #eab308',
                              borderRadius: '10px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                padding: '12px 16px',
                                background: 'rgba(234,179,8,0.15)',
                                color: '#eab308',
                                fontWeight: 700,
                              }}
                            >
                              Sản phẩm chưa gắn khung giờ ({unassigned.length})
                            </div>
                            <table className={styles.table}>
                              <tbody>
                                {unassigned.map((p) => (
                                  <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{formatPrice(p.salePrice)}</td>
                                    <td>
                                      {p.soldCount}/{p.totalStock}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                      <button className={styles.iconBtn} onClick={() => handleOpenEditItem(p)}>
                                        <Edit2 size={15} /> Gán khung giờ
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 3: THÔNG TIN CHUNG                               */}
              {/* ==================================================== */}
              {detailTab === 'info' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Tên chiến dịch</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                      {selectedCampaign.title}
                    </div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Trạng thái hệ thống</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e', marginTop: '4px' }}>
                      {selectedCampaign.computedStatus || selectedCampaign.status}
                    </div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Thời gian bắt đầu</div>
                    <div style={{ fontSize: '14px', color: '#f8fafc', marginTop: '4px' }}>
                      {formatVietnamDateTime(selectedCampaign.startTime)}
                    </div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Thời gian kết thúc</div>
                    <div style={{ fontSize: '14px', color: '#f8fafc', marginTop: '4px' }}>
                      {formatVietnamDateTime(selectedCampaign.endTime)}
                    </div>
                  </div>
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      background: '#0f172a',
                      padding: '16px',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Điều khoản / Disclaimer</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      {selectedCampaign.disclaimer || 'Không có ghi chú'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: THÊM / SỬA KHUNG GIỜ (SLOT)                           */}
      {/* ============================================================ */}
      {showSlotModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowSlotModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingSlot ? `Sửa Khung Giờ #${editingSlot.id}` : 'Thêm Khung Giờ Mới'}</h3>
              <button className={styles.iconBtn} onClick={() => setShowSlotModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveSlot} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tên / Nhãn khung giờ (tùy chọn - nếu bỏ trống hệ thống tự tạo dạng 09-11h 03/10)
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ví dụ: 09-11h 03/10"
                  value={slotForm.label}
                  onChange={(e) => setSlotForm((f) => ({ ...f, label: e.target.value }))}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giờ bắt đầu *</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm((f) => ({ ...f, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giờ kết thúc *</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm((f) => ({ ...f, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#94a3b8',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={slotForm.isActive}
                    onChange={(e) => setSlotForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  Kích hoạt khung giờ này (hiển thị trên web khi diễn ra)
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowSlotModal(false)}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {editingSlot ? 'Lưu thay đổi' : 'Thêm khung giờ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CHỌN SẢN PHẨM TỪ KHO (Step 1)                          */}
      {/* ============================================================ */}
      <ProductPickerModal
        isOpen={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelectProduct={handleProductPicked}
      />

      {/* ============================================================ */}
      {/* MODAL THIẾT LẬP GIÁ & CHỌN KHUNG GIỜ CHO ITEM (Step 2)       */}
      {/* ============================================================ */}
      {showAddItemModal && pickedProduct && selectedCampaign && (
        <div
          className={styles.modalBackdrop}
          onClick={() => {
            setShowAddItemModal(false);
            setPickedProduct(null);
          }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Thêm sản phẩm vào Flash Sale</h3>
              <button
                className={styles.iconBtn}
                onClick={() => {
                  setShowAddItemModal(false);
                  setPickedProduct(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Thông tin sản phẩm đã chọn */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                padding: '12px',
                background: '#0f172a',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  pickedProduct.primaryImage ||
                  'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&q=80'
                }
                alt={pickedProduct.name}
                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
              />
              <div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '14px' }}>
                  {pickedProduct.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Mã SP: #{pickedProduct.id} | Giá gốc niêm yết: {formatPrice(Number(itemForm.originalPrice))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveAddItem} className={styles.form}>
              {/* CHỌN KHUNG GIỜ (BẮT BUỘC) */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Khung giờ mở bán (bắt buộc) *
                </label>
                <select
                  className={styles.select}
                  value={itemForm.slotId}
                  onChange={(e) => setItemForm((f) => ({ ...f, slotId: Number(e.target.value) }))}
                  required
                >
                  <option value={0} disabled>
                    -- Chọn khung giờ mở bán --
                  </option>
                  {(selectedCampaign.timeSlots || []).map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label} ({formatVNTimeOnly(slot.startTime)} - {formatVNTimeOnly(slot.endTime)} ngày{' '}
                      {formatVNDateOnly(slot.startTime)}) - [{slot.status || 'upcoming'}]
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giá Flash Sale (đ) *</label>
                  <input
                    type="number"
                    className={styles.input}
                    min={1000}
                    placeholder="Nhập giá giảm Flash Sale"
                    value={itemForm.salePrice}
                    onChange={(e) => setItemForm((f) => ({ ...f, salePrice: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giá gốc (đ) *</label>
                  <input
                    type="number"
                    className={styles.input}
                    min={1000}
                    value={itemForm.originalPrice}
                    onChange={(e) => setItemForm((f) => ({ ...f, originalPrice: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {itemForm.salePrice && itemForm.originalPrice && Number(itemForm.salePrice) < Number(itemForm.originalPrice) && (
                <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
                  Giảm:{' '}
                  <strong style={{ color: '#ef4444' }}>
                    -
                    {Math.round(
                      ((+itemForm.originalPrice - +itemForm.salePrice) / +itemForm.originalPrice) * 100
                    )}
                    %
                  </strong>{' '}
                  (tiết kiệm {formatPrice(+itemForm.originalPrice - +itemForm.salePrice)})
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Số lượng suất bán (quota) *</label>
                  <input
                    type="number"
                    className={styles.input}
                    min={1}
                    value={itemForm.totalStock}
                    onChange={(e) => setItemForm((f) => ({ ...f, totalStock: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giới hạn mua / khách</label>
                  <input
                    type="number"
                    className={styles.input}
                    min={1}
                    value={itemForm.maxQuantityPerUser}
                    onChange={(e) => setItemForm((f) => ({ ...f, maxQuantityPerUser: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setShowAddItemModal(false);
                    setPickedProduct(null);
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Thêm vào Flash Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SỬA SẢN PHẨM TRONG KHUNG GIỜ                          */}
      {/* ============================================================ */}
      {showEditItemModal && editingItem && selectedCampaign && (
        <div className={styles.modalBackdrop} onClick={() => setShowEditItemModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Sửa sản phẩm trong Flash Sale</h3>
              <button className={styles.iconBtn} onClick={() => setShowEditItemModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0 0 12px', color: '#f8fafc', fontWeight: 600 }}>
              {editingItem.name}{' '}
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                (Đã bán: {editingItem.soldCount}/{editingItem.totalStock})
              </span>
            </div>

            <form onSubmit={handleSaveEditItem} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Khung giờ</label>
                <select
                  className={styles.select}
                  value={editItemForm.slotId}
                  onChange={(e) => setEditItemForm((f) => ({ ...f, slotId: Number(e.target.value) }))}
                  required
                >
                  {(selectedCampaign.timeSlots || []).map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label} ({formatVNTimeOnly(slot.startTime)} - {formatVNTimeOnly(slot.endTime)})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giá Flash Sale (đ) *</label>
                  <input
                    type="number"
                    className={styles.input}
                    min={1000}
                    value={editItemForm.salePrice}
                    onChange={(e) => setEditItemForm((f) => ({ ...f, salePrice: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giá gốc (đ)</label>
                  <input
                    type="number"
                    className={styles.input}
                    min={1000}
                    value={editItemForm.originalPrice}
                    disabled
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Số lượng suất bán (quota) *</label>
                  <input
                    type="number"
                    className={styles.input}
                    min={editingItem.soldCount || 1}
                    value={editItemForm.totalStock}
                    onChange={(e) => setEditItemForm((f) => ({ ...f, totalStock: e.target.value }))}
                    required
                  />
                  <small style={{ color: '#64748b', fontSize: '11px' }}>
                    Tối thiểu bằng số lượng đã bán ({editingItem.soldCount})
                  </small>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giới hạn / khách</label>
                  <input
                    type="number"
                    className={styles.input}
                    min={1}
                    value={editItemForm.maxQuantityPerUser}
                    onChange={(e) => setEditItemForm((f) => ({ ...f, maxQuantityPerUser: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowEditItemModal(false)}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
