'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CategoryShowcase.module.css';
import { CategoryShowcaseData, ProductStatusType, ShowcaseProduct } from '../../types/categoryShowcase';
import { showcaseService } from '../../services/showcaseService';

const STATUS_CONFIG: Record<ProductStatusType, { text: string; className: string } | null> = {
  none: null,
  pre_order: { text: 'Hàng đặt trước', className: styles.statusPreOrder },
  coming_soon: { text: 'Sắp về hàng', className: styles.statusComingSoon },
  new_arrival: { text: 'Hàng mới về', className: styles.statusNewArrival },
  hot_sale: { text: 'Bán chạy', className: styles.statusHotSale },
  special_deal: { text: 'Giá sốc', className: styles.statusSpecialDeal },
};

const BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'OPPO',
  'Google',
  'HONOR',
  'vivo',
  'OnePlus',
  'Sony',
  'Nothing',
];

const INITIAL_SHOWCASE: CategoryShowcaseData = {
  banners: [
    { id: '1', title: 'iPhone 16 Series', imageUrl: '/images/banners/poster_iphone_duo.jpg', targetLink: '/products' },
    { id: '2', title: 'Redmi Note 13 Pro 5G', imageUrl: '/images/banners/poster_redmi_note17.jpg', targetLink: '/products' },
  ],
  featureFilters: [
    { id: 'f1', label: 'Điện thoại chơi game', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', tag: 'gaming' },
    { id: 'f2', label: 'Điện thoại pin trâu', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', tag: 'battery' },
    { id: 'f3', label: 'Điện thoại 5G', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400', tag: '5g' },
    { id: 'f4', label: 'Điện thoại chụp ảnh đẹp', imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', tag: 'camera' },
    { id: 'f5', label: 'Điện thoại gập', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', tag: 'fold' },
    { id: 'f6', label: 'Điện thoại AI', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400', tag: 'ai' },
  ],
  products: [
    {
      id: '1',
      name: 'iPhone 17 Pro 256GB',
      slug: 'iphone-17-pro-256gb',
      brand: 'Apple',
      category: 'phone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/v1793711824/products/iphone-17-pro-256-gb.webp',
      price: 33240000,
      oldPrice: 34990000,
      discountPercent: 5,
      hasZeroInstallment: true,
      status: 'new_arrival',
      tmemberDiscount: 'Tmember giảm đến 332.000đ',
      smemberDiscount: 'Tmember giảm đến 332.000đ',
      studentDiscount: 'T-Student giảm thêm 997.000đ',
      installmentNote: 'Trả góp 0% lãi suất',
      rating: 5,
      isFastDelivery: true,
      tags: ['5g', 'ai', 'camera', 'gaming'],
    },
    {
      id: '2',
      name: 'iPhone 17 256GB',
      slug: 'iphone-17-256gb',
      brand: 'Apple',
      category: 'phone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/v1793711829/products/iphone_17_256gb-3_2.webp',
      price: 23990000,
      oldPrice: 24990000,
      discountPercent: 4,
      hasZeroInstallment: true,
      status: 'new_arrival',
      tmemberDiscount: 'Tmember giảm đến 240.000đ',
      smemberDiscount: 'Tmember giảm đến 240.000đ',
      studentDiscount: 'T-Student giảm thêm 720.000đ',
      installmentNote: 'Trả góp 0% lãi suất',
      rating: 5,
      isFastDelivery: true,
      tags: ['5g', 'ai', 'camera'],
    },
    {
      id: '3',
      name: 'iPhone Air',
      slug: 'iphone-air',
      brand: 'Apple',
      category: 'phone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/v1793711830/products/iphone_air-3_2.webp',
      price: 30071000,
      oldPrice: 31990000,
      discountPercent: 6,
      hasZeroInstallment: true,
      status: 'new_arrival',
      tmemberDiscount: 'Tmember giảm đến 301.000đ',
      smemberDiscount: 'Tmember giảm đến 301.000đ',
      studentDiscount: 'T-Student giảm thêm 902.000đ',
      installmentNote: 'Trả góp 0% lãi suất',
      rating: 5,
      isFastDelivery: true,
      tags: ['5g', 'ai', 'camera'],
    },
    {
      id: '4',
      name: 'iPhone 18 Pro',
      slug: 'iphone-18-pro',
      brand: 'Apple',
      category: 'phone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/v1793711825/products/iphone-18-pro-01.webp',
      price: 36990000,
      oldPrice: 36990000,
      discountPercent: 0,
      hasZeroInstallment: true,
      status: 'new_arrival',
      tmemberDiscount: 'Tmember giảm đến 370.000đ',
      smemberDiscount: 'Tmember giảm đến 370.000đ',
      studentDiscount: 'T-Student giảm thêm 1.110.000đ',
      installmentNote: 'Trả góp 0% lãi suất',
      rating: 5,
      isFastDelivery: true,
      tags: ['5g', 'ai', 'camera', 'gaming'],
    },
    {
      id: '5',
      name: 'iPhone 18 Pro Max',
      slug: 'iphone-18-pro-max',
      brand: 'Apple',
      category: 'phone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/v1793711826/products/iphone-18-pro-max-01.webp',
      price: 42990000,
      oldPrice: 42990000,
      discountPercent: 0,
      hasZeroInstallment: true,
      status: 'special_deal',
      tmemberDiscount: 'Tmember giảm đến 430.000đ',
      smemberDiscount: 'Tmember giảm đến 430.000đ',
      studentDiscount: 'T-Student giảm thêm 1.290.000đ',
      installmentNote: 'Trả góp 0% lãi suất',
      rating: 5,
      isFastDelivery: true,
      tags: ['5g', 'ai', 'camera', 'gaming', 'battery'],
    },
    {
      id: '6',
      name: 'Samsung Galaxy S26 Ultra',
      slug: 'samsung-galaxy-s26-ultra',
      brand: 'Samsung',
      category: 'phone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/v1793711878/products/samsung-galaxy-s26-ultra-1.webp',
      price: 31271000,
      oldPrice: 33990000,
      discountPercent: 8,
      hasZeroInstallment: true,
      status: 'special_deal',
      tmemberDiscount: 'Tmember giảm đến 313.000đ',
      smemberDiscount: 'Tmember giảm đến 313.000đ',
      studentDiscount: 'T-Student giảm thêm 938.000đ',
      installmentNote: 'Trả góp 0% lãi suất',
      rating: 5,
      isFastDelivery: true,
      tags: ['5g', 'ai', 'camera', 'gaming', 'battery'],
    },
    {
      id: '7',
      name: 'Samsung Galaxy A37',
      slug: 'samsung-galaxy-a37',
      brand: 'Samsung',
      category: 'phone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/v1793711811/products/dien-thoai-samsung-galaxy-a37-2_2.webp',
      price: 8991000,
      oldPrice: 9990000,
      discountPercent: 10,
      hasZeroInstallment: true,
      status: 'new_arrival',
      tmemberDiscount: 'Tmember giảm đến 90.000đ',
      smemberDiscount: 'Tmember giảm đến 90.000đ',
      studentDiscount: 'T-Student giảm thêm 270.000đ',
      installmentNote: 'Trả góp 0% lãi suất',
      rating: 5,
      isFastDelivery: true,
      tags: ['5g', 'ai', 'camera'],
    },
    {
      id: '8',
      name: 'Samsung Galaxy Z Fold 8 Lavender',
      slug: 'samsung-galaxy-z-fold-8-lavender',
      brand: 'Samsung',
      category: 'phone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/v1793711879/products/samsung-galaxy-z-fold-8-lavender-01.webp',
      price: 44640000,
      oldPrice: 46990000,
      discountPercent: 5,
      hasZeroInstallment: true,
      status: 'special_deal',
      tmemberDiscount: 'Tmember giảm đến 446.000đ',
      smemberDiscount: 'Tmember giảm đến 446.000đ',
      studentDiscount: 'T-Student giảm thêm 1.339.000đ',
      installmentNote: 'Trả góp 0% lãi suất',
      rating: 5,
      isFastDelivery: true,
      tags: ['5g', 'ai', 'camera', 'fold'],
    },
    {
      id: '9',
      name: 'OPPO Find X10 Pro Max',
      slug: 'oppo-find-x10-pro-max',
      brand: 'OPPO',
      category: 'phone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/v1793711865/products/oppo-find-x10-pro-max-white-01_1.webp',
      price: 27891000,
      oldPrice: 29990000,
      discountPercent: 7,
      hasZeroInstallment: true,
      status: 'special_deal',
      tmemberDiscount: 'Tmember giảm đến 279.000đ',
      smemberDiscount: 'Tmember giảm đến 279.000đ',
      studentDiscount: 'T-Student giảm thêm 837.000đ',
      installmentNote: 'Trả góp 0% lãi suất',
      rating: 5,
      isFastDelivery: true,
      tags: ['5g', 'ai', 'camera', 'gaming', 'battery'],
    },
    {
      id: '10',
      name: 'Xiaomi 15 Ultra',
      slug: 'xiaomi-15-ultra',
      brand: 'Xiaomi',
      category: 'phone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/v1793711893/products/xiaomi_15_ultra-4_2.webp',
      price: 31990000,
      oldPrice: 34990000,
      discountPercent: 9,
      hasZeroInstallment: true,
      status: 'special_deal',
      tmemberDiscount: 'Tmember giảm đến 320.000đ',
      smemberDiscount: 'Tmember giảm đến 320.000đ',
      studentDiscount: 'T-Student giảm thêm 960.000đ',
      installmentNote: 'Trả góp 0% lãi suất',
      rating: 5,
      isFastDelivery: true,
      tags: ['5g', 'ai', 'camera', 'gaming', 'battery'],
    },
  ],
};

const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
};

const ShowcaseCard: React.FC<{
  product: ShowcaseProduct;
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
}> = ({ product, isFav, onToggleFav }) => {
  const [hasError, setHasError] = useState(false);
  const displayImage = hasError || !product.image ? '/images/placeholder-product.svg' : product.image;
  const statusCfg = STATUS_CONFIG[product.status];

  return (
    <Link
      href={`/products/${product.slug || product.id}`}
      className={styles.productCard}
    >
      {/* Badges Giảm % / Trả góp 0% */}
      <div className={styles.badgeRow}>
        {product.discountPercent ? (
          <span className={styles.discountBadge}>
            Giảm {product.discountPercent}%
          </span>
        ) : (
          <span />
        )}
        {product.hasZeroInstallment && (
          <span className={styles.installmentBadge}>Trả góp 0%</span>
        )}
      </div>

      {/* Product Image */}
      <div className={styles.imageContainer}>
        <Image
          src={displayImage}
          alt={product.name}
          fill
          unoptimized={Boolean(displayImage && displayImage.startsWith('http'))}
          className={styles.productImage}
          sizes="(max-width: 768px) 50vw, 25vw"
          onError={() => setHasError(true)}
        />
      </div>

      {/* Info */}
      <div className={styles.productInfo}>
        <h3 className={styles.productName} title={product.name}>{product.name}</h3>

        {/* Status tag */}
        <div className={styles.statusTagContainer}>
          {statusCfg && (
            <span className={`${styles.statusTag} ${statusCfg.className}`}>
              {product.statusCustomText || statusCfg.text}
            </span>
          )}
        </div>

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>
            {formatVND(product.price)}
          </span>
          {product.oldPrice && (
            <span className={styles.oldPrice}>
              {formatVND(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Tmember Discount Box */}
        {(product.tmemberDiscount || product.smemberDiscount) && (
          <div className={styles.smemberBox}>
            {product.tmemberDiscount || product.smemberDiscount}
          </div>
        )}

        {/* T-Student Box */}
        {product.studentDiscount && (
          <div className={styles.studentBox}>
            {product.studentDiscount}
          </div>
        )}

        {/* Installment note */}
        {product.installmentNote && (
          <div className={styles.installmentNote}>
            {product.installmentNote}
          </div>
        )}
      </div>

      {/* Card Footer: Fast Delivery 2h, Star rating, Favorite heart */}
      <div className={styles.cardFooter}>
        <div className={styles.footerLeft}>
          {product.isFastDelivery && (
            <span className={styles.fastDeliveryBadge} title="Giao nhanh 2 giờ">
              ⚡ 2 Giờ
            </span>
          )}
          {product.rating && (
            <span className={styles.ratingDisplay} title={`${product.rating} sao`}>
              ★ {product.rating}
            </span>
          )}
        </div>

        <button
          className={`${styles.heartBtn} ${isFav ? styles.favorited : ''}`}
          onClick={onToggleFav}
          title={isFav ? 'Bỏ thích' : 'Yêu thích'}
        >
          {isFav ? '❤️' : '♡'}
        </button>
      </div>
    </Link>
  );
};

export const CategoryShowcase: React.FC = () => {
  const [data, setData] = useState<CategoryShowcaseData>(INITIAL_SHOWCASE);
  const [activeCategory, setActiveCategory] = useState<'phone' | 'tablet'>('phone');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Luôn tải trực tiếp từ Database PostgreSQL
    const loadFromDatabase = () => {
      showcaseService.fetchFromDatabase().then((freshData) => {
        if (freshData && freshData.products && freshData.products.length > 0) {
          setData(freshData);
        }
      });
    };

    loadFromDatabase();

    window.addEventListener('category-showcase-updated', loadFromDatabase);
    return () => {
      window.removeEventListener('category-showcase-updated', loadFromDatabase);
    };
  }, []);

  const { banners, products } = data;

  // Lọc sản phẩm
  const filteredProducts = products.filter((item) => {
    if (item.category !== activeCategory) return false;
    if (selectedBrand && item.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (selectedFeature && item.tags && !item.tags.includes(selectedFeature)) return false;
    return true;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.container}>
        {/* ================= CỘT TRÁI: BANNER DỌC NGUYÊN BỨC ẢNH ================= */}
        <div className={styles.bannerCol}>
          {banners.slice(0, 2).map((b) => (
            <Link
              key={b.id}
              href={b.targetLink || '/'}
              className={styles.posterCard}
              title={b.title}
            >
              <div className={styles.posterImageWrapper}>
                <Image
                  src={b.imageUrl}
                  alt={b.title}
                  fill
                  unoptimized={Boolean(b.imageUrl && b.imageUrl.startsWith('http'))}
                  className={styles.posterImage}
                  sizes="270px"
                  priority
                />
              </div>
            </Link>
          ))}
        </div>

        {/* ================= CỘT PHẢI: TABS, FILTERS & GRID ================= */}
        <div className={styles.mainContent}>
          {/* Header Categories Tabs */}
          <div className={styles.headerNav}>
            <button
              className={`${styles.tabButton} ${
                activeCategory === 'phone' ? styles.active : styles.inactive
              }`}
              onClick={() => {
                setActiveCategory('phone');
                setSelectedFeature(null);
                setVisibleCount(8);
              }}
            >
              ĐIỆN THOẠI
              {activeCategory === 'phone' && <div className={styles.tabIndicator} />}
            </button>

            <button
              className={`${styles.tabButton} ${
                activeCategory === 'tablet' ? styles.active : styles.inactive
              }`}
              onClick={() => {
                setActiveCategory('tablet');
                setSelectedFeature(null);
                setVisibleCount(8);
              }}
            >
              MÁY TÍNH BẢNG
              {activeCategory === 'tablet' && <div className={styles.tabIndicator} />}
            </button>
          </div>

          {/* Quick Feature Filter Pills with Dynamic Image Thumbnails */}
          {activeCategory === 'phone' && (
            <div className={styles.featureFiltersBar}>
              {(data.featureFilters || []).map((filter) => (
                <button
                  key={filter.id}
                  className={`${styles.featureFilterItem} ${
                    selectedFeature === filter.tag ? styles.active : ''
                  }`}
                  onClick={() => {
                    setSelectedFeature(
                      selectedFeature === filter.tag ? null : filter.tag
                    );
                    setVisibleCount(8);
                  }}
                >
                  <span>{filter.label}</span>
                </button>
              ))}
              <button
                className={styles.scrollMoreBtn}
                title="Xem tất cả tính năng"
                onClick={() => {
                  setSelectedFeature(null);
                  setVisibleCount(8);
                }}
              >
                &gt;
              </button>
            </div>
          )}

          {/* Brand Filter Pills */}
          <div className={styles.brandRow}>
            {BRANDS.map((brand) => (
              <button
                key={brand}
                className={`${styles.brandPill} ${
                  selectedBrand === brand ? styles.active : ''
                }`}
                onClick={() => {
                  setSelectedBrand(selectedBrand === brand ? null : brand);
                  setVisibleCount(8);
                }}
              >
                {brand}
              </button>
            ))}
            <Link
              href={activeCategory === 'tablet' ? '/products?category=tablet' : '/products?category=phone'}
              className={styles.viewAllLink}
            >
              Xem tất cả ({filteredProducts.length}) &gt;
            </Link>
          </div>

          {/* Product Cards Grid (4 Cột x 2 hàng mặc định) */}
          {displayedProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>
                {activeCategory === 'tablet'
                  ? 'Danh mục Máy tính bảng đang được cập nhật sản phẩm mới.'
                  : 'Chưa có sản phẩm nào phù hợp với bộ lọc hiện tại.'}
              </p>
              <button
                type="button"
                className={styles.emptyBtn}
                onClick={() => {
                  setActiveCategory('phone');
                  setSelectedBrand(null);
                  setSelectedFeature(null);
                  setVisibleCount(8);
                }}
              >
                Xem tất cả điện thoại
              </button>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {displayedProducts.map((product) => (
                <ShowcaseCard
                  key={product.id}
                  product={product}
                  isFav={Boolean(favorites[product.id])}
                  onToggleFav={(e) => toggleFavorite(product.id, e)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
