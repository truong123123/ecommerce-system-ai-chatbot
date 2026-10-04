'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Checkout.module.css';
import { useCartStore } from '../../store/cartStore';
import { authService } from '../../services/authService';
import { checkoutService } from '../../services/checkoutService';
import {
  CheckoutPreviewData,
  LocationProvince,
  LocationDistrict,
  LocationWard,
  StoreLocation,
  PaymentMethodItem,
  CouponItem,
  CheckoutCalculateResponse,
} from '@/types/checkout';
import {
  ChevronLeft,
  Truck,
  ShoppingBag,
  User,
  MapPin,
  Store as StoreIcon,
  CreditCard,
  Ticket,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export default function CheckoutClient() {
  const router = useRouter();
  const { cartData, selectedVariantIds, clearCart } = useCartStore();

  // Loading & Error States
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Core Preview Data
  const [previewData, setPreviewData] = useState<CheckoutPreviewData | null>(null);
  const [calculation, setCalculation] = useState<CheckoutCalculateResponse | null>(null);

  // Form: Customer Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Form: Delivery Mode ('STORE_PICKUP' | 'HOME_DELIVERY')
  const [receiveType, setReceiveType] = useState<'STORE_PICKUP' | 'HOME_DELIVERY'>('STORE_PICKUP');

  // Form: Store Pickup Selection
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  // Form: Home Delivery Selection
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [deliveryProvince, setDeliveryProvince] = useState('');
  const [deliveryDistrict, setDeliveryDistrict] = useState('');
  const [deliveryWard, setDeliveryWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Form: Company Invoice
  const [requireInvoice, setRequireInvoice] = useState(false);
  const [taxCode, setTaxCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');

  // Form: Payment Method
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('STORE');

  // Dynamic Locations & Stores
  const [provinces, setProvinces] = useState<LocationProvince[]>([]);
  const [pickupDistricts, setPickupDistricts] = useState<LocationDistrict[]>([]);
  const [deliveryDistricts, setDeliveryDistricts] = useState<LocationDistrict[]>([]);
  const [deliveryWards, setDeliveryWards] = useState<LocationWard[]>([]);
  const [availableStores, setAvailableStores] = useState<StoreLocation[]>([]);

  // Vouchers & Modal
  const [couponCode, setCouponCode] = useState('');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<CouponItem[]>([]);
  const [customCouponInput, setCustomCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Idempotency Key
  const idempotencyKeyRef = useRef<string>('');
  useEffect(() => {
    idempotencyKeyRef.current = 'IDEMP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  }, []);

  // Format VND Price
  const formatPrice = (val?: number | null) => {
    if (val === undefined || val === null) return '0đ';
    return val.toLocaleString('vi-VN') + 'đ';
  };

  // 1. Initial Load: Fetch Preview and Master Data
  useEffect(() => {
    const initData = async () => {
      setIsLoadingPreview(true);
      setErrorMsg(null);

      try {
        // Resolve item IDs from Cart
        const itemsToCheckout = (cartData?.items || []).filter(
          (item) => (selectedVariantIds.length === 0 || selectedVariantIds.includes(item.variantId)) && item.inStock
        );

        if (itemsToCheckout.length === 0) {
          setIsLoadingPreview(false);
          return;
        }

        const variantIds = itemsToCheckout.map((i) => i.variantId);
        const quantities = itemsToCheckout.map((i) => i.quantity);

        // Parallel requests: preview, locations, payment methods
        const [preview, provList, pmList] = await Promise.all([
          checkoutService.getPreview(variantIds, quantities),
          checkoutService.getProvinces().catch(() => []),
          checkoutService.getPaymentMethods().catch(() => []),
        ]);

        setPreviewData(preview);
        setProvinces(provList);
        setPaymentMethods(pmList);

        if (pmList.length > 0) {
          setSelectedPaymentMethod(pmList[0].methodCode);
        }

        // Fill Customer Info
        if (preview.customer) {
          setCustomerName(preview.customer.fullName || '');
          setCustomerPhone(preview.customer.phone || '');
          setCustomerEmail(preview.customer.email || '');
          setReceiverName(preview.customer.fullName || '');
          setReceiverPhone(preview.customer.phone || '');
        } else {
          const localUser = authService.getCurrentUser();
          if (localUser) {
            setCustomerName(localUser.name || '');
            setCustomerEmail(localUser.email || '');
            setReceiverName(localUser.name || '');
          }
        }

        // Fill Default Address if present
        if (preview.defaultAddress) {
          const addr = preview.defaultAddress;
          setReceiverName(addr.receiverName || '');
          setReceiverPhone(addr.receiverPhone || '');
          setDeliveryProvince(addr.province || '');
          setDeliveryDistrict(addr.district || '');
          setDeliveryWard(addr.ward || '');
          setStreetAddress(addr.streetAddress || '');
        }

        // Initial Calculation
        const initialCalc = await checkoutService.calculate({
          items: itemsToCheckout.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          couponCode: cartData?.appliedCoupon?.code || undefined,
          receiveType: 'STORE_PICKUP',
        });
        setCalculation(initialCalc);
        if (cartData?.appliedCoupon?.code) {
          setCouponCode(cartData.appliedCoupon.code);
        }
      } catch (err: any) {
        console.error('Error loading checkout preview:', err);
        setErrorMsg(err.response?.data?.message || err.message || 'Không thể tải dữ liệu thanh toán.');
      } finally {
        setIsLoadingPreview(false);
      }
    };

    initData();
  }, [cartData, selectedVariantIds]);

  // 2. Cascade Dropdown for Store Pickup: Districts & Stores
  useEffect(() => {
    if (!selectedProvince) {
      setPickupDistricts([]);
      setSelectedDistrict('');
      return;
    }

    checkoutService.getDistricts(selectedProvince)
      .then((d) => setPickupDistricts(d))
      .catch(() => setPickupDistricts([]));
  }, [selectedProvince]);

  useEffect(() => {
    if (receiveType === 'STORE_PICKUP') {
      checkoutService.getStores(selectedProvince || undefined, selectedDistrict || undefined)
        .then((stores) => {
          setAvailableStores(stores);
          if (stores.length > 0 && !selectedStoreId) {
            setSelectedStoreId(stores[0].storeId);
          }
        })
        .catch(() => setAvailableStores([]));
    }
  }, [receiveType, selectedProvince, selectedDistrict]);

  // 3. Cascade Dropdown for Home Delivery: Districts & Wards
  useEffect(() => {
    if (!deliveryProvince) {
      setDeliveryDistricts([]);
      setDeliveryWards([]);
      setDeliveryDistrict('');
      setDeliveryWard('');
      return;
    }

    checkoutService.getDistricts(deliveryProvince)
      .then((d) => setDeliveryDistricts(d))
      .catch(() => setDeliveryDistricts([]));
  }, [deliveryProvince]);

  useEffect(() => {
    if (!deliveryProvince || !deliveryDistrict) {
      setDeliveryWards([]);
      setDeliveryWard('');
      return;
    }

    checkoutService.getWards(deliveryProvince, deliveryDistrict)
      .then((w) => setDeliveryWards(w))
      .catch(() => setDeliveryWards([]));
  }, [deliveryProvince, deliveryDistrict]);

  // 4. Recalculate price when receiveType, province, or coupon changes
  const refreshCalculation = async (newCouponCode?: string, newReceiveType?: 'STORE_PICKUP' | 'HOME_DELIVERY', newProvince?: string) => {
    if (!previewData || previewData.items.length === 0) return;

    const targetType = newReceiveType !== undefined ? newReceiveType : receiveType;
    const targetCoupon = newCouponCode !== undefined ? newCouponCode : couponCode;
    const targetProvince = newProvince !== undefined ? newProvince : (targetType === 'HOME_DELIVERY' ? deliveryProvince : undefined);

    try {
      const updatedCalc = await checkoutService.calculate({
        items: previewData.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        couponCode: targetCoupon || undefined,
        receiveType: targetType,
        province: targetProvince,
      });
      setCalculation(updatedCalc);
    } catch (err: any) {
      console.warn('Recalculate error:', err);
    }
  };

  const handleReceiveTypeChange = (type: 'STORE_PICKUP' | 'HOME_DELIVERY') => {
    setReceiveType(type);
    refreshCalculation(couponCode, type);
  };

  // 5. Coupon Handling
  const handleOpenCouponModal = async () => {
    setIsCouponModalOpen(true);
    setCouponError(null);
    try {
      const coupons = await checkoutService.getAvailableCoupons(calculation?.subtotal || previewData?.subtotal);
      setAvailableCoupons(coupons);
    } catch (err) {
      console.warn('Could not fetch available coupons', err);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    if (!code.trim()) return;
    setCouponError(null);

    try {
      const res = await checkoutService.validateCoupon(code.trim(), calculation?.subtotal || previewData?.subtotal || 0);
      if (res.valid) {
        setCouponCode(code.trim().toUpperCase());
        await refreshCalculation(code.trim().toUpperCase());
        setIsCouponModalOpen(false);
      } else {
        setCouponError(res.message || 'Mã giảm giá không hợp lệ hoặc đã hết lượt.');
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Không thể áp dụng mã giảm giá.');
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponCode('');
    await refreshCalculation('');
  };

  // 6. Submit Checkout Handler
  const handleSubmitCheckout = async () => {
    setErrorMsg(null);

    // Validate Customer Info
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email khách hàng.');
      return;
    }

    // Phone validation
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      setErrorMsg('Số điện thoại khách hàng không đúng định dạng (VD: 0965384240).');
      return;
    }

    // Email validation
    if (!customerEmail.includes('@')) {
      setErrorMsg('Email nhận thông báo và hóa đơn không hợp lệ.');
      return;
    }

    // Validate Receive Type Specifics
    if (receiveType === 'STORE_PICKUP') {
      if (!selectedStoreId) {
        setErrorMsg('Vui lòng chọn cửa hàng CellphoneS bạn muốn đến nhận máy.');
        return;
      }
    } else {
      if (!receiverName.trim() || !receiverPhone.trim() || !deliveryProvince || !deliveryDistrict || !streetAddress.trim()) {
        setErrorMsg('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng tận nơi.');
        return;
      }
    }

    // Validate Company Invoice if checked
    if (requireInvoice) {
      if (!taxCode.trim() || !companyName.trim() || !companyAddress.trim()) {
        setErrorMsg('Vui lòng điền đầy đủ Mã số thuế, Tên công ty và Địa chỉ công ty để xuất hóa đơn VAT.');
        return;
      }
    }

    if (!previewData || previewData.items.length === 0) {
      setErrorMsg('Không có sản phẩm nào để thanh toán.');
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = previewData.items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      }));

      const submitPayload = {
        receiveType,
        storeId: receiveType === 'STORE_PICKUP' ? selectedStoreId : null,
        shippingAddress:
          receiveType === 'HOME_DELIVERY'
            ? {
                receiverName: receiverName.trim(),
                receiverPhone: receiverPhone.trim(),
                province: deliveryProvince,
                district: deliveryDistrict,
                ward: deliveryWard,
                streetAddress: streetAddress.trim(),
              }
            : null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        couponCode: couponCode || null,
        paymentMethod: selectedPaymentMethod,
        customerNote: customerNote.trim() || undefined,
        requireInvoice,
        invoiceInfo: requireInvoice
          ? {
              taxCode: taxCode.trim(),
              companyName: companyName.trim(),
              companyAddress: companyAddress.trim(),
              invoiceEmail: invoiceEmail.trim() || customerEmail.trim(),
            }
          : null,
        items: itemsPayload,
      };

      const res = await checkoutService.submitCheckout(submitPayload, idempotencyKeyRef.current);

      // Clear purchased items from Cart
      await clearCart();

      // Check payment redirection (e.g. VNPAY)
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }

      // Success page navigation
      router.push(
        `/checkout/success?orderCode=${res.orderCode}&method=${res.paymentMethod}&amount=${res.totalAmount}&storeHours=${res.storeHoldHours || 24}`
      );
    } catch (err: any) {
      console.error('Checkout submit error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Đặt hàng không thành công, vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  // Empty cart fallback
  if (!isLoadingPreview && (!previewData || previewData.items.length === 0)) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.container} style={{ textAlign: 'center', padding: '80px 20px' }}>
          <ShoppingBag size={54} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            Không có sản phẩm nào trong phiên thanh toán!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Vui lòng quay lại giỏ hàng và chọn sản phẩm bạn muốn đặt mua.
          </p>
          <Link
            href="/cart"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#d70018',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <ChevronLeft size={18} /> Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (isLoadingPreview) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.container} style={{ textAlign: 'center', padding: '120px 20px' }}>
          <Loader2 size={40} className="animate-spin" color="#d70018" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#4b5563', fontWeight: 600 }}>Đang chuẩn bị thông tin thanh toán CellphoneS...</p>
        </div>
      </div>
    );
  }

  const freeShippingThreshold = previewData?.freeShippingThreshold || 300000;
  const currentSubtotal = calculation?.subtotal ?? previewData?.subtotal ?? 0;
  const currentDirectDiscount = calculation?.directDiscount ?? previewData?.directDiscount ?? 0;
  const currentVoucherDiscount = calculation?.voucherDiscount ?? 0;
  const currentShippingFee = calculation?.shippingFee ?? (currentSubtotal >= freeShippingThreshold ? 0 : 30000);
  const currentTotalAmount = calculation?.totalAmount ?? (currentSubtotal - currentVoucherDiscount + currentShippingFee);
  const currentTotalSavings = calculation?.totalSavings ?? (currentDirectDiscount + currentVoucherDiscount);

  return (
    <div className={styles.checkoutPage}>
      {/* Top Navigation Bar */}
      <div className={styles.topNav}>
        <div className={`${styles.container} ${styles.topNavInner}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/cart" className={styles.backLink}>
              <ChevronLeft size={20} /> Quay lại giỏ hàng
            </Link>
            <span style={{ color: '#d1d5db' }}>|</span>
            <h1 className={styles.pageTitle}>Thông tin thanh toán</h1>
          </div>

          <div className={styles.freeShippingBanner}>
            <Truck size={16} />
            <span>Miễn phí vận chuyển với đơn hàng từ {formatPrice(freeShippingThreshold)}</span>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className={styles.checkoutGrid}>
          {/* LEFT COLUMN (~60%) */}
          <div className={styles.leftColumn}>
            {/* 1. Danh sách sản phẩm */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <ShoppingBag size={18} color="#d70018" />
                  Danh sách sản phẩm
                </h2>
                <span className={styles.cardBadge}>{previewData?.items.length || 0} sản phẩm</span>
              </div>

              <div className={styles.productList}>
                {previewData?.items.map((item) => (
                  <div key={item.variantId} className={styles.productItem}>
                    <img
                      src={item.imageUrl || '/placeholder-product.png'}
                      alt={item.productName}
                      className={styles.productThumb}
                    />
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>{item.productName}</div>
                      <div className={styles.productMeta}>
                        {item.color && <span className={styles.variantTag}>Màu: {item.color}</span>}
                        {item.storage && <span className={styles.variantTag}>Dung lượng: {item.storage}</span>}
                        {item.isFlashSale && (
                          <span className={styles.flashSaleTag}>⚡ Flash Sale</span>
                        )}
                      </div>
                      <div className={styles.productPricing}>
                        <span className={styles.salePrice}>{formatPrice(item.salePrice)}</span>
                        {item.originalPrice > item.salePrice && (
                          <span className={styles.originalPrice}>{formatPrice(item.originalPrice)}</span>
                        )}
                        <span className={styles.quantityMultiplier}>x{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Thông tin khách hàng */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <User size={18} color="#d70018" />
                  Thông tin khách hàng
                </h2>
              </div>

              <div className={styles.customerProfile}>
                {previewData?.customer ? (
                  <>
                    <div className={styles.customerHeader}>
                      <span className={styles.customerName}>Anh/Chị {customerName}</span>
                      <span className={`${styles.badgeSmember} ${styles.badgeNull}`}>S-NULL</span>
                      <span className={`${styles.badgeSmember} ${styles.badgeStudent}`}>S-Student</span>
                    </div>
                    <div className={styles.customerPhone}>Số điện thoại: {customerPhone}</div>
                    <div className={styles.customerEmailNote}>
                      Email: <strong>{customerEmail}</strong> (Cần nhập đúng thông tin email để nhận hóa đơn VAT)
                    </div>
                  </>
                ) : (
                  <div className={styles.addressForm}>
                    <div className={styles.formRow2}>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Họ và tên *</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="Nguyễn Văn A"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Số điện thoại *</label>
                        <input
                          type="tel"
                          className={styles.formInput}
                          placeholder="0987654321"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Email nhận thông báo & hóa đơn *</label>
                      <input
                        type="email"
                        className={styles.formInput}
                        placeholder="example@gmail.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Chọn hình thức nhận hàng */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <MapPin size={18} color="#d70018" />
                  Chọn hình thức nhận hàng
                </h2>
              </div>

              {/* Delivery Mode Tabs */}
              <div className={styles.deliveryTabs}>
                <button
                  type="button"
                  className={`${styles.deliveryTabBtn} ${receiveType === 'STORE_PICKUP' ? styles.deliveryTabActive : ''}`}
                  onClick={() => handleReceiveTypeChange('STORE_PICKUP')}
                >
                  <span className={styles.deliveryTabTitle}>
                    <StoreIcon size={16} /> Nhận tại cửa hàng
                  </span>
                  <span className={styles.deliveryTabSub}>Có tại hệ thống chi nhánh</span>
                </button>

                <button
                  type="button"
                  className={`${styles.deliveryTabBtn} ${receiveType === 'HOME_DELIVERY' ? styles.deliveryTabActive : ''}`}
                  onClick={() => handleReceiveTypeChange('HOME_DELIVERY')}
                >
                  <span className={styles.deliveryTabTitle}>
                    <Truck size={16} /> Giao hàng tận nơi
                  </span>
                  <span className={styles.deliveryTabSub}>Miễn phí đơn từ 300.000đ</span>
                </button>
              </div>

              {/* Sub-view: STORE PICKUP */}
              {receiveType === 'STORE_PICKUP' && (
                <div>
                  <div className={styles.storeNotice}>
                    <ShieldCheck size={16} />
                    <span>CellphoneS sẽ giữ sản phẩm và ưu đãi trong vòng 24 giờ kể từ thời điểm đặt hàng.</span>
                  </div>

                  <div className={styles.filterRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Tỉnh / Thành phố</label>
                      <div className={styles.selectWrapper}>
                        <select
                          className={styles.formSelect}
                          value={selectedProvince}
                          onChange={(e) => {
                            setSelectedProvince(e.target.value);
                            setSelectedDistrict('');
                          }}
                        >
                          <option value="">-- Tất cả Tỉnh / Thành --</option>
                          {provinces.map((p) => (
                            <option key={p.code} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        {selectedProvince && (
                          <button
                            type="button"
                            className={styles.clearSelectBtn}
                            onClick={() => {
                              setSelectedProvince('');
                              setSelectedDistrict('');
                            }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Quận / Huyện</label>
                      <div className={styles.selectWrapper}>
                        <select
                          className={styles.formSelect}
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          disabled={!selectedProvince}
                        >
                          <option value="">-- Tất cả Quận / Huyện --</option>
                          {pickupDistricts.map((d) => (
                            <option key={d.code} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        {selectedDistrict && (
                          <button
                            type="button"
                            className={styles.clearSelectBtn}
                            onClick={() => setSelectedDistrict('')}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.storeList}>
                    {availableStores.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '13px' }}>
                        Không tìm thấy chi nhánh phù hợp tại khu vực này.
                      </div>
                    ) : (
                      availableStores.map((store) => {
                        const isSelected = selectedStoreId === store.storeId;
                        return (
                          <div
                            key={store.storeId}
                            className={`${styles.storeCard} ${isSelected ? styles.storeCardSelected : ''}`}
                            onClick={() => setSelectedStoreId(store.storeId)}
                          >
                            <input
                              type="radio"
                              name="storeSelect"
                              checked={isSelected}
                              onChange={() => setSelectedStoreId(store.storeId)}
                              className={styles.storeRadio}
                            />
                            <div className={styles.storeDetails}>
                              <div className={styles.storeName}>{store.name}</div>
                              <div className={styles.storeAddress}>{store.address}</div>
                              <div className={styles.storeHours}>
                                Giờ mở cửa: {store.openHours || '08:00 - 22:00'} • Hotline: {store.phone || '1800 2097'}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Sub-view: HOME DELIVERY */}
              {receiveType === 'HOME_DELIVERY' && (
                <div className={styles.addressForm}>
                  <div className={styles.formRow2}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Tên người nhận *</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="Họ và tên người nhận"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Số điện thoại nhận hàng *</label>
                      <input
                        type="tel"
                        className={styles.formInput}
                        placeholder="09xxxxxxxx"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow3}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Tỉnh / Thành phố *</label>
                      <select
                        className={styles.formSelect}
                        value={deliveryProvince}
                        onChange={(e) => {
                          setDeliveryProvince(e.target.value);
                          refreshCalculation(couponCode, 'HOME_DELIVERY', e.target.value);
                        }}
                      >
                        <option value="">Chọn Tỉnh / Thành</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Quận / Huyện *</label>
                      <select
                        className={styles.formSelect}
                        value={deliveryDistrict}
                        onChange={(e) => setDeliveryDistrict(e.target.value)}
                        disabled={!deliveryProvince}
                      >
                        <option value="">Chọn Quận / Huyện</option>
                        {deliveryDistricts.map((d) => (
                          <option key={d.code} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Phường / Xã</label>
                      <select
                        className={styles.formSelect}
                        value={deliveryWard}
                        onChange={(e) => setDeliveryWard(e.target.value)}
                        disabled={!deliveryDistrict}
                      >
                        <option value="">Chọn Phường / Xã</option>
                        {deliveryWards.map((w) => (
                          <option key={w.code} value={w.name}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Số nhà, tên đường *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="VD: 123 Lê Lợi, Tòa nhà A..."
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Ghi chú giao hàng</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Giao giờ hành chính, gọi trước khi đến..."
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Hóa đơn công ty */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <FileText size={18} color="#d70018" />
                  Bạn có muốn xuất hóa đơn công ty không?
                </h2>
              </div>

              <div className={styles.invoiceRadioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="invoiceToggle"
                    checked={requireInvoice === true}
                    onChange={() => setRequireInvoice(true)}
                    className={styles.radioInput}
                  />
                  Có
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="invoiceToggle"
                    checked={requireInvoice === false}
                    onChange={() => setRequireInvoice(false)}
                    className={styles.radioInput}
                  />
                  Không
                </label>
              </div>

              {requireInvoice && (
                <div className={styles.invoiceCollapse}>
                  <div className={styles.formRow2}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Mã số thuế doanh nghiệp *</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="0101234567"
                        value={taxCode}
                        onChange={(e) => setTaxCode(e.target.value)}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Tên công ty đầy đủ *</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="Công ty TNHH Giải Pháp Công Nghệ..."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Địa chỉ công ty theo đăng ký kinh doanh *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Tầng 5, Tòa nhà ABC, Phường Bến Nghé, Quận 1..."
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Email nhận hóa đơn điện tử</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      placeholder={customerEmail || 'ketoan@company.com'}
                      value={invoiceEmail}
                      onChange={(e) => setInvoiceEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (~40%) */}
          <div className={styles.rightColumn}>
            {/* 1. Thông tin đơn hàng */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Thông tin đơn hàng</h2>
              </div>

              {/* Voucher Row */}
              {couponCode ? (
                <div className={styles.appliedVoucherTag}>
                  <div className={styles.appliedVoucherInfo}>
                    <Ticket size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                    Mã: <strong>{couponCode}</strong> (Tiết kiệm {formatPrice(currentVoucherDiscount)})
                  </div>
                  <button type="button" className={styles.btnRemoveVoucher} onClick={handleRemoveCoupon}>
                    Xóa
                  </button>
                </div>
              ) : (
                <div className={styles.voucherBox}>
                  <div className={styles.voucherLeft}>
                    <Ticket size={18} className={styles.voucherTicketIcon} />
                    <span>Mã giảm giá / Voucher</span>
                  </div>
                  <button type="button" className={styles.btnChooseVoucher} onClick={handleOpenCouponModal}>
                    Chọn mã
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Tổng tiền tạm tính</span>
                <span className={styles.summaryValue}>{formatPrice(currentSubtotal)}</span>
              </div>

              {currentDirectDiscount > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Giảm giá trực tiếp</span>
                  <span className={styles.discountValue}>-{formatPrice(currentDirectDiscount)}</span>
                </div>
              )}

              {currentVoucherDiscount > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Giảm giá voucher</span>
                  <span className={styles.discountValue}>-{formatPrice(currentVoucherDiscount)}</span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Phí vận chuyển</span>
                <span className={currentShippingFee === 0 ? styles.freeShippingText : styles.summaryValue}>
                  {currentShippingFee === 0 ? 'Miễn phí' : formatPrice(currentShippingFee)}
                </span>
              </div>

              <div className={styles.divider} />

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>TỔNG TIỀN</span>
                <span className={styles.totalAmount}>{formatPrice(currentTotalAmount)}</span>
              </div>
              <div className={styles.vatSubnote}>(Đã bao gồm VAT và được làm tròn)</div>

              {currentTotalSavings > 0 && (
                <div className={styles.savingsPill}>
                  🎉 Bạn đã tiết kiệm được {formatPrice(currentTotalSavings)}
                </div>
              )}
            </div>

            {/* 2. Chọn phương thức thanh toán */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <CreditCard size={18} color="#d70018" />
                  Chọn phương thức thanh toán
                </h2>
              </div>

              <div className={styles.paymentList}>
                {paymentMethods.map((pm) => {
                  const isSelected = selectedPaymentMethod === pm.methodCode;
                  return (
                    <div
                      key={pm.methodCode}
                      className={`${styles.paymentItem} ${isSelected ? styles.paymentItemSelected : ''}`}
                      onClick={() => setSelectedPaymentMethod(pm.methodCode)}
                    >
                      <input
                        type="radio"
                        name="paymentSelect"
                        checked={isSelected}
                        onChange={() => setSelectedPaymentMethod(pm.methodCode)}
                        className={styles.paymentRadio}
                      />
                      <div className={styles.paymentDetails}>
                        <div className={styles.paymentName}>{pm.methodName}</div>
                        {pm.description && <div className={styles.paymentDesc}>{pm.description}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Big Red Submit Button */}
              <button
                type="button"
                className={styles.btnSubmitOrder}
                disabled={isSubmitting}
                onClick={handleSubmitCheckout}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    ĐANG XỬ LÝ ĐẶT HÀNG...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    THANH TOÁN • {formatPrice(currentTotalAmount)}
                  </>
                )}
              </button>
            </div>

            {/* 3. Điều khoản sử dụng của CellphoneS */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle} style={{ fontSize: '14px' }}>
                  Điều khoản sử dụng của CellphoneS
                </h3>
              </div>
              <ul className={styles.termsList}>
                <li>Đơn hàng giữ tại chi nhánh tối đa 24 giờ kể từ thời điểm tạo đơn.</li>
                <li>Hỗ trợ 1 đổi 1 trong vòng 30 ngày nếu có lỗi phần cứng từ nhà sản xuất.</li>
                <li>Cam kết 100% hàng chính hãng, đầy đủ hóa đơn chứng từ VAT.</li>
              </ul>
            </div>

            {/* 4. QR App CellphoneS */}
            <div className={styles.card}>
              <div className={styles.appCard}>
                <div className={styles.qrImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={52} color="#1f2937" />
                </div>
                <div className={styles.appText}>
                  <div className={styles.appTitle}>Tải ứng dụng Smember</div>
                  <div className={styles.appDesc}>
                    Quét mã để tải ứng dụng, tích lũy điểm thưởng chi tiêu và nhận nhiều ưu đãi độc quyền.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Selection Modal */}
      {isCouponModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCouponModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Chọn mã giảm giá CellphoneS</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsCouponModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {couponError && (
                <div style={{ color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>{couponError}</div>
              )}

              <div className={styles.couponInputRow}>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Nhập mã ưu đãi..."
                  value={customCouponInput}
                  onChange={(e) => setCustomCouponInput(e.target.value.toUpperCase())}
                />
                <button
                  type="button"
                  className={styles.btnChooseVoucher}
                  onClick={() => handleApplyCoupon(customCouponInput)}
                >
                  Áp dụng
                </button>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '8px' }}>
                Mã giảm giá khả dụng:
              </div>

              {availableCoupons.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#6b7280', padding: '12px 0' }}>
                  Không có mã giảm giá nào khả dụng cho đơn hàng hiện tại.
                </div>
              ) : (
                availableCoupons.map((c) => (
                  <div
                    key={c.couponId}
                    className={styles.couponItem}
                    onClick={() => handleApplyCoupon(c.code)}
                  >
                    <div>
                      <div className={styles.couponCode}>{c.code}</div>
                      <div className={styles.couponDesc}>
                        {c.discountType === 'percent'
                          ? `Giảm ${c.discountValue}% (tối đa ${formatPrice(c.maxDiscount)})`
                          : `Giảm ${formatPrice(c.discountValue)}`}
                        {c.minOrderAmount && ` cho đơn từ ${formatPrice(c.minOrderAmount)}`}
                      </div>
                    </div>
                    <button type="button" className={styles.btnChooseVoucher} style={{ padding: '4px 10px' }}>
                      Chọn
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
