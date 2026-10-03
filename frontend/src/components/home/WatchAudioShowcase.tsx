'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './WatchAudioShowcase.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface WatchProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  image: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  smemberText: string;
  installmentText: string;
  rating: number;
}

// 1. Category Tabs
const WATCH_TABS = [
  { id: 'dong-ho', label: 'ĐỒNG HỒ' },
  { id: 'am-thanh', label: 'ÂM THANH' },
];

// 2. Need Pills
const NEED_PILLS = [
  { id: 'sport', label: 'Tập luyện thể thao', iconUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=60&q=80' },
  { id: 'call', label: 'Nghe gọi', iconUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=60&q=80' },
  { id: 'band', label: 'Vòng đeo tay thông minh', iconUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&q=80' },
  { id: 'kids', label: 'Định vị trẻ em', iconUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=60&q=80' },
  { id: 'health', label: 'Đo huyết áp', iconUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=60&q=80' },
  { id: 'waterproof', label: 'Chống nước', iconUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&q=80' },
];

// 3. Brands
const BRANDS_LIST = [
  'Tất cả',
  'Apple Watch',
  'Samsung',
  'Xiaomi',
  'Huawei',
  'Garmin',
  'Amazfit',
  'Kieslect',
  'Coros',
  'Soundpeats',
];

const INITIAL_WATCH_PRODUCTS: WatchProduct[] = [
  {
    id: 'w-1',
    name: 'Apple Watch Series 10 Nhôm 46mm GPS | Chính Hãng VN/A',
    slug: 'apple-watch-series-10-46mm',
    brand: 'Apple Watch',
    category: 'dong-ho',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
    price: 11590000,
    oldPrice: 12490000,
    discountPercent: 7,
    smemberText: 'Smember giảm đến 120.000đ',
    installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
    rating: 5,
  },
  {
    id: 'w-2',
    name: 'Apple Watch Ultra 2 49mm Vỏ Titan | Dây Alpine Loop',
    slug: 'apple-watch-ultra-2',
    brand: 'Apple Watch',
    category: 'dong-ho',
    image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&q=80',
    price: 20990000,
    oldPrice: 21990000,
    discountPercent: 5,
    smemberText: 'Smember giảm đến 210.000đ',
    installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
    rating: 5,
  },
  {
    id: 'w-3',
    name: 'Samsung Galaxy Watch 7 40mm Bluetooth | Chính Hãng',
    slug: 'samsung-galaxy-watch-7',
    brand: 'Samsung',
    category: 'dong-ho',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    price: 6990000,
    oldPrice: 7990000,
    discountPercent: 12,
    smemberText: 'Smember giảm đến 70.000đ',
    installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
    rating: 5,
  },
  {
    id: 'w-4',
    name: 'Tai nghe Bluetooth Apple AirPods Pro 2 2023 Type-C',
    slug: 'apple-airpods-pro-2-type-c',
    brand: 'Apple Watch',
    category: 'dong-ho',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80',
    price: 5690000,
    oldPrice: 6190000,
    discountPercent: 8,
    smemberText: 'Smember giảm đến 60.000đ',
    installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
    rating: 5,
  },
  {
    id: 'w-5',
    name: 'Tai nghe chụp tai Sony WH-1000XM5 Chống Ồn',
    slug: 'sony-wh-1000xm5',
    brand: 'Soundpeats',
    category: 'dong-ho',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    price: 7990000,
    oldPrice: 8990000,
    discountPercent: 11,
    smemberText: 'Smember giảm đến 80.000đ',
    installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
    rating: 5,
  },
  {
    id: 'w-6',
    name: 'Loa Bluetooth Marshall Emberton II Chính Hãng ASH',
    slug: 'marshall-emberton-ii',
    brand: 'Soundpeats',
    category: 'dong-ho',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80',
    price: 4390000,
    oldPrice: 4990000,
    discountPercent: 12,
    smemberText: 'Smember giảm đến 45.000đ',
    installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
    rating: 5,
  },
  {
    id: 'w-7',
    name: 'Đồng hồ thông minh Garmin Forerunner 165',
    slug: 'garmin-forerunner-165',
    brand: 'Garmin',
    category: 'dong-ho',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
    price: 6690000,
    oldPrice: 7290000,
    discountPercent: 8,
    smemberText: 'Smember giảm đến 70.000đ',
    installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
    rating: 5,
  },
  {
    id: 'w-8',
    name: 'Vòng đeo tay thông minh Xiaomi Smart Band 9',
    slug: 'xiaomi-smart-band-9',
    brand: 'Xiaomi',
    category: 'dong-ho',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80',
    price: 990000,
    oldPrice: 1090000,
    discountPercent: 9,
    smemberText: 'Smember giảm đến 20.000đ',
    installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
    rating: 5,
  },
];

export const WatchAudioShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dong-ho');
  const [activeNeed, setActiveNeed] = useState('sport');
  const [activeBrand, setActiveBrand] = useState('Tất cả');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<WatchProduct[]>(INITIAL_WATCH_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<{ id: string; title: string; imageUrl: string; targetLink: string }[]>([
    {
      id: 'watch-b1',
      title: 'Apple Watch & Galaxy Watch',
      imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&q=80',
      targetLink: '/products?keyword=watch',
    },
  ]);

  const fetchWatchAndAudio = async () => {
    try {
      setLoading(true);
      const [res, bRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`, { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/banners`, { cache: 'no-store' }),
      ]);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: WatchProduct[] = data
            .filter((p: any) => {
              const cSlug = (p.categorySlug || '').toLowerCase();
              const cName = (p.categoryName || '').toLowerCase();
              const pName = (p.name || '').toLowerCase();
              return (
                cSlug === 'dong-ho' ||
                cSlug === 'am-thanh' ||
                cSlug === 'apple-watch' ||
                cName.includes('đồng hồ') ||
                cName.includes('âm thanh') ||
                cName.includes('watch') ||
                pName.includes('watch') ||
                pName.includes('airpods') ||
                pName.includes('sony') ||
                pName.includes('marshall') ||
                pName.includes('amazfit') ||
                pName.includes('myalo')
              );
            })
            .map((p: any) => {
              const price = Number(p.price) || 0;
              const oldPrice = p.maxPrice && Number(p.maxPrice) > price ? Number(p.maxPrice) : Math.round(price * 1.2);
              const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
              const pName = (p.name || '').toLowerCase();
              const isWatch = pName.includes('watch') || pName.includes('amazfit') || pName.includes('myalo') || p.categorySlug === 'dong-ho' || p.categorySlug === 'apple-watch';

              return {
                id: String(p.id),
                name: p.name,
                slug: p.slug,
                brand: p.brandName || 'Apple',
                category: isWatch ? 'dong-ho' : 'am-thanh',
                image: p.primaryImage || 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&q=80',
                price,
                oldPrice,
                discountPercent: discount,
                smemberText: `Smember giảm đến ${new Intl.NumberFormat('vi-VN').format(Math.round(price * 0.01))}đ`,
                installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 6 tháng',
                rating: 5,
              };
            });

          setProducts(mapped);
        }
      }

      if (bRes.ok) {
        const bData = await bRes.json();
        if (Array.isArray(bData)) {
          const watchBanners = bData.filter((b: any) => {
            const t = (b.title || '').toLowerCase();
            const l = (b.primaryBtnLink || '').toLowerCase();
            return (
              t.includes('watch') ||
              t.includes('đồng hồ') ||
              t.includes('tai nghe') ||
              t.includes('âm thanh') ||
              l.includes('watch') ||
              l.includes('audio')
            );
          });
          if (watchBanners.length > 0) {
            setBanners(
              watchBanners.slice(0, 2).map((b: any) => ({
                id: String(b.id),
                title: b.title,
                imageUrl: b.imageUrl,
                targetLink: b.primaryBtnLink || '/products?keyword=watch',
              }))
            );
          }
        }
      }
    } catch (e) {
      console.error('Lỗi khi tải đồng hồ & âm thanh từ CSDL:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchAndAudio();
    window.addEventListener('category-showcase-updated', fetchWatchAndAudio);
    return () => {
      window.removeEventListener('category-showcase-updated', fetchWatchAndAudio);
    };
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'dong-ho' && p.category !== 'dong-ho') return false;
    if (activeTab === 'am-thanh' && p.category !== 'am-thanh') return false;

    if (activeBrand !== 'Tất cả') {
      if (!p.name.toLowerCase().includes(activeBrand.toLowerCase()) && !p.brand.toLowerCase().includes(activeBrand.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + '₫';
  };

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className={styles.sectionWrapper} aria-label="Chuyên mục Đồng hồ và Âm thanh">
      <div className={styles.container}>
        {/* ================= CỘT TRÁI: POSTER BANNER ĐỒNG HỒ ================= */}
        <div className={styles.bannerCol}>
          {banners.slice(0, 2).map((b) => (
            <Link
              key={b.id}
              href={b.targetLink || '/products?keyword=watch'}
              className={styles.posterCard}
              title={b.title}
            >
              <div className={styles.posterImageWrapper}>
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className={styles.posterImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&q=80';
                  }}
                />
                <div className={styles.posterOverlay}>
                  <span className={styles.posterBadge}>Ưu đãi độc quyền</span>
                  <h3 className={styles.posterTitle}>{b.title}</h3>
                  <span className={styles.posterBtn}>MUA NGAY &gt;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ================= CỘT PHẢI: BỘ LỌC VÀ DANH SÁCH SẢN PHẨM ================= */}
        <div className={styles.contentCol}>
          {/* 1. Category Tabs */}
          <div className={styles.categoryTabs}>
            {WATCH_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 2. Needs / Feature Pills */}
          <div className={styles.featurePillsRow}>
            {NEED_PILLS.map((pill) => (
              <button
                key={pill.id}
                className={`${styles.featurePill} ${activeNeed === pill.id ? styles.activePill : ''}`}
                onClick={() => setActiveNeed(pill.id)}
              >
                <span>{pill.label}</span>
              </button>
            ))}
          </div>

          {/* 3. Brand Filter Chips */}
          <div className={styles.brandsRow}>
            <div className={styles.brandsGroup}>
              {BRANDS_LIST.map((brand) => (
                <button
                  key={brand}
                  className={`${styles.brandChip} ${activeBrand === brand ? styles.activeBrand : ''}`}
                  onClick={() => setActiveBrand(brand)}
                >
                  {brand}
                </button>
              ))}
            </div>

            <Link href="/products?categorySlug=dong-ho" className={styles.viewAllLink}>
              <span>Xem tất cả</span>
              <span>&gt;</span>
            </Link>
          </div>

          {/* 4. Product Grid (4 Cột) */}
          {loading ? (
            <div style={{ color: '#9ca3af', padding: 40, textAlign: 'center' }}>
              Đang tải danh sách đồng hồ & âm thanh từ CSDL PostgreSQL...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ color: '#9ca3af', padding: 40, textAlign: 'center' }}>
              Chưa có sản phẩm nào phù hợp trong danh mục này.
            </div>
          ) : (
            <div className={styles.productGrid}>
              {filteredProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className={styles.productCard}
                  title={p.name}
                >
                  {/* Top Badges */}
                  <div className={styles.cardBadges}>
                    {p.discountPercent > 0 ? (
                      <span className={styles.discountBadge}>Giảm {p.discountPercent}%</span>
                    ) : <span />}
                    <span className={styles.installmentBadge}>Trả góp 0%</span>
                  </div>

                  {/* Ảnh sản phẩm */}
                  <div className={styles.imageBox}>
                    <img src={p.image} alt={p.name} className={styles.prodImage} loading="lazy" />
                  </div>

                  {/* Tên sản phẩm */}
                  <h4 className={styles.productName}>{p.name}</h4>

                  {/* Giá bán */}
                  <div className={styles.priceRow}>
                    <span className={styles.currentPrice}>{formatVND(p.price)}</span>
                    {p.oldPrice > p.price && (
                      <span className={styles.oldPrice}>{formatVND(p.oldPrice)}</span>
                    )}
                  </div>

                  {/* Ưu đãi thành viên */}
                  <div className={styles.promosBox}>
                    <span className={styles.promoPillSmember}>{p.smemberText}</span>
                  </div>

                  {/* Chú thích trả góp */}
                  <p className={styles.installmentNote}>{p.installmentText}</p>

                  {/* Bottom Footer */}
                  <div className={styles.cardFooter}>
                    <span className={styles.deliveryBadge}>⚡ 2 Giờ</span>
                    <span className={styles.ratingText}>★ {p.rating}</span>
                    <button
                      className={`${styles.favBtn} ${favorites[p.id] ? styles.activeFav : ''}`}
                      onClick={(e) => toggleFav(p.id, e)}
                      title="Yêu thích"
                    >
                      {favorites[p.id] ? '❤️' : '🤍'}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
