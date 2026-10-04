'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './LaptopShowcase.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface LaptopProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  image: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  specs: string;
  smemberText: string;
  studentText: string;
  installmentText: string;
  rating: number;
  isNewArrival?: boolean;
}

// 1. Category Tabs
const CATEGORY_TABS = [
  { id: 'laptop', label: 'LAPTOP' },
  { id: 'man-hinh', label: 'MÀN HÌNH MÁY TÍNH' },
  { id: 'pc', label: 'PC' },
  { id: 'phu-kien-may-tinh', label: 'PHỤ KIỆN MÁY TÍNH' },
];

// 2. Need Pills (Pills with miniature photos)
const NEED_PILLS = [
  { id: 'all', label: 'Tất cả nhu cầu', iconUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=60&q=80' },
  { id: 'office', label: 'Văn phòng', iconUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=60&q=80' },
  { id: 'gaming', label: 'Gaming', iconUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=60&q=80' },
  { id: 'slim', label: 'Mỏng nhẹ', iconUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=60&q=80' },
  { id: 'graphic', label: 'Đồ họa - kỹ thuật', iconUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=60&q=80' },
  { id: 'student', label: 'Sinh viên', iconUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=60&q=80' },
  { id: 'touch', label: 'Cảm ứng', iconUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=60&q=80' },
];

// 3. Brands
const BRANDS_LIST = [
  'MacBook',
  'ASUS',
  'Lenovo',
  'MSI',
  'Acer',
  'HP',
  'Dell',
  'LG',
  'Gigabyte',
  'Masstel',
];

const INITIAL_LAPTOPS: LaptopProduct[] = [
  {
    id: 'lap-1',
    name: 'Apple Mac mini M6 12CPU 12GPU 16GB 256GB 2026 | Chính hãng',
    slug: 'apple-mac-mini-m6-16-256',
    brand: 'MacBook',
    category: 'laptop',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80',
    price: 24990000,
    oldPrice: 24990000,
    discountPercent: 0,
    specs: 'Apple M5  12 nhân GPU | 16GB  256GB',
    smemberText: 'Smember giảm đến 250.000đ',
    studentText: 'S-Student giảm thêm 500.000đ',
    installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
    rating: 5,
    isNewArrival: true,
  },
  {
    id: 'lap-2',
    name: 'Laptop HP Omnibook 5 AI 16-AF1048TU BZ7Q9PA',
    slug: 'hp-omnibook-5-ai-16',
    brand: 'HP',
    category: 'laptop',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80',
    price: 25990000,
    oldPrice: 27590000,
    discountPercent: 6,
    specs: 'U5-225U  Intel Graphics | 16GB  512GB  16" WUXGA',
    smemberText: 'Smember giảm đến 260.000đ',
    studentText: 'Giảm đến 1 triệu khi thanh toán qua thẻ tín dụng HSBC và 4 đối tác',
    installmentText: 'Trả góp 0% lãi suất, tối đa 12 tháng, trả trước từ 10% qua CTTC hoặc ...',
    rating: 5,
  },
  {
    id: 'lap-3',
    name: 'Laptop ASUS VivoBook 14 X1407CA-LY009W',
    slug: 'asus-vivobook-14-x1407ca',
    brand: 'ASUS',
    category: 'laptop',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
    price: 22190000,
    oldPrice: 25990000,
    discountPercent: 15,
    specs: 'U5-225H  Intel Graphics | 16GB  512GB  14" WUXGA',
    smemberText: 'Smember giảm đến 222.000đ',
    studentText: 'S-Student giảm thêm 1.000.000đ',
    installmentText: 'Trả góp 0% lãi suất, tối đa 12 tháng, trả trước từ 10% qua CTTC hoặc ...',
    rating: 5,
  },
  {
    id: 'lap-4',
    name: 'Laptop MSI Cyborg 15 A13UC-2062VN',
    slug: 'msi-cyborg-15-a13uc',
    brand: 'MSI',
    category: 'laptop',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80',
    price: 27990000,
    oldPrice: 30990000,
    discountPercent: 9,
    specs: 'i7-13620H  RTX 3050 | 16GB  512GB  15.6" Full HD',
    smemberText: 'Smember giảm đến 280.000đ',
    studentText: 'S-Student giảm thêm 1.000.000đ',
    installmentText: 'Nâng cấp Laptop - PC lên Windows 11 Pro chỉ với 1.690.000...',
    rating: 5,
  },
  {
    id: 'lap-5',
    name: 'Laptop MSI Katana 15 B13VEK-2440VN',
    slug: 'msi-katana-15-b13vek',
    brand: 'MSI',
    category: 'laptop',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
    price: 34990000,
    oldPrice: 39990000,
    discountPercent: 13,
    specs: 'i7-13620H  RTX 4050 | 16GB  1TB  15.6" Full HD',
    smemberText: 'Smember giảm đến 350.000đ',
    studentText: 'S-Student giảm thêm 1.000.000đ',
    installmentText: 'Trả góp 0% lãi suất, tối đa 12 tháng, trả trước từ 10% qua CTTC hoặc ...',
    rating: 5,
  },
  {
    id: 'lap-6',
    name: 'MacBook Neo 13 inch A18 Pro 2026 6CPU 5GPU 8GB 512GB',
    slug: 'macbook-neo-13-a18-pro',
    brand: 'MacBook',
    category: 'laptop',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    price: 21390000,
    oldPrice: 21990000,
    discountPercent: 3,
    specs: 'A18 Pro  5 nhân GPU | 8GB  512GB  13.0" 2.4K',
    smemberText: 'Smember giảm đến 214.000đ',
    studentText: 'S-Student giảm thêm 500.000đ',
    installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
    rating: 5,
  },
  {
    id: 'lap-7',
    name: 'Laptop ASUS TUF Gaming A15 FA506NCG-HN329W',
    slug: 'asus-tuf-gaming-a15',
    brand: 'ASUS',
    category: 'laptop',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
    price: 27490000,
    oldPrice: 37990000,
    discountPercent: 27,
    specs: 'R7-8845HS  RTX 3050 | 16GB  512GB  15.6" Full HD',
    smemberText: 'Smember giảm đến 275.000đ',
    studentText: 'S-Student giảm thêm 1.000.000đ',
    installmentText: 'Nâng cấp Laptop - PC lên Windows 11 Pro chỉ với 1.690.000...',
    rating: 5,
  },
  {
    id: 'lap-8',
    name: 'Laptop MSI Modern 15 F1MG-1225VN',
    slug: 'msi-modern-15-f1mg',
    brand: 'MSI',
    category: 'laptop',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80',
    price: 19190000,
    oldPrice: 21990000,
    discountPercent: 12,
    specs: 'CORE 5-120U  Intel Graphics | 16GB  512GB  15.6" Full HD',
    smemberText: 'Smember giảm đến 192.000đ',
    studentText: 'S-Student giảm thêm 800.000đ',
    installmentText: 'Nâng cấp Laptop - PC lên Windows 11 Pro chỉ với 1.690.000...',
    rating: 5,
  },
];

export const LaptopShowcase: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('laptop');
  const [activeNeed, setActiveNeed] = useState('all');
  const [activeBrand, setActiveBrand] = useState('Tất cả');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<LaptopProduct[]>(INITIAL_LAPTOPS);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<{ id: string; title: string; imageUrl: string; targetLink: string }[]>([
    {
      id: 'lap-b1',
      title: 'Laptop AI',
      imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
      targetLink: '/products?keyword=laptop',
    },
    {
      id: 'lap-b2',
      title: 'Mac mini',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
      targetLink: '/products?keyword=mac',
    },
  ]);

  // Fetch Laptop / PC / Monitor Products & Banners from PostgreSQL Database
  const fetchLaptopsFromDb = async () => {
    try {
      setLoading(true);
      const [res, bRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`, { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/banners`, { cache: 'no-store' }),
      ]);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: LaptopProduct[] = data
            .filter((p: any) => {
              const cSlug = (p.categorySlug || '').toLowerCase();
              const cName = (p.categoryName || '').toLowerCase();
              const pName = (p.name || '').toLowerCase();
              return (
                cSlug === 'laptop' ||
                cSlug === 'pc' ||
                cSlug === 'macbook' ||
                cSlug === 'man-hinh' ||
                cSlug === 'phu-kien-may-tinh' ||
                cName.includes('laptop') ||
                cName.includes('macbook') ||
                cName.includes('pc') ||
                pName.includes('laptop') ||
                pName.includes('macbook') ||
                pName.includes('mac mini') ||
                pName.includes('vivobook') ||
                pName.includes('omnibook') ||
                pName.includes('cyborg') ||
                pName.includes('ideapad') ||
                pName.includes('tuf')
              );
            })
            .map((p: any) => {
              const price = Number(p.price) || 0;
              const oldPrice = p.maxPrice && Number(p.maxPrice) > price ? Number(p.maxPrice) : Math.round(price * 1.1);
              const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

              let specsStr = 'Intel Core i5 | 16GB RAM | 512GB SSD';
              if (p.variants && p.variants.length > 0) {
                const attrs = p.variants[0].attributes;
                if (typeof attrs === 'object' && attrs !== null) {
                  const cpu = attrs.cpu || '';
                  const gpu = attrs.gpu || '';
                  const ram = attrs.ram || '';
                  const ssd = attrs.ssd || '';
                  const screen = attrs.screen || '';
                  specsStr = [cpu, gpu, `${ram} ${ssd}`.trim(), screen].filter(Boolean).join(' | ');
                }
              }

              return {
                id: String(p.id),
                name: p.name,
                slug: p.slug,
                brand: p.brandName || 'ASUS',
                category: (p.categorySlug || 'laptop').toLowerCase(),
                image: p.primaryImage || 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80',
                price,
                oldPrice,
                discountPercent: discount,
                specs: specsStr,
                smemberText: `Smember giảm đến ${new Intl.NumberFormat('vi-VN').format(Math.round((price * 0.01) / 1000) * 1000)}đ`,
                studentText: `S-Student giảm thêm ${new Intl.NumberFormat('vi-VN').format(Math.round((price * 0.03) / 1000) * 1000)}đ`,
                installmentText: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 12 tháng',
                rating: 5,
                isNewArrival: p.name.includes('M6') || p.name.includes('AI') || p.name.includes('2026'),
              };
            });

          setProducts(mapped);
        }
      }

      if (bRes.ok) {
        const bData = await bRes.json();
        if (Array.isArray(bData)) {
          const lapBanners = bData.filter((b: any) => {
            const t = (b.title || '').toLowerCase();
            const l = (b.primaryBtnLink || '').toLowerCase();
            return t.includes('laptop') || t.includes('mac') || l.includes('laptop') || l.includes('mac');
          });
          if (lapBanners.length > 0) {
            setBanners(
              lapBanners.slice(0, 2).map((b: any) => ({
                id: String(b.id),
                title: b.title,
                imageUrl: b.imageUrl,
                targetLink: b.primaryBtnLink || '/products?keyword=laptop',
              }))
            );
          }
        }
      }
    } catch (e) {
      console.error('Lỗi khi tải laptop từ CSDL:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaptopsFromDb();
    window.addEventListener('category-showcase-updated', fetchLaptopsFromDb);
    return () => {
      window.removeEventListener('category-showcase-updated', fetchLaptopsFromDb);
    };
  }, []);

  // Filter products by category tab and brand
  const filteredProducts = products.filter((p) => {
    // 1. Tab filter
    if (activeCategory === 'laptop') {
      if (p.category !== 'laptop' && p.category !== 'macbook') return false;
    } else if (activeCategory === 'pc') {
      if (p.category !== 'pc') return false;
    } else if (activeCategory === 'man-hinh') {
      if (p.category !== 'man-hinh') return false;
    } else if (activeCategory === 'phu-kien-may-tinh') {
      if (p.category !== 'phu-kien-may-tinh') return false;
    }

    // 2. Brand filter
    if (activeBrand !== 'Tất cả') {
      if (p.brand.toLowerCase() !== activeBrand.toLowerCase()) return false;
    }

    // 3. Need filter
    if (activeNeed === 'gaming') {
      if (!p.name.toLowerCase().includes('gaming') && !p.name.toLowerCase().includes('tuf') && !p.name.toLowerCase().includes('cyborg')) return false;
    } else if (activeNeed === 'office' || activeNeed === 'slim') {
      if (p.name.toLowerCase().includes('gaming') || p.name.toLowerCase().includes('tuf')) return false;
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
    <section className={styles.sectionWrapper} aria-label="Chuyên mục Laptop và Máy tính">
      <div className={styles.container}>
        {/* ================= CỘT TRÁI: 2 BANNER DỌC NGUYÊN KHỐI ================= */}
        <div className={styles.bannerCol}>
          {banners.slice(0, 2).map((b) => (
            <Link
              key={b.id}
              href={b.targetLink || '/products?keyword=laptop'}
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
                      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80';
                  }}
                />
                <div className={styles.posterOverlay}>
                  <span className={styles.posterBadge}>Laptop & PC</span>
                  <h3 className={styles.posterTitle}>{b.title}</h3>
                  <span className={styles.posterBtn}>MUA NGAY &gt;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ================= CỘT PHẢI: BỘ LỌC VÀ LƯỚI SẢN PHẨM ================= */}
        <div className={styles.contentCol}>
          {/* 1. Category Tabs */}
          <div className={styles.categoryTabs}>
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeCategory === tab.id ? styles.activeTab : ''}`}
                onClick={() => setActiveCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 2. Needs / Feature Pills (Văn phòng, Gaming, Mỏng nhẹ...) */}
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

            <Link href="/products?categorySlug=laptop" className={styles.viewAllLink}>
              <span>Xem tất cả</span>
              <span>&gt;</span>
            </Link>
          </div>

          {/* 4. Product Grid (4 Cột) */}
          {loading ? (
            <div style={{ color: '#9ca3af', padding: 40, textAlign: 'center' }}>
              Đang tải danh sách laptop từ CSDL PostgreSQL...
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

                  {/* Spec Pill dưới ảnh */}
                  <div className={styles.specsPill} title={p.specs}>
                    {p.specs}
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
                    <span className={styles.promoPillStudent}>{p.studentText}</span>
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
