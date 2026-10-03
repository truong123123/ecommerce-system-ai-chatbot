'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../category-showcase/categoryShowcaseAdmin.module.css';
import { showcaseService } from '../../../services/showcaseService';
import {
  ShowcaseBannerItem,
  FeatureFilterItem,
  ShowcaseProduct,
} from '../../../types/categoryShowcase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const DEFAULT_WATCH_BANNERS: ShowcaseBannerItem[] = [
  {
    id: 'watch-banner-1',
    title: 'Đồng Hồ Thể Thao - Chỉ từ 690K - Tặng Voucher 2 Triệu',
    imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&q=80',
    targetLink: '/products?keyword=watch',
  },
];

const WATCH_FEATURES: FeatureFilterItem[] = [
  { id: 'watch-f1', label: 'Tập luyện thể thao', imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=100&q=80', tag: 'sport' },
  { id: 'watch-f2', label: 'Nghe gọi', imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=100&q=80', tag: 'call' },
  { id: 'watch-f3', label: 'Vòng đeo tay thông minh', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80', tag: 'band' },
  { id: 'watch-f4', label: 'Định vị trẻ em', imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=100&q=80', tag: 'kids' },
  { id: 'watch-f5', label: 'Đo huyết áp', imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=100&q=80', tag: 'health' },
  { id: 'watch-f6', label: 'Chống nước', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80', tag: 'waterproof' },
];

export default function AdminWatchShowcasePage() {
  const [banners, setBanners] = useState<ShowcaseBannerItem[]>(DEFAULT_WATCH_BANNERS);
  const [features, setFeatures] = useState<FeatureFilterItem[]>(WATCH_FEATURES);
  const [products, setProducts] = useState<ShowcaseProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'banner' | 'features' | 'products'>('products');
  const [typeFilter, setTypeFilter] = useState<'all' | 'watch' | 'audio'>('all');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWatchAndAudio = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/products`, { cache: 'no-store' });
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw)) {
          const itemsOnly = raw
            .filter((p: any) => {
              const name = (p.name || '').toLowerCase();
              const slug = (p.categorySlug || '').toLowerCase();
              return (
                slug === 'dong-ho' ||
                slug === 'am-thanh' ||
                slug === 'apple-watch' ||
                slug === 'phu-kien' ||
                name.includes('watch') ||
                name.includes('đồng hồ') ||
                name.includes('amazfit') ||
                name.includes('myalo') ||
                name.includes('airpods') ||
                name.includes('tai nghe') ||
                name.includes('loa') ||
                name.includes('sony') ||
                name.includes('marshall')
              );
            })
            .map((p: any) => {
              const price = Number(p.price) || 0;
              const maxP = p.maxPrice ? Number(p.maxPrice) : Math.round(price * 1.2);
              const discount = maxP > price ? Math.round(((maxP - price) / maxP) * 100) : 0;
              const isWatch =
                p.name.toLowerCase().includes('watch') ||
                p.name.toLowerCase().includes('đồng hồ') ||
                p.name.toLowerCase().includes('amazfit') ||
                p.name.toLowerCase().includes('myalo') ||
                p.categorySlug === 'dong-ho' ||
                p.categorySlug === 'apple-watch';

              return {
                id: String(p.id),
                name: p.name,
                brand: p.brandName || 'Apple',
                category: (isWatch ? 'phone' : 'tablet') as any, // Dùng để phân loại watch vs audio
                image: p.primaryImage || 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&q=80',
                price,
                oldPrice: maxP,
                discountPercent: discount,
                hasZeroInstallment: true,
                status: 'new_arrival' as const,
                smemberDiscount: `Smember giảm đến ${new Intl.NumberFormat('vi-VN').format(Math.round(price * 0.01))}đ`,
                installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
                rating: 5,
                isFastDelivery: true,
                tags: [isWatch ? 'watch' : 'audio'],
              };
            });

          setProducts(itemsOnly);
        }
      }

      // Nạp banner đồng hồ & âm thanh từ PostgreSQL
      const bRes = await fetch(`${API_BASE_URL}/banners`, { cache: 'no-store' });
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
              watchBanners.map((b: any) => ({
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
      console.error('Lỗi tải đồng hồ & âm thanh:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchAndAudio();
  }, []);

  const handleUpdateProduct = (id: string, field: keyof ShowcaseProduct, val: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleBlurProduct = async (product: ShowcaseProduct) => {
    setSaveMessage('⏳ Đang lưu thay đổi vào PostgreSQL...');
    const ok = await showcaseService.updateProductToSql(product.id, {
      name: product.name,
      price: product.price,
    });
    if (ok) {
      setSaveMessage('✓ Đã đồng bộ thay đổi vào CSDL PostgreSQL!');
    } else {
      setSaveMessage('⚠️ Đã cập nhật giao diện (sản phẩm local)');
    }
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Bạn có chắc muốn xoá sản phẩm này khỏi hệ thống PostgreSQL?')) {
      setProducts((prev) => prev.filter((item) => item.id !== id));
      setSaveMessage('⏳ Đang xóa sản phẩm trong PostgreSQL...');
      await showcaseService.deleteProductFromSql(id);
      setSaveMessage('✓ Đã xóa sản phẩm khỏi CSDL PostgreSQL!');
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveMessage('⏳ Đang lưu cấu hình Đồng Hồ & Âm Thanh vào PostgreSQL...');
    try {
      for (const b of banners) {
        await showcaseService.saveBannerToSql(b);
      }
      for (const p of products) {
        await showcaseService.updateProductToSql(p.id, {
          name: p.name,
          price: p.price,
          image: p.image,
        });
      }
      setSaveMessage('✓ Đã lưu thành công toàn bộ vào CSDL PostgreSQL!');
    } catch (e) {
      setSaveMessage('⚠️ Có lỗi khi lưu dữ liệu.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3500);
    }
  };

  const filteredProducts = products.filter((p) => {
    const isWatch = p.category === 'phone';
    if (typeFilter === 'watch') return isWatch;
    if (typeFilter === 'audio') return !isWatch;
    return true;
  });

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>Quản Lý Chuyên Mục Đồng Hồ Thông Minh & Thiết Bị Âm Thanh</h1>
          <p>Tùy chỉnh riêng Banner dọc, danh sách Smartwatch, Tai nghe, Loa Bluetooth, giá bán và ưu đãi</p>
        </div>

        <div className={styles.headerButtons}>
          <Link href="/" target="_blank" className={styles.btnSecondary}>
            <span>🛒</span> Xem Trang Khách Hàng
          </Link>
          <button className={styles.btnPrimary} onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? '⏳ Đang lưu...' : '💾 Lưu Thay Đổi Vào SQL'}
          </button>
        </div>
      </div>

      {saveMessage && <div className={styles.alertSuccess}>{saveMessage}</div>}

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.adminTabBtn} ${activeTab === 'products' ? styles.active : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <span>⌚</span> Danh sách Đồng Hồ & Âm Thanh ({products.length})
        </button>
        <button
          className={`${styles.adminTabBtn} ${activeTab === 'banner' ? styles.active : ''}`}
          onClick={() => setActiveTab('banner')}
        >
          <span>🖼️</span> Cấu hình Banner Dọc ({banners.length})
        </button>
        <button
          className={`${styles.adminTabBtn} ${activeTab === 'features' ? styles.active : ''}`}
          onClick={() => setActiveTab('features')}
        >
          <span>🏷️</span> Nhu Cầu & Tính Năng ({features.length})
        </button>
      </div>

      {/* TAB 1: DANH SÁCH SẢN PHẨM */}
      {activeTab === 'products' && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Danh Sách Thiết Bị Đeo & Âm Thanh</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                className={styles.select}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
              >
                <option value="all">Tất cả sản phẩm</option>
                <option value="watch">Chỉ Đồng Hồ Thông Minh</option>
                <option value="audio">Chỉ Thiết Bị Âm Thanh (Tai nghe, Loa)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ color: '#9ca3af', padding: 30, textAlign: 'center' }}>
              Đang tải danh sách từ CSDL PostgreSQL...
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Phân loại</th>
                    <th>Giá bán (VNĐ)</th>
                    <th>Giá gốc (VNĐ)</th>
                    <th>Trả góp 0%</th>
                    <th>⚡ 2 Giờ</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ width: 60, minWidth: 60 }}>
                        <div className={styles.thumbWrapper}>
                          <img
                            src={p.image}
                            alt={p.name}
                            className={styles.prodThumb}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=200&q=80';
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className={styles.inlineInput}
                          value={p.name}
                          onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)}
                          onBlur={() => handleBlurProduct(p)}
                        />
                      </td>
                      <td>
                        <span className={styles.badgeCategory}>
                          {p.category === 'phone' ? '⌚ Đồng hồ' : '🎧 Âm thanh'}
                        </span>
                      </td>
                      <td>
                        <input
                          type="number"
                          className={styles.inlineInput}
                          style={{ width: 110, color: '#ef4444', fontWeight: 700 }}
                          value={p.price}
                          onChange={(e) =>
                            handleUpdateProduct(p.id, 'price', Number(e.target.value))
                          }
                          onBlur={() => handleBlurProduct(p)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className={styles.inlineInput}
                          style={{ width: 110, color: '#9ca3af' }}
                          value={p.oldPrice}
                          onChange={(e) =>
                            handleUpdateProduct(p.id, 'oldPrice', Number(e.target.value))
                          }
                          onBlur={() => handleBlurProduct(p)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={p.hasZeroInstallment}
                          onChange={(e) => {
                            handleUpdateProduct(p.id, 'hasZeroInstallment', e.target.checked);
                            handleBlurProduct({ ...p, hasZeroInstallment: e.target.checked });
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={p.isFastDelivery}
                          onChange={(e) => {
                            handleUpdateProduct(p.id, 'isFastDelivery', e.target.checked);
                            handleBlurProduct({ ...p, isFastDelivery: e.target.checked });
                          }}
                        />
                      </td>
                      <td>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleDeleteProduct(p.id)}
                          title="Xóa khỏi PostgreSQL"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CẤU HÌNH BANNER DỌC */}
      {activeTab === 'banner' && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Danh Sách Banner Dọc Đồng Hồ (Left Column Posters)</span>
          </div>

          <div className={styles.bannerListGrid}>
            {banners.map((b, idx) => (
              <div key={b.id} className={styles.bannerItemCard}>
                <div className={styles.bannerThumbWrapper}>
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className={styles.bannerThumb}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&q=80';
                    }}
                  />
                </div>

                <div className={styles.bannerFields}>
                  <strong style={{ color: '#fff', fontSize: 14 }}>Banner #{idx + 1}</strong>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên / Mô tả Banner</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={b.title}
                      onChange={(e) =>
                        setBanners(
                          banners.map((item) =>
                            item.id === b.id ? { ...item, title: e.target.value } : item
                          )
                        )
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Đường dẫn ảnh Banner</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={b.imageUrl}
                      onChange={(e) =>
                        setBanners(
                          banners.map((item) =>
                            item.id === b.id ? { ...item, imageUrl: e.target.value } : item
                          )
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NHU CẦU & TÍNH NĂNG */}
      {activeTab === 'features' && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Nhu Cầu Đeo Đồng Hồ (Feature Pills)</span>
          </div>

          <div className={styles.featureFilterGrid}>
            {features.map((feat) => (
              <div key={feat.id} className={styles.featureFilterCard}>
                <div className={styles.featurePreviewBox}>
                  <img
                    src={feat.imageUrl}
                    alt={feat.label}
                    className={styles.featurePreviewImg}
                  />
                </div>
                <div className={styles.featureFilterFields}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên nhu cầu</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={feat.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFeatures(features.map((f) => (f.id === feat.id ? { ...f, label: val } : f)));
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
