'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Cart.module.css';
import { useCartStore } from '../../store/cartStore';
import { CouponModal } from '../../components/cart/CouponModal';
import {
  ChevronLeft,
  Trash2,
  Tag,
  Shield,
  Gift,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { authService } from '../../services/authService';

export default function CartClient() {
  const router = useRouter();
  const {
    cartData,
    selectedVariantIds,
    isLoading,
    fetchCart,
    updateQuantity,
    removeItem,
    toggleSelect,
    toggleSelectAll,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCart();
    setCurrentUser(authService.getCurrentUser());
  }, [fetchCart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatPrice = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '0đ';
    return val.toLocaleString('vi-VN') + 'đ';
  };

  const items = cartData?.items || [];
  const inStockItems = items.filter((i) => i.inStock);
  const isAllSelected =
    inStockItems.length > 0 &&
    inStockItems.every((i) => selectedVariantIds.includes(i.variantId));

  const summary = cartData?.summary;
  const selectedCount = selectedVariantIds.filter((id) =>
    inStockItems.some((i) => i.variantId === id)
  ).length;
  const isCheckoutEnabled = selectedCount > 0;

  const handleCheckout = () => {
    if (!isCheckoutEnabled) return;
    if (!authService.getCurrentUser()) {
      showToast('Vui lòng đăng nhập để tiến hành thanh toán.');
      setTimeout(() => {
        router.push('/login?from=/checkout');
      }, 800);
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className={styles.cartPage}>
      <div className={styles.container}>
        {/* Toast alert */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: '#1f2937',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              zIndex: 9999,
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* 1. Header Navigation Bar */}
        <div className={styles.topNav}>
          <Link href="/products" className={styles.backLink}>
            <ChevronLeft size={20} />
            <span>Tiếp tục mua sắm</span>
            <span style={{ color: '#9ca3af' }}>/</span>
            <span style={{ color: '#111827', fontWeight: 600 }}>Giỏ hàng của bạn</span>
          </Link>

          <div className={styles.shippingBanner}>
            <span>🚚</span>
            <span>Miễn phí vận chuyển với đơn hàng từ 300.000đ</span>
          </div>
        </div>

        {/* Banner thông báo dành cho khách */}
        {!currentUser && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '13px',
              color: '#1e3a8a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <span>
                Bạn đang thao tác dưới tư cách <strong>Khách</strong>. Đăng nhập để đồng bộ giỏ hàng và nhận ưu đãi độc quyền thành viên Smember!
              </span>
            </div>
            <Link
              href="/login?from=/cart"
              style={{
                color: '#d70018',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                background: '#fff',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #fecaca',
              }}
            >
              Đăng nhập ngay →
            </Link>
          </div>
        )}

        {/* Nếu giỏ hàng trống */}
        {items.length === 0 && !isLoading ? (
          <div className={styles.emptyCartState}>
            <ShoppingBag size={64} color="#d1d5db" />
            <h2 className={styles.emptyCartTitle}>Giỏ hàng của bạn đang trống</h2>
            <p className={styles.emptyCartText}>
              Hãy khám phá các sản phẩm công nghệ chính hãng tuyệt vời với ưu đãi tốt nhất tại truongngstore!
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Link href="/products" className={styles.shopNowBtn}>
                Khám phá sản phẩm ngay
              </Link>
              {!currentUser && (
                <Link
                  href="/login?from=/cart"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    border: '1.5px solid #d70018',
                    color: '#d70018',
                    fontWeight: 600,
                    fontSize: '15px',
                    textDecoration: 'none',
                    backgroundColor: '#fff',
                    transition: 'all 0.2s',
                  }}
                >
                  Đăng nhập tài khoản
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* 2. Main 2-Column Layout */
          <div className={styles.cartLayout}>
            {/* CỘT TRÁI (65%): Danh sách sản phẩm */}
            <div className={styles.leftColumn}>
              {/* Top control bar: Checkbox Tất cả & Nút Mua ngay */}
              <div className={styles.topActionBar}>
                <label className={styles.selectAllLabel}>
                  <input
                    type="checkbox"
                    className={styles.itemCheckbox}
                    checked={isAllSelected}
                    onChange={() => toggleSelectAll()}
                    disabled={inStockItems.length === 0}
                  />
                  <span>Tất cả {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
                </label>

                <button
                  className={styles.quickBuyBtn}
                  onClick={handleCheckout}
                  disabled={!isCheckoutEnabled}
                >
                  Mua ngay
                </button>
              </div>

              {/* Danh sách Product Cards */}
              {items.map((item) => {
                const isSelected = selectedVariantIds.includes(item.variantId) && item.inStock;

                return (
                  <div key={item.variantId} className={styles.productCard}>
                    {/* Hàng trên cùng: Quà tặng giới hạn nếu có */}
                    {item.inStock && (
                      <div className={styles.giftBanner}>
                        <span className={styles.giftTag}>QUÀ TẶNG GIỚI HẠN</span>
                        <span className={styles.giftTitle}>
                          🎁 Tặng Bàn chải điện phiên bản CellphoneS | Số lượng: 1
                        </span>
                      </div>
                    )}

                    {/* Hàng chính: Checkbox, Ảnh, Thông tin, Giá, Stepper */}
                    <div className={styles.cardMainRow}>
                      <input
                        type="checkbox"
                        className={styles.itemCheckbox}
                        checked={isSelected}
                        onChange={() => toggleSelect(item.variantId)}
                        disabled={!item.inStock}
                      />

                      <div className={styles.thumbnailWrapper}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200'}
                          alt={item.name}
                          className={styles.thumbnail}
                        />
                      </div>

                      <div className={styles.itemInfo}>
                        <Link href={`/products/${item.slug}`} className={styles.productTitle}>
                          {item.name}
                        </Link>

                        {/* Badges giảm giá */}
                        <div className={styles.tagsRow}>
                          {item.discountAmount > 0 && (
                            <span className={styles.discountBadge}>
                              Đã giảm {formatPrice(item.discountAmount)}
                            </span>
                          )}
                          <span className={styles.studentBadge}>S-Student</span>
                        </div>

                        {/* Nếu hết hàng */}
                        {!item.inStock && (
                          <div className={styles.outOfStockRow}>
                            <span className={styles.outOfStockText}>Sản phẩm hết hàng</span>
                            <Link href="/products" className={styles.similarLink}>
                              Xem sản phẩm tương tự &gt;
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Giá & Nút tăng giảm số lượng */}
                      <div className={styles.priceAndActionCol}>
                        <div className={styles.priceBox}>
                          <span className={styles.salePrice}>{formatPrice(item.price)}</span>
                          {item.originalPrice > item.price && (
                            <span className={styles.originalPrice}>
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className={styles.actionRow}>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => removeItem(item.variantId)}
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={18} />
                          </button>

                          {/* Bộ tăng giảm số lượng */}
                          <div className={styles.quantityStepper}>
                            <button
                              className={styles.stepBtn}
                              disabled={!item.inStock || item.quantity <= 1}
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className={styles.quantityDisplay}>{item.quantity}</span>
                            <button
                              className={styles.stepBtn}
                              disabled={!item.inStock || item.quantity >= item.stockQuantity}
                              onClick={() => {
                                if (item.quantity >= item.stockQuantity) {
                                  showToast(`Số lượng trong kho chỉ còn ${item.stockQuantity} sản phẩm.`);
                                  return;
                                }
                                updateQuantity(item.variantId, item.quantity + 1);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Khối khuyến mãi đi kèm (Chỉ hiển thị khi còn hàng) */}
                    {item.inStock && (
                      <div className={styles.promoList}>
                        <div className={styles.promoRow}>
                          <span className={styles.promoTitle}>
                            <span>🔄</span> Thu cũ lên đời chỉ từ {formatPrice(item.price * 0.88)}
                          </span>
                          <span>&gt;</span>
                        </div>

                        <div>
                          <span className={styles.promoTitle}>
                            <span>🎁</span> Khuyến mãi đi kèm
                          </span>
                          <ul className={styles.promoBullets}>
                            <li className={styles.promoBulletItem}>
                              Ưu đãi dịch vụ hậu mãi độc quyền chính hãng
                            </li>
                            <li className={styles.promoBulletItem}>
                              Ưu đãi gói dùng thử dịch vụ AI Cloud 6 tháng trị giá 3.000.000đ
                            </li>
                            <li className={styles.promoBulletItem}>
                              Trả góp 0% lãi suất qua thẻ tín dụng và đối tác tài chính
                            </li>
                          </ul>
                        </div>

                        <div className={styles.promoRow}>
                          <span style={{ fontSize: '13px', color: '#d70018', fontWeight: 600 }}>
                            🛡️ Bảo vệ toàn diện với Bảo hành mở rộng 1 đổi 1
                          </span>
                          <span>&gt;</span>
                        </div>
                      </div>
                    )}

                    {/* Mua kèm tiết kiệm hơn */}
                    <div className={styles.crossSellSection}>
                      <div className={styles.crossSellHeader}>
                        <span className={styles.crossSellTitle}>
                          <span>👜</span> Mua kèm tiết kiệm hơn
                        </span>
                        <Link href="/products" className={styles.crossSellLink}>
                          Xem tất cả &gt;
                        </Link>
                      </div>

                      <div className={styles.crossSellGrid}>
                        <div className={styles.crossSellCard}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=100"
                            alt="Ốp lưng"
                            className={styles.crossSellThumb}
                          />
                          <div className={styles.crossSellInfo}>
                            <span className={styles.crossSellName}>Mua kèm ốp lưng chính hãng</span>
                            <span className={styles.crossSellDiscount}>Giảm thêm 30%</span>
                            <button
                              className={styles.crossSellAction}
                              onClick={() => showToast('Đã lưu ưu đãi mua kèm vào đơn hàng!')}
                            >
                              Chọn mua
                            </button>
                          </div>
                        </div>

                        <div className={styles.crossSellCard}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100"
                            alt="Sim 4G"
                            className={styles.crossSellThumb}
                          />
                          <div className={styles.crossSellInfo}>
                            <span className={styles.crossSellName}>Mua kèm SIM Data 4G</span>
                            <span className={styles.crossSellDiscount}>Giảm tối đa 50.000đ</span>
                            <button
                              className={styles.crossSellAction}
                              onClick={() => showToast('Đã áp dụng ưu đãi SIM!')}
                            >
                              Chọn mua
                            </button>
                          </div>
                        </div>

                        <div className={styles.crossSellCard}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=100"
                            alt="Loa Bluetooth"
                            className={styles.crossSellThumb}
                          />
                          <div className={styles.crossSellInfo}>
                            <span className={styles.crossSellName}>Giảm 15% mua kèm loa Sony</span>
                            <span className={styles.crossSellDiscount}>Giảm thêm 15%</span>
                            <button
                              className={styles.crossSellAction}
                              onClick={() => showToast('Đã lưu ưu đãi Loa Sony!')}
                            >
                              Chọn mua
                            </button>
                          </div>
                        </div>

                        <div className={styles.crossSellCard}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"
                            alt="Tai nghe"
                            className={styles.crossSellThumb}
                          />
                          <div className={styles.crossSellInfo}>
                            <span className={styles.crossSellName}>Mua kèm tai nghe Sony Pro</span>
                            <span className={styles.crossSellDiscount}>Giảm thêm 15%</span>
                            <button
                              className={styles.crossSellAction}
                              onClick={() => showToast('Đã lưu ưu đãi Tai nghe!')}
                            >
                              Chọn mua
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CỘT PHẢI (35%): Thông tin đơn hàng (Sticky) */}
            <div className={styles.rightColumn}>
              <div className={styles.orderSummaryCard}>
                <h3 className={styles.summaryTitle}>Thông tin đơn hàng</h3>

                {/* Áp dụng mã giảm giá */}
                <div className={styles.couponBar}>
                  <div className={styles.couponBarLeft}>
                    <Tag size={16} />
                    <span>
                      {cartData?.appliedCoupon
                        ? `Mã: ${cartData.appliedCoupon.code}`
                        : 'Áp dụng mã giảm giá'}
                    </span>
                  </div>
                  <button
                    className={styles.couponSelectBtn}
                    onClick={() => setIsCouponModalOpen(true)}
                  >
                    {cartData?.appliedCoupon ? 'Đổi mã' : 'Chọn'}
                  </button>
                </div>

                {/* Các hàng tổng hợp chi tiết */}
                <div className={styles.summaryRows}>
                  <div className={styles.summaryRow}>
                    <span>Số lượng sản phẩm</span>
                    <span className={styles.summaryRowValue}>
                      {selectedCount > 0 ? selectedCount : '-'}
                    </span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Tổng tiền hàng</span>
                    <span className={styles.summaryRowValue}>
                      {selectedCount > 0
                        ? formatPrice((summary?.subtotal || 0) + (summary?.directDiscount || 0))
                        : '-'}
                    </span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Phí vận chuyển</span>
                    <span className={styles.summaryRowValue}>
                      {selectedCount > 0
                        ? summary?.shippingFee === 0
                          ? 'Miễn phí'
                          : formatPrice(summary?.shippingFee)
                        : '-'}
                    </span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Giảm giá trực tiếp</span>
                    <span className={styles.discountValue}>
                      {selectedCount > 0 && (summary?.directDiscount || 0) > 0
                        ? `- ${formatPrice(summary?.directDiscount)}`
                        : '-'}
                    </span>
                  </div>

                  {selectedCount > 0 && cartData?.appliedCoupon && (
                    <div className={styles.summaryRow}>
                      <span>Mã giảm giá ({cartData.appliedCoupon.code})</span>
                      <span className={styles.discountValue}>
                        - {formatPrice(cartData.appliedCoupon.discount)}
                      </span>
                    </div>
                  )}

                  {selectedCount > 0 && (
                    <div className={styles.summaryRow}>
                      <span>Giảm giá S-Student</span>
                      <span className={styles.discountValue}>- 500.000đ</span>
                    </div>
                  )}
                </div>

                {/* Tổng tiền thanh toán */}
                <div className={styles.totalRow}>
                  <div className={styles.totalLabel}>
                    <span>TỔNG TIỀN</span>
                    <span className={styles.vatNotice}>(Đã bao gồm VAT và được làm tròn)</span>
                  </div>
                  <div className={styles.totalAmount}>
                    {selectedCount > 0 ? formatPrice(summary?.total) : '-'}
                  </div>
                </div>

                {/* Dòng bạn đã tiết kiệm được */}
                {selectedCount > 0 && (summary?.totalSavings || 0) > 0 && (
                  <div className={styles.savingsRow}>
                    <span>Bạn đã tiết kiệm được</span>
                    <span>- {formatPrice(summary?.totalSavings)}</span>
                  </div>
                )}

                {/* Nút MUA NGAY (Dominant Red Button) */}
                <button
                  className={styles.checkoutBtn}
                  disabled={!isCheckoutEnabled}
                  onClick={handleCheckout}
                >
                  <span className={styles.checkoutBtnTitle}>
                    MUA NGAY {selectedCount > 0 ? `(${selectedCount})` : ''}
                  </span>
                  <span className={styles.checkoutBtnSub}>
                    Giao nhanh từ 2 giờ hoặc nhận tại cửa hàng
                  </span>
                </button>

                {/* QR Code Khuyến mãi ứng dụng CellphoneS */}
                <div className={styles.qrCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://cellphones.com.vn"
                    alt="CellphoneS App QR"
                    className={styles.qrImage}
                  />
                  <div className={styles.qrText}>
                    Đăng nhập qua ứng dụng CellphoneS để tận hưởng thêm nhiều ưu đãi độc quyền.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Chọn Coupon */}
        <CouponModal
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          onApplyCoupon={applyCoupon}
          currentCouponCode={cartData?.appliedCoupon?.code}
        />
      </div>
    </div>
  );
}
