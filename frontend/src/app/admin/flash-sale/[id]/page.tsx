'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from '../flashSaleAdmin.module.css';
import {
  FlashSaleCampaign,
  FlashSaleSlot,
  FlashSaleProduct,
  PublishStatus,
  FlashSaleReport,
  FlashSaleAuditLog,
  BulkCreateSlotsPayload,
  AddSlotProductsBatchPayload,
} from '../../../../types/flashSale';
import { flashSaleService } from '../../../../services/flashSaleService';
import { productService, ProductItem } from '../../../../services/productService';
import {
  formatVietnamDateTime,
  isoToVietnamDateTimeInput,
  vietnamDateTimeInputToIso,
} from '../../../../utils/dateTime';
import {
  Flame,
  ArrowLeft,
  Calendar,
  FileText,
  BarChart3,
  History,
  Eye,
  Save,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Search,
  RefreshCw,
} from 'lucide-react';
import { FlashSaleCountdown } from '../../../../components/home/FlashSaleCountdown';

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

function formatPrice(val?: number) {
  if (val == null) return '0 ₫';
  return val.toLocaleString('vi-VN') + ' ₫';
}

function getDayString(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function getHourMinute(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '';
  }
}

export default function AdminFlashSaleDetailPage() {
  const params = useParams();
  const campaignId = Number(params.id);

  const [campaign, setCampaign] = useState<FlashSaleCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'slots' | 'general' | 'report' | 'audit'>('slots');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Tab General Form
  const [generalForm, setGeneralForm] = useState({
    title: '',
    disclaimer: '',
    publishStatus: 'DRAFT' as PublishStatus,
  });

  // Tab Report & Audit
  const [report, setReport] = useState<FlashSaleReport | null>(null);
  const [auditLogs, setAuditLogs] = useState<FlashSaleAuditLog[]>([]);

  // Modals
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [slotCreateMode, setSlotCreateMode] = useState<'single' | 'bulk'>('single');
  const [singleSlotForm, setSingleSlotForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '11:00',
    label: '',
  });

  const [bulkSlotForm, setBulkSlotForm] = useState<BulkCreateSlotsPayload>({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    dailyStartTime: '09:00',
    dailyEndTime: '21:00',
    slotDurationMinutes: 120,
    breakMinutes: 0,
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    dryRun: true,
  });
  const [bulkPreview, setBulkPreview] = useState<{ slots: FlashSaleSlot[]; warnings: string[] } | null>(null);

  // Edit Slot modal
  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<FlashSaleSlot | null>(null);
  const [editSlotForm, setEditSlotForm] = useState({
    startTimeInput: '',
    endTimeInput: '',
    label: '',
  });

  // Duplicate Slot modal
  const [showDuplicateSlotModal, setShowDuplicateSlotModal] = useState(false);
  const [duplicateSlotTarget, setDuplicateSlotTarget] = useState<FlashSaleSlot | null>(null);
  const [duplicateSlotTargetDate, setDuplicateSlotTargetDate] = useState(new Date().toISOString().slice(0, 10));

  // Copy products from slot modal
  const [showCopyProductsModal, setShowCopyProductsModal] = useState(false);
  const [copyTargetSlotId, setCopyTargetSlotId] = useState<number | null>(null);
  const [copySourceSlotId, setCopySourceSlotId] = useState<number | null>(null);

  // Add Product to Slot Modal (multi select + bulk setup)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [addProductSlotId, setAddProductSlotId] = useState<number | null>(null);
  const [allStoreProducts, setAllStoreProducts] = useState<ProductItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState<number>(20);
  const [bulkQuota, setBulkQuota] = useState<number>(10);
  const [productStep, setProductStep] = useState<'select' | 'configure'>('select');
  const [configuringItems, setConfiguringItems] = useState<
    Array<{
      product: ProductItem;
      salePrice: number;
      originalPrice: number;
      discountPercent: number;
      quota: number;
      maxQuantityPerUser: number;
    }>
  >([]);

  // Preview Simulator Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [simulatedTimeMode, setSimulatedTimeMode] = useState<'upcoming' | 'running' | 'waiting' | 'ended' | 'custom'>('running');
  const [customSimulatedTime, setCustomSimulatedTime] = useState<string>(new Date().toISOString().slice(0, 16));

  // Accordion collapsed state for days
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const loadCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const data = await flashSaleService.getCampaignById(campaignId);
      setCampaign(data);
      setGeneralForm({
        title: data.title,
        disclaimer: data.disclaimer || data.note || '',
        publishStatus: (data.publishStatus as PublishStatus) || 'DRAFT',
      });
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Không thể tải thông tin chiến dịch');
    } finally {
      setLoading(false);
    }
  }, [campaignId, showToast]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  // Load report / audit when tab clicked
  useEffect(() => {
    if (activeTab === 'report' && campaignId) {
      flashSaleService.getCampaignReport(campaignId).then(setReport).catch(console.error);
    } else if (activeTab === 'audit' && campaignId) {
      flashSaleService.getCampaignAuditLogs(campaignId).then(setAuditLogs).catch(console.error);
    }
  }, [activeTab, campaignId]);

  // Save General Info
  const handleSaveGeneral = async () => {
    if (!campaign) return;
    try {
      setIsSaving(true);
      const updated = await flashSaleService.updateCampaign(campaign.id, {
        title: generalForm.title.trim(),
        disclaimer: generalForm.disclaimer.trim(),
        publishStatus: generalForm.publishStatus,
      });
      setCampaign(updated);
      showToast('success', 'Lưu thông tin chiến dịch thành công!');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi khi lưu thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publishStatus
  const handleTogglePublish = async () => {
    if (!campaign) return;
    const nextStatus: PublishStatus = campaign.publishStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await flashSaleService.updateCampaignStatus(campaign.id, nextStatus);
      showToast('success', `Đã chuyển trạng thái sang ${nextStatus}`);
      loadCampaign();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  // Group slots by day
  const groupedSlots = useMemo(() => {
    if (!campaign || !campaign.slots) return [];
    const map = new Map<string, FlashSaleSlot[]>();

    campaign.slots.forEach((s) => {
      const dayKey = getDayString(s.start || s.startTime);
      if (!map.has(dayKey)) {
        map.set(dayKey, []);
      }
      map.get(dayKey)!.push(s);
    });

    return Array.from(map.entries()).map(([day, slots]) => {
      const totalProds = slots.reduce((acc, s) => acc + (s.products ? s.products.length : 0), 0);
      const totalSold = slots.reduce((acc, s) => acc + (s.totalSold || 0), 0);
      const isPast = slots.every((s) => s.status === 'ended');
      return { day, slots, totalProds, totalSold, isPast };
    });
  }, [campaign]);

  // Check for slot overlaps within campaign
  const slotConflicts = useMemo(() => {
    if (!campaign || !campaign.slots) return new Map<number, string>();
    const conflictMap = new Map<number, string>();
    const slots = campaign.slots;

    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const s1 = slots[i];
        const s2 = slots[j];
        if (!s1.start || !s1.end || !s2.start || !s2.end) continue;
        const start1 = new Date(s1.start).getTime();
        const end1 = new Date(s1.end).getTime();
        const start2 = new Date(s2.start).getTime();
        const end2 = new Date(s2.end).getTime();

        if (start1 < end2 && end1 > start2) {
          conflictMap.set(s1.id, `Trùng giờ với slot [${s2.label || s2.id}] (${getHourMinute(s2.start)} - ${getHourMinute(s2.end)})`);
          conflictMap.set(s2.id, `Trùng giờ với slot [${s1.label || s1.id}] (${getHourMinute(s1.start)} - ${getHourMinute(s1.end)})`);
        }
      }
    }
    return conflictMap;
  }, [campaign]);

  // Single Slot Creation
  const handleCreateSingleSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startIso = vietnamDateTimeInputToIso(`${singleSlotForm.date}T${singleSlotForm.startTime}`);
      const endIso = vietnamDateTimeInputToIso(`${singleSlotForm.date}T${singleSlotForm.endTime}`);

      if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
        showToast('error', 'Thời gian kết thúc phải sau thời gian bắt đầu!');
        return;
      }

      await flashSaleService.addSlot(campaignId, {
        startTime: startIso,
        endTime: endIso,
        label: singleSlotForm.label.trim() || undefined,
        isActive: true,
      });

      showToast('success', 'Thêm khung giờ thành công!');
      setShowAddSlotModal(false);
      loadCampaign();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi thêm khung giờ');
    }
  };

  // Bulk Slot Preview / Commit
  const handleBulkSlotAction = async (commit: boolean) => {
    try {
      const payload: BulkCreateSlotsPayload = {
        ...bulkSlotForm,
        dryRun: !commit,
      };

      const res = await flashSaleService.bulkCreateSlots(campaignId, payload);
      if (!commit) {
        setBulkPreview({ slots: res.slots, warnings: res.warnings });
        showToast('success', `Đã tạo bản xem trước: ${res.totalSlots} khung giờ.`);
      } else {
        showToast('success', `Đã tạo hàng loạt ${res.totalSlots} khung giờ thành công!`);
        setShowAddSlotModal(false);
        setBulkPreview(null);
        loadCampaign();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi tạo khung giờ hàng loạt');
    }
  };

  // Edit Slot
  const openEditSlot = (s: FlashSaleSlot) => {
    setEditingSlot(s);
    setEditSlotForm({
      startTimeInput: isoToVietnamDateTimeInput(s.start || s.startTime),
      endTimeInput: isoToVietnamDateTimeInput(s.end || s.endTime),
      label: s.label || '',
    });
    setShowEditSlotModal(true);
  };

  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    try {
      const startIso = vietnamDateTimeInputToIso(editSlotForm.startTimeInput);
      const endIso = vietnamDateTimeInputToIso(editSlotForm.endTimeInput);

      await flashSaleService.updateSlot(campaignId, editingSlot.id, {
        startTime: startIso,
        endTime: endIso,
        label: editSlotForm.label.trim() || undefined,
      });

      showToast('success', 'Cập nhật khung giờ thành công!');
      setShowEditSlotModal(false);
      loadCampaign();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Không thể cập nhật khung giờ');
    }
  };

  // Duplicate Slot
  const openDuplicateSlot = (s: FlashSaleSlot) => {
    setDuplicateSlotTarget(s);
    setDuplicateSlotTargetDate(new Date().toISOString().slice(0, 10));
    setShowDuplicateSlotModal(true);
  };

  const handleDuplicateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateSlotTarget) return;
    try {
      const origStart = new Date(duplicateSlotTarget.start || duplicateSlotTarget.startTime);
      const hours = String(origStart.getUTCHours() + 7).padStart(2, '0'); // Approx VN time hour
      const mins = String(origStart.getUTCMinutes()).padStart(2, '0');
      const targetTimeIso = vietnamDateTimeInputToIso(`${duplicateSlotTargetDate}T${hours}:${mins}`);

      await flashSaleService.duplicateSlot(campaignId, duplicateSlotTarget.id, targetTimeIso);
      showToast('success', 'Nhân bản khung giờ sang ngày mới thành công!');
      setShowDuplicateSlotModal(false);
      loadCampaign();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi nhân bản khung giờ');
    }
  };

  // Delete Slot
  const handleDeleteSlot = async (slotId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khung giờ này?')) return;
    try {
      await flashSaleService.deleteSlot(campaignId, slotId);
      showToast('success', 'Xóa khung giờ thành công!');
      loadCampaign();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Không thể xóa khung giờ');
    }
  };

  // Copy products from slot
  const openCopyProducts = (targetSlotId: number) => {
    setCopyTargetSlotId(targetSlotId);
    setCopySourceSlotId(null);
    setShowCopyProductsModal(true);
  };

  const handleCopyProducts = async () => {
    if (!copyTargetSlotId || !copySourceSlotId) return;
    try {
      await flashSaleService.copyProductsFromSlot(campaignId, copyTargetSlotId, copySourceSlotId);
      showToast('success', 'Sao chép sản phẩm sang khung giờ đích thành công!');
      setShowCopyProductsModal(false);
      loadCampaign();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi sao chép sản phẩm');
    }
  };

  // Add Products to Slot (Batch flow)
  const openAddProducts = async (slotId: number) => {
    setAddProductSlotId(slotId);
    setSelectedProductIds([]);
    setProductStep('select');
    setShowAddProductModal(true);

    try {
      const prods = await productService.fetchProducts({ limit: 100 });
      setAllStoreProducts(prods);
    } catch (e) {
      console.error(e);
    }
  };

  const currentSlotProducts = useMemo(() => {
    if (!campaign || !addProductSlotId) return [];
    const slot = campaign.slots.find((s) => s.id === addProductSlotId);
    return slot?.products || [];
  }, [campaign, addProductSlotId]);

  const availableStoreProducts = useMemo(() => {
    const existingIds = new Set(currentSlotProducts.map((p) => p.productId));
    return allStoreProducts.filter((p) => !existingIds.has(p.id));
  }, [allStoreProducts, currentSlotProducts]);

  const filteredStoreProducts = useMemo(() => {
    if (!productSearch.trim()) return availableStoreProducts;
    const q = productSearch.toLowerCase();
    return availableStoreProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.variants && p.variants.some((v) => v.sku.toLowerCase().includes(q)))
    );
  }, [availableStoreProducts, productSearch]);

  const handleProceedToConfigure = () => {
    if (selectedProductIds.length === 0) {
      showToast('error', 'Vui lòng chọn ít nhất 1 sản phẩm!');
      return;
    }
    const selected = allStoreProducts.filter((p) => selectedProductIds.includes(p.id));
    const items = selected.map((prod) => {
      const origPrice = prod.price || 1000000;
      const discount = bulkDiscountPercent;
      const sale = Math.round(origPrice * (1 - discount / 100));
      return {
        product: prod,
        originalPrice: origPrice,
        salePrice: sale,
        discountPercent: discount,
        quota: bulkQuota,
        maxQuantityPerUser: 1,
      };
    });
    setConfiguringItems(items);
    setProductStep('configure');
  };

  const handleApplyBulkSettings = () => {
    setConfiguringItems((prev) =>
      prev.map((item) => {
        const discount = bulkDiscountPercent;
        const sale = Math.round(item.originalPrice * (1 - discount / 100));
        return {
          ...item,
          discountPercent: discount,
          salePrice: sale,
          quota: bulkQuota,
        };
      })
    );
  };

  const handleCommitAddProducts = async () => {
    if (!addProductSlotId) return;
    try {
      const payload: AddSlotProductsBatchPayload = {
        items: configuringItems.map((item) => ({
          productId: item.product.id,
          salePrice: item.salePrice,
          originalPrice: item.originalPrice,
          discountPercent: item.discountPercent,
          totalStock: item.quota,
          maxQuantityPerUser: item.maxQuantityPerUser,
        })),
      };

      await flashSaleService.addProductsBatchToSlot(campaignId, addProductSlotId, payload);
      showToast('success', `Đã thêm ${configuringItems.length} sản phẩm vào khung giờ!`);
      setShowAddProductModal(false);
      loadCampaign();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi thêm sản phẩm vào khung giờ');
    }
  };

  // Inline Product Edits
  const handleInlineProductUpdate = async (item: FlashSaleProduct, newValues: { salePrice?: number; discountPercent?: number; quota?: number }) => {
    try {
      let finalPrice = newValues.salePrice !== undefined ? newValues.salePrice : item.salePrice;
      if (newValues.discountPercent !== undefined && newValues.discountPercent >= 0) {
        finalPrice = Math.round(item.originalPrice * (1 - newValues.discountPercent / 100));
      }

      const finalQuota = newValues.quota !== undefined ? newValues.quota : item.quota;

      if (finalPrice <= 0 || finalPrice >= item.originalPrice) {
        showToast('error', 'Giá Flash Sale phải lớn hơn 0 và nhỏ hơn giá gốc!');
        return;
      }
      if (finalQuota < (item.sold || 0)) {
        showToast('error', `Số suất không được nhỏ hơn số lượng đã bán (${item.sold})!`);
        return;
      }

      await flashSaleService.updateItem(item.id, {
        salePrice: finalPrice,
        totalStock: finalQuota,
      });

      showToast('success', 'Đã cập nhật sản phẩm.');
      loadCampaign();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi cập nhật sản phẩm');
    }
  };

  // Remove product from slot
  const handleRemoveProduct = async (item: FlashSaleProduct) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${item.name}" khỏi khung giờ?`)) return;
    try {
      await flashSaleService.removeItem(item.id);
      showToast('success', 'Đã xóa sản phẩm.');
      loadCampaign();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  // Reorder product
  const handleReorderProduct = async (slot: FlashSaleSlot, index: number, direction: 'up' | 'down') => {
    const prods = [...slot.products];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= prods.length) return;

    const temp = prods[index];
    prods[index] = prods[targetIndex];
    prods[targetIndex] = temp;

    try {
      await flashSaleService.reorderSlotProducts(campaignId, slot.id, prods.map((p) => p.id));
      loadCampaign();
    } catch (e) {
      console.error(e);
    }
  };

  // Preview Simulator calculation
  const simulatedTimeMs = useMemo(() => {
    if (!campaign || !campaign.slots || campaign.slots.length === 0) return Date.now();
    const sorted = [...campaign.slots].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const firstStart = new Date(sorted[0].start).getTime();
    const lastEnd = new Date(sorted[sorted.length - 1].end).getTime();

    switch (simulatedTimeMode) {
      case 'upcoming':
        return firstStart - 3600000; // 1 giờ trước slot sớm nhất
      case 'running':
        return firstStart + 1800000; // 30 phút sau khi slot 1 bắt đầu
      case 'waiting':
        if (sorted.length > 1) {
          const s1End = new Date(sorted[0].end).getTime();
          const s2Start = new Date(sorted[1].start).getTime();
          return (s1End + s2Start) / 2; // Giữa slot 1 và slot 2
        }
        return firstStart + 3600000;
      case 'ended':
        return lastEnd + 3600000; // 1 giờ sau slot cuối
      case 'custom':
      default:
        return new Date(customSimulatedTime).getTime() || Date.now();
    }
  }, [campaign, simulatedTimeMode, customSimulatedTime]);

  if (loading && !campaign) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#94a3b8' }}>
        <RefreshCw className="animate-spin" size={24} style={{ marginRight: '10px' }} />
        <span>Đang tải thông tin chiến dịch Flash Sale...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={styles.pageWrapper}>
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          <h2>Không tìm thấy chiến dịch Flash Sale #{campaignId}</h2>
          <Link href="/admin/flash-sale" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: '20px' }}>
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const isPublishedActive = campaign.publishStatus === 'ACTIVE';

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
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
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Detail Header Bar */}
      <div className={styles.detailHeaderBar}>
        <div className={styles.detailTitleArea}>
          <Link href="/admin/flash-sale" className={styles.backBtn} title="Quay lại danh sách">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
                {campaign.title}
              </h1>
              {campaign.runtimeStatus === 'RUNNING' && (
                <span className={`${styles.badge} ${styles.badgeRunning}`}>
                  <span className={styles.badgePulse} /> Đang diễn ra
                </span>
              )}
              {campaign.runtimeStatus === 'UPCOMING' && (
                <span className={`${styles.badge} ${styles.badgeUpcoming}`}>Sắp diễn ra</span>
              )}
              {campaign.runtimeStatus === 'WAITING_NEXT' && (
                <span className={`${styles.badge} ${styles.badgeWaitingNext}`}>Chờ slot tiếp</span>
              )}
              {campaign.runtimeStatus === 'ENDED' && (
                <span className={`${styles.badge} ${styles.badgeEnded}`}>Đã kết thúc</span>
              )}
              {campaign.runtimeStatus === 'NO_SLOT' && (
                <span className={`${styles.badge} ${styles.badgeNoSlot}`}>Chưa có khung giờ</span>
              )}
              <span className={`${styles.badge} ${isPublishedActive ? styles.badgeActive : styles.badgePaused}`}>
                {campaign.publishStatus}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              Thời gian: <b>{formatVNRange(campaign.calculatedStartAt, campaign.calculatedEndAt)}</b> (tự động tính từ các slot)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleTogglePublish}
            className={`${styles.btn} ${isPublishedActive ? styles.btnSecondary : styles.btnSuccess}`}
          >
            {isPublishedActive ? 'Tạm dừng chiến dịch' : 'Kích hoạt mở bán'}
          </button>

          <button
            onClick={() => setShowPreviewModal(true)}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <Eye size={16} /> Xem trước
          </button>

          {activeTab === 'general' && (
            <button
              onClick={handleSaveGeneral}
              disabled={isSaving}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className={styles.tabsBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'slots' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('slots')}
        >
          <Calendar size={17} /> Lịch & Sản phẩm ({campaign.slots ? campaign.slots.length : 0} slot)
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'general' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <FileText size={17} /> Thông tin chung
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'report' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <BarChart3 size={17} /> Báo cáo hiệu quả
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'audit' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <History size={17} /> Lịch sử thay đổi
        </button>
      </div>

      {/* TAB 1: LỊCH & SẢN PHẨM */}
      {activeTab === 'slots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
              Các khung giờ được nhóm theo ngày. Mỗi khung giờ chứa danh sách sản phẩm và mức giá ưu đãi tương ứng.
            </div>
            <button
              onClick={() => {
                setShowAddSlotModal(true);
                setBulkPreview(null);
              }}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              <Plus size={16} /> Thêm khung giờ
            </button>
          </div>

          {groupedSlots.length === 0 ? (
            <div style={{ background: '#141724', padding: '60px', borderRadius: '14px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.15)' }}>
              <Calendar size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: 0, color: '#ffffff' }}>Chưa có khung giờ nào trong chiến dịch này</h3>
              <p style={{ color: '#94a3b8', fontSize: '13.5px', marginTop: '6px' }}>
                Bấm vào nút "Thêm khung giờ" để tạo 1 slot đơn lẻ hoặc tạo hàng loạt nhiều ngày cùng lúc.
              </p>
              <button
                onClick={() => setShowAddSlotModal(true)}
                className={`${styles.btn} ${styles.btnPrimary}`}
                style={{ marginTop: '16px' }}
              >
                <Plus size={16} /> Thêm khung giờ ngay
              </button>
            </div>
          ) : (
            groupedSlots.map(({ day, slots, totalProds, totalSold, isPast }) => {
              const isCollapsed = collapsedDays[day] || false;
              return (
                <div key={day} className={`${styles.dayGroup} ${isPast ? styles.dayGroupPast : ''}`}>
                  {/* Day Header Accordion */}
                  <div
                    className={styles.dayHeader}
                    onClick={() => setCollapsedDays({ ...collapsedDays, [day]: !isCollapsed })}
                  >
                    <div className={styles.dayTitle}>
                      <Calendar size={18} color="#e11d48" />
                      <span>{day}</span>
                      {isPast && <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 600 }}>(Đã qua)</span>}
                    </div>
                    <div className={styles.dayStats}>
                      <span><b>{slots.length}</b> khung giờ</span>
                      <span><b>{totalProds}</b> sản phẩm</span>
                      <span>Đã bán: <b>{totalSold}</b> suất</span>
                      {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </div>
                  </div>

                  {/* Day Slots List */}
                  {!isCollapsed && (
                    <div className={styles.slotCardList}>
                      {slots.map((slot) => {
                        const conflictMsg = slotConflicts.get(slot.id);
                        const isSlotLive = slot.status === 'live';
                        const isSlotEnded = slot.status === 'ended';

                        return (
                          <div key={slot.id} className={styles.slotCard}>
                            {/* Slot Header */}
                            <div className={styles.slotHeader}>
                              <div className={styles.slotTimeInfo}>
                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                                  {slot.label || `Slot #${slot.id}`}
                                </span>
                                <span style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                                  ({getHourMinute(slot.start || slot.startTime)} - {getHourMinute(slot.end || slot.endTime)})
                                </span>
                                {slot.isOvernight && <span className={styles.overnightBadge}>+1 ngày</span>}

                                {isSlotLive && (
                                  <span className={`${styles.badge} ${styles.badgeRunning}`}>
                                    <span className={styles.badgePulse} /> Đang diễn ra
                                  </span>
                                )}
                                {slot.status === 'upcoming' && (
                                  <span className={`${styles.badge} ${styles.badgeUpcoming}`}>Sắp diễn ra</span>
                                )}
                                {isSlotEnded && (
                                  <span className={`${styles.badge} ${styles.badgeEnded}`}>Đã kết thúc</span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  onClick={() => openAddProducts(slot.id)}
                                  disabled={isSlotEnded}
                                  className={`${styles.btn} ${styles.btnPrimary}`}
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                  title="Thêm sản phẩm vào slot"
                                >
                                  <Plus size={14} /> Thêm sản phẩm
                                </button>
                                <button
                                  onClick={() => openCopyProducts(slot.id)}
                                  disabled={isSlotEnded}
                                  className={`${styles.btn} ${styles.btnSecondary}`}
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                  title="Sao chép danh sách sản phẩm từ khung giờ khác"
                                >
                                  <Copy size={14} /> Sao chép từ slot khác
                                </button>
                                <button
                                  onClick={() => openEditSlot(slot)}
                                  disabled={isSlotEnded}
                                  className={styles.iconBtn}
                                  title="Sửa giờ khung giờ"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => openDuplicateSlot(slot)}
                                  className={styles.iconBtn}
                                  title="Nhân bản khung giờ sang ngày khác"
                                >
                                  <Calendar size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  disabled={isSlotLive || (slot.totalSold || 0) > 0}
                                  className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                  title={(slot.totalSold || 0) > 0 ? "Khung giờ đã có suất bán, không được xóa" : "Xóa khung giờ"}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Overlap Conflict Warning */}
                            {conflictMsg && (
                              <div className={styles.conflictAlert}>
                                <AlertTriangle size={16} />
                                <span>Cảnh báo: {conflictMsg}</span>
                              </div>
                            )}

                            {/* Slot Products Table */}
                            {slot.products && slot.products.length > 0 ? (
                              <div style={{ overflowX: 'auto' }}>
                                <table className={styles.mainTable} style={{ fontSize: '12.5px' }}>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '50px' }}>STT</th>
                                      <th style={{ minWidth: '220px' }}>Sản phẩm</th>
                                      <th>Giá gốc</th>
                                      <th style={{ minWidth: '130px' }}>Giá Flash Sale</th>
                                      <th style={{ minWidth: '100px' }}>% Giảm</th>
                                      <th style={{ minWidth: '110px' }}>Số suất</th>
                                      <th>Đã bán</th>
                                      <th style={{ minWidth: '90px' }}>Tồn kho</th>
                                      <th>Trạng thái</th>
                                      <th style={{ textAlign: 'right' }}>Thao tác</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {slot.products.map((item, pIdx) => {
                                      const isSoldOut = item.sold >= item.quota;
                                      const isQuotaExceedsInv = (item.availableInventory || 0) > 0 && item.quota > item.availableInventory!;

                                      return (
                                        <tr key={item.id}>
                                          <td style={{ color: '#64748b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                              <button
                                                className={styles.iconBtn}
                                                style={{ width: '22px', height: '22px' }}
                                                disabled={pIdx === 0 || isSlotEnded}
                                                onClick={() => handleReorderProduct(slot, pIdx, 'up')}
                                              >
                                                <ArrowUp size={12} />
                                              </button>
                                              <button
                                                className={styles.iconBtn}
                                                style={{ width: '22px', height: '22px' }}
                                                disabled={pIdx === slot.products.length - 1 || isSlotEnded}
                                                onClick={() => handleReorderProduct(slot, pIdx, 'down')}
                                              >
                                                <ArrowDown size={12} />
                                              </button>
                                            </div>
                                          </td>
                                          <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                              <img
                                                src={item.image || item.imageUrl}
                                                alt={item.name}
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                                              />
                                              <div>
                                                <div style={{ fontWeight: 700, color: '#ffffff' }}>{item.name}</div>
                                                <div style={{ fontSize: '11.5px', color: '#64748b' }}>SKU: {item.sku || 'N/A'}</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td style={{ color: '#94a3b8', textDecoration: 'line-through' }}>
                                            {formatPrice(item.originalPrice)}
                                          </td>
                                          <td>
                                            <input
                                              type="number"
                                              className={styles.inlineInput}
                                              disabled={isSlotEnded}
                                              defaultValue={item.salePrice}
                                              onBlur={(e) => {
                                                const val = Number(e.target.value);
                                                if (val !== item.salePrice) {
                                                  handleInlineProductUpdate(item, { salePrice: val });
                                                }
                                              }}
                                            />
                                          </td>
                                          <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                              <input
                                                type="number"
                                                className={styles.inlineInput}
                                                style={{ width: '60px' }}
                                                disabled={isSlotEnded}
                                                defaultValue={item.discountPercent || 0}
                                                min={1}
                                                max={99}
                                                onBlur={(e) => {
                                                  const val = Number(e.target.value);
                                                  if (val !== item.discountPercent) {
                                                    handleInlineProductUpdate(item, { discountPercent: val });
                                                  }
                                                }}
                                              />
                                              <span style={{ color: '#f97316', fontWeight: 700 }}>%</span>
                                            </div>
                                          </td>
                                          <td>
                                            <input
                                              type="number"
                                              className={`${styles.inlineInput} ${isQuotaExceedsInv ? styles.inlineInputError : ''}`}
                                              style={{ width: '70px' }}
                                              disabled={isSlotEnded}
                                              defaultValue={item.quota}
                                              min={item.sold || 1}
                                              onBlur={(e) => {
                                                const val = Number(e.target.value);
                                                if (val !== item.quota) {
                                                  handleInlineProductUpdate(item, { quota: val });
                                                }
                                              }}
                                            />
                                          </td>
                                          <td style={{ fontWeight: 800, color: item.sold > 0 ? '#4ade80' : '#94a3b8' }}>
                                            {item.sold || 0}
                                          </td>
                                          <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                              <span style={{ color: '#cbd5e1' }}>{item.availableInventory || 0}</span>
                                              {isQuotaExceedsInv && (
                                                <span style={{ fontSize: '10px', color: '#f87171' }}>Quota vượt kho!</span>
                                              )}
                                            </div>
                                          </td>
                                          <td>
                                            {item.status === 'STOPPED' ? (
                                              <span style={{ color: '#f87171', fontSize: '11.5px', fontWeight: 700 }}>Ngừng bán</span>
                                            ) : isSoldOut ? (
                                              <span style={{ color: '#eab308', fontSize: '11.5px', fontWeight: 700 }}>Hết suất</span>
                                            ) : (
                                              <span style={{ color: '#4ade80', fontSize: '11.5px', fontWeight: 700 }}>Mở bán</span>
                                            )}
                                          </td>
                                          <td style={{ textAlign: 'right' }}>
                                            <button
                                              onClick={() => handleRemoveProduct(item)}
                                              disabled={isSlotEnded}
                                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                              title={item.sold > 0 ? "Chuyển sang Ngừng bán" : "Xóa khỏi khung giờ"}
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                                Chưa có sản phẩm nào trong khung giờ này. Bấm <b>"Thêm sản phẩm"</b> để bổ sung.
                              </div>
                            )}

                            {/* Slot Footer Summary */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#94a3b8', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <div>Tổng sản phẩm: <b>{slot.products?.length || 0}</b></div>
                              <div>Tổng số suất mở bán: <b>{slot.totalQuota || 0}</b></div>
                              <div>Đã bán: <b style={{ color: '#4ade80' }}>{slot.totalSold || 0}</b> suất</div>
                              <div>Doanh thu slot: <b style={{ color: '#facc15' }}>{formatPrice(slot.revenue || 0)}</b></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: THÔNG TIN CHUNG */}
      {activeTab === 'general' && (
        <div style={{ background: '#141724', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px', maxWidth: '720px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tên chiến dịch *</label>
              <input
                type="text"
                className={styles.formInput}
                value={generalForm.title}
                onChange={(e) => setGeneralForm({ ...generalForm, title: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ghi chú / Điều khoản hiển thị cho khách hàng</label>
              <textarea
                className={styles.formTextarea}
                rows={4}
                value={generalForm.disclaimer}
                onChange={(e) => setGeneralForm({ ...generalForm, disclaimer: e.target.value })}
                maxLength={500}
              />
              <div className={styles.charCounter}>{generalForm.disclaimer.length} / 500 ký tự</div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Trạng thái cấu hình (publishStatus)</label>
              <select
                className={styles.customSelect}
                value={generalForm.publishStatus}
                onChange={(e) => setGeneralForm({ ...generalForm, publishStatus: e.target.value as PublishStatus })}
              >
                <option value="ACTIVE">Kích hoạt (ACTIVE) - Hiển thị mở bán trên website</option>
                <option value="PAUSED">Tạm dừng (PAUSED)</option>
                <option value="DRAFT">Nháp (DRAFT) - Chưa công khai</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Khoảng thời gian hiệu lực (Read-only)</label>
              <div style={{ background: '#0b0d17', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 14px', borderRadius: '8px', color: '#cbd5e1', fontSize: '13.5px' }}>
                {formatVNRange(campaign.calculatedStartAt, campaign.calculatedEndAt)}
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Hệ thống tự động tính từ <b>min(slot.startTime)</b> đến <b>max(slot.endTime)</b> theo múi giờ <b>Asia/Ho_Chi_Minh</b>.
              </span>
            </div>

            <div style={{ paddingTop: '10px' }}>
              <button
                type="button"
                onClick={handleSaveGeneral}
                disabled={isSaving}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BÁO CÁO HIỆU QUẢ */}
      {activeTab === 'report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {report ? (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Tổng suất mở bán</span>
                    <span className={styles.statValue}>{report.totalQuota.toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Tổng suất đã bán</span>
                    <span className={styles.statValue} style={{ color: '#4ade80' }}>
                      {report.totalSold.toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Tỷ lệ bán hết (STR)</span>
                    <span className={styles.statValue} style={{ color: '#f97316' }}>
                      {report.sellThroughRate}%
                    </span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Doanh thu thực tế</span>
                    <span className={styles.statValue} style={{ color: '#facc15' }}>
                      {formatPrice(Number(report.totalRevenue))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Performance Table */}
              <div className={styles.tableCard}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 800 }}>
                  Hiệu Quả Từng Sản Phẩm Trong Chiến Dịch
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.mainTable}>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>SKU</th>
                        <th>Giá ưu đãi</th>
                        <th>Số suất</th>
                        <th>Đã bán</th>
                        <th>Tỷ lệ bán</th>
                        <th>Doanh thu</th>
                        <th>Tồn kho khả dụng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.productReports.map((pr) => (
                        <tr key={pr.itemId}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={pr.imageUrl}
                                alt={pr.productName}
                                style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                              />
                              <span style={{ fontWeight: 700, color: '#ffffff' }}>{pr.productName}</span>
                            </div>
                          </td>
                          <td style={{ color: '#94a3b8' }}>{pr.sku || 'N/A'}</td>
                          <td style={{ color: '#f87171', fontWeight: 700 }}>{formatPrice(Number(pr.salePrice))}</td>
                          <td>{pr.quota}</td>
                          <td style={{ fontWeight: 800, color: '#4ade80' }}>{pr.sold}</td>
                          <td>
                            <span style={{ color: pr.sellThroughRate >= 80 ? '#4ade80' : '#f97316', fontWeight: 700 }}>
                              {pr.sellThroughRate}%
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: '#facc15' }}>{formatPrice(Number(pr.revenue))}</td>
                          <td>{pr.availableInventory}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 10px' }} />
              Đang tổng hợp số liệu báo cáo...
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LỊCH SỬ THAY ĐỔI (AUDIT LOG) */}
      {activeTab === 'audit' && (
        <div style={{ background: '#141724', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 18px', color: '#ffffff', fontSize: '17px' }}>
            Nhật Ký Thay Đổi Cấu Hình & Giá (Audit Log)
          </h3>
          {auditLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Chưa có bản ghi lịch sử thay đổi nào được ghi nhận.
            </div>
          ) : (
            <div className={styles.timeline}>
              {auditLogs.map((log) => (
                <div key={log.id} className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    <History size={16} />
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineMeta}>
                      <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{log.action}</span>
                      <span>{formatVietnamDateTime(log.createdAt)}</span>
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '13.5px' }}>{log.details}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Thực hiện bởi: <b style={{ color: '#94a3b8' }}>{log.performedBy || 'Admin'}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Thêm khung giờ (Đơn lẻ & Hàng loạt) */}
      {showAddSlotModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddSlotModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Thêm Khung Giờ Mở Bán</h2>
              <button className={styles.iconBtn} onClick={() => setShowAddSlotModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0b0d17', padding: '4px 16px' }}>
              <button
                type="button"
                className={`${styles.tabBtn} ${slotCreateMode === 'single' ? styles.tabBtnActive : ''}`}
                onClick={() => setSlotCreateMode('single')}
              >
                Tạo 1 Khung Giờ
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${slotCreateMode === 'bulk' ? styles.tabBtnActive : ''}`}
                onClick={() => setSlotCreateMode('bulk')}
              >
                Tạo Hàng Loạt Theo Lịch
              </button>
            </div>

            {slotCreateMode === 'single' ? (
              <form onSubmit={handleCreateSingleSlot}>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ngày mở bán *</label>
                    <input
                      type="date"
                      required
                      className={styles.formInput}
                      value={singleSlotForm.date}
                      onChange={(e) => setSingleSlotForm({ ...singleSlotForm, date: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Giờ bắt đầu (24h) *</label>
                      <input
                        type="time"
                        required
                        className={styles.formInput}
                        value={singleSlotForm.startTime}
                        onChange={(e) => setSingleSlotForm({ ...singleSlotForm, startTime: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Giờ kết thúc (24h) *</label>
                      <input
                        type="time"
                        required
                        className={styles.formInput}
                        value={singleSlotForm.endTime}
                        onChange={(e) => setSingleSlotForm({ ...singleSlotForm, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nhãn khung giờ (Tùy chọn)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Để trống hệ thống sẽ tự đặt nhãn (VD: 09-11h 04/10)"
                      value={singleSlotForm.label}
                      onChange={(e) => setSingleSlotForm({ ...singleSlotForm, label: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowAddSlotModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                    Tạo khung giờ
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className={styles.modalBody}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Từ ngày *</label>
                      <input
                        type="date"
                        required
                        className={styles.formInput}
                        value={bulkSlotForm.startDate}
                        onChange={(e) => setBulkSlotForm({ ...bulkSlotForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Đến ngày *</label>
                      <input
                        type="date"
                        required
                        className={styles.formInput}
                        value={bulkSlotForm.endDate}
                        onChange={(e) => setBulkSlotForm({ ...bulkSlotForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Giờ bắt đầu hàng ngày *</label>
                      <input
                        type="time"
                        required
                        className={styles.formInput}
                        value={bulkSlotForm.dailyStartTime}
                        onChange={(e) => setBulkSlotForm({ ...bulkSlotForm, dailyStartTime: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Giờ kết thúc hàng ngày *</label>
                      <input
                        type="time"
                        required
                        className={styles.formInput}
                        value={bulkSlotForm.dailyEndTime}
                        onChange={(e) => setBulkSlotForm({ ...bulkSlotForm, dailyEndTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Thời lượng mỗi slot (Phút) *</label>
                      <input
                        type="number"
                        min={15}
                        step={15}
                        className={styles.formInput}
                        value={bulkSlotForm.slotDurationMinutes}
                        onChange={(e) => setBulkSlotForm({ ...bulkSlotForm, slotDurationMinutes: Number(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Khoảng nghỉ giữa 2 slot (Phút)</label>
                      <input
                        type="number"
                        min={0}
                        step={15}
                        className={styles.formInput}
                        value={bulkSlotForm.breakMinutes}
                        onChange={(e) => setBulkSlotForm({ ...bulkSlotForm, breakMinutes: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {bulkPreview && (
                    <div style={{ background: '#0b0d17', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                        Bản Xem Trước: Sẽ tạo <b>{bulkPreview.slots.length}</b> khung giờ
                      </div>
                      {bulkPreview.warnings.length > 0 && (
                        <div style={{ color: '#fbbf24', fontSize: '12px', marginBottom: '10px' }}>
                          {bulkPreview.warnings.map((w, idx) => (
                            <div key={idx}>⚠️ {w}</div>
                          ))}
                        </div>
                      )}
                      <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {bulkPreview.slots.map((s, idx) => (
                          <span key={idx} style={{ background: '#1e2235', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', color: '#cbd5e1' }}>
                            {s.label} {s.isOvernight && '(+1 ngày)'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowAddSlotModal(false)}>
                    Hủy
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => handleBulkSlotAction(false)}
                  >
                    <Eye size={16} /> Xem trước danh sách
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => handleBulkSlotAction(true)}
                  >
                    Xác nhận tạo hàng loạt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Sửa giờ Slot */}
      {showEditSlotModal && editingSlot && (
        <div className={styles.modalOverlay} onClick={() => setShowEditSlotModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Sửa Giờ Khung Giờ #{editingSlot.id}</h2>
              <button className={styles.iconBtn} onClick={() => setShowEditSlotModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateSlot}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thời gian bắt đầu (dd/MM/yyyy HH:mm) *</label>
                  <input
                    type="datetime-local"
                    required
                    disabled={editingSlot.status === 'live'}
                    className={styles.formInput}
                    value={editSlotForm.startTimeInput}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, startTimeInput: e.target.value })}
                  />
                  {editingSlot.status === 'live' && (
                    <span style={{ fontSize: '12px', color: '#fbbf24' }}>
                      Khung giờ đang diễn ra (RUNNING): Quy tắc nghiệp vụ KHÔNG cho phép sửa thời gian bắt đầu.
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thời gian kết thúc (dd/MM/yyyy HH:mm) *</label>
                  <input
                    type="datetime-local"
                    required
                    className={styles.formInput}
                    value={editSlotForm.endTimeInput}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, endTimeInput: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nhãn khung giờ</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={editSlotForm.label}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, label: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowEditSlotModal(false)}>
                  Hủy
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Lưu khung giờ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Nhân bản Slot sang ngày khác */}
      {showDuplicateSlotModal && duplicateSlotTarget && (
        <div className={styles.modalOverlay} onClick={() => setShowDuplicateSlotModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nhân Bản Khung Giờ #{duplicateSlotTarget.id}</h2>
              <button className={styles.iconBtn} onClick={() => setShowDuplicateSlotModal(false)}>✕</button>
            </div>
            <form onSubmit={handleDuplicateSlot}>
              <div className={styles.modalBody}>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#cbd5e1' }}>
                  Khung giờ gốc: <b>{duplicateSlotTarget.label}</b> ({getHourMinute(duplicateSlotTarget.start)} - {getHourMinute(duplicateSlotTarget.end)})
                </p>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Chọn ngày đích cần nhân bản tới *</label>
                  <input
                    type="date"
                    required
                    className={styles.formInput}
                    value={duplicateSlotTargetDate}
                    onChange={(e) => setDuplicateSlotTargetDate(e.target.value)}
                  />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Thời lượng và giờ bắt đầu/kết thúc sẽ được giữ nguyên theo khung giờ gốc và chuyển sang ngày đích. Toàn bộ sản phẩm được copy sang với sold = 0.
                  </span>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowDuplicateSlotModal(false)}>
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

      {/* MODAL 4: Sao chép sản phẩm từ slot khác */}
      {showCopyProductsModal && copyTargetSlotId && (
        <div className={styles.modalOverlay} onClick={() => setShowCopyProductsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Sao Chép Sản Phẩm Từ Khung Giờ Khác</h2>
              <button className={styles.iconBtn} onClick={() => setShowCopyProductsModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Chọn khung giờ nguồn chứa sản phẩm cần sao chép *</label>
                <select
                  className={styles.customSelect}
                  value={copySourceSlotId || ''}
                  onChange={(e) => setCopySourceSlotId(Number(e.target.value))}
                >
                  <option value="">-- Chọn khung giờ nguồn --</option>
                  {campaign.slots
                    .filter((s) => s.id !== copyTargetSlotId && s.products && s.products.length > 0)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.products.length} sản phẩm)
                      </option>
                    ))}
                </select>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Các sản phẩm từ slot nguồn sẽ được sao chép sang slot đích (bỏ qua nếu sản phẩm đã có mặt trong slot đích). Số lượng đã bán được đặt lại bằng 0.
                </span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowCopyProductsModal(false)}>
                Hủy
              </button>
              <button
                type="button"
                disabled={!copySourceSlotId}
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleCopyProducts}
              >
                Xác nhận sao chép
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Thêm sản phẩm vào slot (Chọn nhiều + Thiết lập hàng loạt) */}
      {showAddProductModal && addProductSlotId && (
        <div className={styles.modalOverlay} onClick={() => setShowAddProductModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Thêm Sản Phẩm Vào Khung Giờ</h2>
              <button className={styles.iconBtn} onClick={() => setShowAddProductModal(false)}>✕</button>
            </div>

            {productStep === 'select' ? (
              <div>
                <div className={styles.modalBody}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                    <div className={styles.searchBox} style={{ maxWidth: '100%' }}>
                      <Search className={styles.searchIcon} size={16} />
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Tìm theo tên hoặc SKU sản phẩm..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      Đã chọn: <b style={{ color: '#ffffff' }}>{selectedProductIds.length}</b> sản phẩm
                    </div>
                  </div>

                  <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                    <table className={styles.mainTable} style={{ fontSize: '12.5px' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>
                            <input
                              type="checkbox"
                              checked={
                                filteredStoreProducts.length > 0 &&
                                filteredStoreProducts.every((p) => selectedProductIds.includes(p.id))
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds(filteredStoreProducts.map((p) => p.id));
                                } else {
                                  setSelectedProductIds([]);
                                }
                              }}
                            />
                          </th>
                          <th>Sản phẩm</th>
                          <th>Danh mục</th>
                          <th>Giá hiện tại</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStoreProducts.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                              Không tìm thấy sản phẩm nào khả dụng để thêm.
                            </td>
                          </tr>
                        ) : (
                          filteredStoreProducts.map((p) => {
                            const isChecked = selectedProductIds.includes(p.id);
                            return (
                              <tr
                                key={p.id}
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                                  } else {
                                    setSelectedProductIds([...selectedProductIds, p.id]);
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                  />
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img
                                      src={p.primaryImage || (p.images && p.images[0])}
                                      alt={p.name}
                                      style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                                    />
                                    <div>
                                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{p.name}</div>
                                      <div style={{ fontSize: '11px', color: '#64748b' }}>SKU: {p.variants?.[0]?.sku || `ID-${p.id}`}</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ color: '#94a3b8' }}>{p.categoryName || '-'}</td>
                                <td style={{ fontWeight: 700, color: '#e2e8f0' }}>{formatPrice(p.price)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowAddProductModal(false)}>
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={selectedProductIds.length === 0}
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={handleProceedToConfigure}
                  >
                    Tiếp tục ({selectedProductIds.length}) →
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className={styles.modalBody}>
                  {/* Bulk Configuration Bar */}
                  <div style={{ background: '#0b0d17', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                      ⚡ Áp dụng hàng loạt:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Giảm %:</span>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        style={{ width: '60px' }}
                        className={styles.inlineInput}
                        value={bulkDiscountPercent}
                        onChange={(e) => setBulkDiscountPercent(Number(e.target.value))}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Số suất:</span>
                      <input
                        type="number"
                        min={1}
                        style={{ width: '60px' }}
                        className={styles.inlineInput}
                        value={bulkQuota}
                        onChange={(e) => setBulkQuota(Number(e.target.value))}
                      />
                    </div>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnSecondary}`}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={handleApplyBulkSettings}
                    >
                      Áp dụng cho tất cả
                    </button>
                  </div>

                  {/* Individual Fine-Tuning Table */}
                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                    <table className={styles.mainTable} style={{ fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>Giá gốc</th>
                          <th style={{ minWidth: '110px' }}>Giá Flash Sale</th>
                          <th style={{ minWidth: '80px' }}>% Giảm</th>
                          <th style={{ minWidth: '80px' }}>Số suất</th>
                        </tr>
                      </thead>
                      <tbody>
                        {configuringItems.map((item, idx) => (
                          <tr key={item.product.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: '#ffffff' }}>{item.product.name}</div>
                            </td>
                            <td style={{ color: '#94a3b8' }}>{formatPrice(item.originalPrice)}</td>
                            <td>
                              <input
                                type="number"
                                className={styles.inlineInput}
                                value={item.salePrice}
                                onChange={(e) => {
                                  const sale = Number(e.target.value);
                                  const disc = Math.round(((item.originalPrice - sale) / item.originalPrice) * 100);
                                  const copy = [...configuringItems];
                                  copy[idx] = { ...item, salePrice: sale, discountPercent: disc };
                                  setConfiguringItems(copy);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className={styles.inlineInput}
                                style={{ width: '50px' }}
                                min={1}
                                max={99}
                                value={item.discountPercent}
                                onChange={(e) => {
                                  const disc = Number(e.target.value);
                                  const sale = Math.round(item.originalPrice * (1 - disc / 100));
                                  const copy = [...configuringItems];
                                  copy[idx] = { ...item, discountPercent: disc, salePrice: sale };
                                  setConfiguringItems(copy);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className={styles.inlineInput}
                                style={{ width: '60px' }}
                                min={1}
                                value={item.quota}
                                onChange={(e) => {
                                  const q = Number(e.target.value);
                                  const copy = [...configuringItems];
                                  copy[idx] = { ...item, quota: q };
                                  setConfiguringItems(copy);
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setProductStep('select')}>
                    ← Quay lại chọn lại
                  </button>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCommitAddProducts}>
                    Xác nhận thêm ({configuringItems.length}) sản phẩm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 6: Xem Trước (Preview Modal với mốc serverTime giả lập) */}
      {showPreviewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPreviewModal(false)}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: '980px', width: '95vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#e11d48" />
                <h2>Xem Trước Khối Flash Sale Như Người Dùng Thấy</h2>
              </div>
              <button className={styles.iconBtn} onClick={() => setShowPreviewModal(false)}>✕</button>
            </div>

            {/* ServerTime Simulation Toolbar */}
            <div style={{ background: '#0b0d17', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#facc15' }}>
                Giả lập mốc Server Time:
              </span>
              <button
                type="button"
                className={`${styles.btn} ${simulatedTimeMode === 'upcoming' ? styles.btnPrimary : styles.btnSecondary}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setSimulatedTimeMode('upcoming')}
              >
                Trước slot (Sắp diễn ra)
              </button>
              <button
                type="button"
                className={`${styles.btn} ${simulatedTimeMode === 'running' ? styles.btnPrimary : styles.btnSecondary}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setSimulatedTimeMode('running')}
              >
                Trong slot (Đang diễn ra)
              </button>
              <button
                type="button"
                className={`${styles.btn} ${simulatedTimeMode === 'waiting' ? styles.btnPrimary : styles.btnSecondary}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setSimulatedTimeMode('waiting')}
              >
                Giữa 2 slot (Chờ slot tiếp)
              </button>
              <button
                type="button"
                className={`${styles.btn} ${simulatedTimeMode === 'ended' ? styles.btnPrimary : styles.btnSecondary}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setSimulatedTimeMode('ended')}
              >
                Sau slot cuối (Đã kết thúc)
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Giờ giả lập:</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>
                  {formatVietnamDateTime(new Date(simulatedTimeMs).toISOString())}
                </span>
              </div>
            </div>

            {/* Preview Box - Renders FlashSale exact view */}
            <div style={{ padding: '24px', background: '#070913', overflowY: 'auto', maxHeight: '65vh' }}>
              <div style={{ background: '#11131f', borderRadius: '16px', padding: '20px', border: '1px solid rgba(225,29,72,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame color="#ef4444" size={24} /> {campaign.title}
                  </div>
                  {campaign.slots && campaign.slots.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                        {simulatedTimeMs < new Date(campaign.slots[0].start).getTime()
                          ? 'Bắt đầu sau:'
                          : simulatedTimeMs > new Date(campaign.slots[campaign.slots.length - 1].end).getTime()
                          ? 'Chiến dịch đã kết thúc'
                          : 'Kết thúc sau:'}
                      </span>
                      {simulatedTimeMs <= new Date(campaign.slots[campaign.slots.length - 1].end).getTime() && (
                        <FlashSaleCountdown
                          status={simulatedTimeMs < new Date(campaign.slots[0].start).getTime() ? 'upcoming' : 'live'}
                          targetTime={
                            simulatedTimeMs < new Date(campaign.slots[0].start).getTime()
                              ? campaign.slots[0].start
                              : campaign.slots.find((s) => simulatedTimeMs >= new Date(s.start).getTime() && simulatedTimeMs <= new Date(s.end).getTime())?.end || campaign.slots[0].end
                          }
                          serverOffset={simulatedTimeMs - Date.now()}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Slots display */}
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '14px' }}>
                  {campaign.slots.map((s) => {
                    const sStart = new Date(s.start).getTime();
                    const sEnd = new Date(s.end).getTime();
                    const isLive = simulatedTimeMs >= sStart && simulatedTimeMs <= sEnd;
                    const isEnded = simulatedTimeMs > sEnd;

                    return (
                      <div
                        key={s.id}
                        style={{
                          background: isLive ? '#e11d48' : '#1e2235',
                          border: isLive ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          minWidth: '130px',
                          textAlign: 'center',
                          opacity: isEnded ? 0.45 : 1,
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#ffffff' }}>
                          {getHourMinute(s.start)} - {getHourMinute(s.end)}
                        </div>
                        <div style={{ fontSize: '11px', color: isLive ? '#ffffff' : '#94a3b8', marginTop: '2px' }}>
                          {isLive ? 'ĐANG DIỄN RA' : isEnded ? 'ĐÃ KẾT THÚC' : 'SẮP DIỄN RA'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Products cards preview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
                  {campaign.products && campaign.products.length > 0 ? (
                    campaign.products.slice(0, 8).map((p) => {
                      const percent = p.quota > 0 ? Math.min(100, Math.round((p.sold / p.quota) * 100)) : 0;
                      return (
                        <div
                          key={p.id}
                          style={{
                            background: '#161926',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <img
                            src={p.image || p.imageUrl}
                            alt={p.name}
                            style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', minHeight: '36px' }}>
                            {p.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '14px' }}>
                              {formatPrice(p.salePrice)}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '11.5px', textDecoration: 'line-through' }}>
                              {formatPrice(p.originalPrice)}
                            </span>
                          </div>
                          <div style={{ marginTop: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                              <span>Đã bán {p.sold}/{p.quota}</span>
                              <span style={{ color: '#f97316' }}>{percent}%</span>
                            </div>
                            <div className={styles.progressBarTrack}>
                              <div className={styles.progressBarFill} style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      Chiến dịch chưa có sản phẩm nào để hiển thị xem trước.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowPreviewModal(false)}>
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
