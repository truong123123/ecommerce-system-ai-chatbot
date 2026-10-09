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
  'TECNO',
  'HONOR',
  'Nubia',
  'Sony',
  'Nokia',
  'Infinix',
];

const INITIAL_PRODUCTS: ShowcaseProduct[] = [
  {
    id: 'p1',
    name: 'iPhone 18 Pro Max 256GB',
    slug: 'iphone-16-pro-max',
    image: '/images/products/phones/phone_burgundy_18pro.jpg',
    status: 'new_arrival',
    statusCustomText: 'Hàng mới về',
    price: 41990000,
    oldPrice: 45990000,
    discountPercent: 9,
    smemberDiscount: 'Smember giảm đến 420.000đ',
    installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
    hasZeroInstallment: true,
    isFastDelivery: true,
    rating: 5,
    category: 'phone',
    brand: 'Apple',
    tags: ['5g', 'camera', 'ai'],
  },
  {
    id: 'p2',
    name: 'iPhone Duo 256GB',
    slug: 'iphone-duo-256gb',
    image: '/images/products/phones/phone_duo_open.jpg',
    status: 'coming_soon',
    statusCustomText: 'Sắp về hàng',
    price: 64990000,
    smemberDiscount: 'Smember giảm đến 650.000đ',
    installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
    hasZeroInstallment: true,
    isFastDelivery: false,
    rating: 5,
    category: 'phone',
    brand: 'Apple',
    tags: ['fold', '5g', 'ai'],
  },
  {
    id: 'p3',
    name: 'iPhone 18 Pro 256GB',
    slug: 'iphone-16-128gb',
    image: '/images/products/phones/phone_burgundy_18pro.jpg',
    status: 'new_arrival',
    statusCustomText: 'Hàng mới về',
    price: 38490000,
    oldPrice: 41490000,
    discountPercent: 7,
    smemberDiscount: 'Smember giảm đến 385.000đ',
    installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
    hasZeroInstallment: true,
    isFastDelivery: true,
    rating: 5,
    category: 'phone',
    brand: 'Apple',
    tags: ['camera', '5g', 'ai'],
  },
  {
    id: 'p4',
    name: 'iPhone 17 Pro 256GB | Chính hãng',
    slug: 'iphone-15-pro-max',
    image: '/images/products/phones/phone_copper_17pro.jpg',
    status: 'none',
    price: 31990000,
    oldPrice: 34990000,
    discountPercent: 9,
    smemberDiscount: 'Smember giảm đến 320.000đ',
    installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
    hasZeroInstallment: true,
    isFastDelivery: true,
    rating: 5,
    category: 'phone',
    brand: 'Apple',
    tags: ['camera', '5g'],
  },
  {
    id: 'p5',
    name: 'OPPO Reno16 F 5G 8GB 256GB',
    slug: 'oppo-reno16-f-5g',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    status: 'none',
    price: 14540000,
    oldPrice: 15990000,
    discountPercent: 9,
    smemberDiscount: 'Smember giảm đến 145.000đ',
    studentDiscount: 'S-Student giảm thêm 300.000đ',
    installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
    hasZeroInstallment: true,
    isFastDelivery: false,
    rating: 5,
    category: 'phone',
    brand: 'OPPO',
    tags: ['5g', 'camera'],
  },
  {
    id: 'p6',
    name: 'Xiaomi POCO F9 Ultra 5G 12GB 256GB',
    slug: 'xiaomi-14-ultra-512gb',
    image: '/images/products/phones/phone_poco_x8.jpg',
    status: 'new_arrival',
    statusCustomText: 'Hàng mới về',
    price: 24290000,
    oldPrice: 29990000,
    discountPercent: 19,
    smemberDiscount: 'Smember giảm đến 243.000đ',
    studentDiscount: 'S-Student giảm thêm 500.000đ',
    installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
    hasZeroInstallment: true,
    isFastDelivery: false,
    rating: 5,
    category: 'phone',
    brand: 'Xiaomi',
    tags: ['gaming', 'battery', '5g'],
  },
  {
    id: 'p7',
    name: 'iPhone Air 256GB | Chính hãng',
    slug: 'iphone-16-pro-max',
    image: '/images/products/phones/phone_iphone_air.jpg',
    status: 'none',
    price: 22990000,
    oldPrice: 31990000,
    discountPercent: 28,
    smemberDiscount: 'Smember giảm đến 230.000đ',
    installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
    hasZeroInstallment: true,
    isFastDelivery: true,
    rating: 4.9,
    category: 'phone',
    brand: 'Apple',
    tags: ['ai', '5g'],
  },
  {
    id: 'p8',
    name: 'POCO X8 Pro Max 12GB 256GB',
    slug: 'samsung-galaxy-s25-ultra',
    image: '/images/products/phones/phone_poco_x8.jpg',
    status: 'none',
    price: 13990000,
    oldPrice: 16990000,
    discountPercent: 18,
    smemberDiscount: 'Smember giảm đến 140.000đ',
    studentDiscount: 'S-Student giảm thêm 300.000đ',
    installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
    hasZeroInstallment: true,
    isFastDelivery: true,
    rating: 4.9,
    category: 'phone',
    brand: 'Xiaomi',
    tags: ['gaming', 'battery'],
  },
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
  products: INITIAL_PRODUCTS,
};

export const CategoryShowcase: React.FC = () => {
  const [data, setData] = useState<CategoryShowcaseData>(INITIAL_SHOWCASE);
  const [activeCategory, setActiveCategory] = useState<'phone' | 'tablet'>('phone');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
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

    // Lắng nghe cập nhật khi Admin thay đổi dữ liệu trong SQL
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

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  };

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
                  onClick={() =>
                    setSelectedFeature(
                      selectedFeature === filter.tag ? null : filter.tag
                    )
                  }
                >
                  <span>{filter.label}</span>
                </button>
              ))}
              <button
                className={styles.scrollMoreBtn}
                title="Xem tất cả tính năng"
                onClick={() => setSelectedFeature(null)}
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
                onClick={() =>
                  setSelectedBrand(selectedBrand === brand ? null : brand)
                }
              >
                {brand}
              </button>
            ))}
            <button
              className={styles.viewAllLink}
              onClick={() => {
                setSelectedBrand(null);
                setSelectedFeature(null);
              }}
            >
              Xem tất cả &gt;
            </button>
          </div>

          {/* Product Cards Grid (4 Cột x N Hàng) */}
          <div className={styles.productGrid}>
            {filteredProducts.map((product) => {
              const statusCfg = STATUS_CONFIG[product.status];
              const isFav = favorites[product.id];

              return (
                <Link
                  key={product.id}
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
                      src={product.image}
                      alt={product.name}
                      fill
                      className={styles.productImage}
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>

                  {/* Info */}
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>

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

                    {/* Smember Discount Box */}
                    {product.smemberDiscount && (
                      <div className={styles.smemberBox}>
                        {product.smemberDiscount}
                      </div>
                    )}

                    {/* S-Student Box */}
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(product.id, e);
                      }}
                      title={isFav ? 'Bỏ thích' : 'Yêu thích'}
                    >
                      {isFav ? '❤️' : '♡'}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
