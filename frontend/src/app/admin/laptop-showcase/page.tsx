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

const DEFAULT_LAPTOP_BANNERS: ShowcaseBannerItem[] = [
  {
    id: 'laptop-banner-1',
    title: 'Laptop AI - Giảm thêm đến 2 Triệu',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
    targetLink: '/products?keyword=laptop',
  },
  {
    id: 'laptop-banner-2',
    title: 'Mac mini - Nhỏ mà cân hết với M6 và M5 Pro',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    targetLink: '/products?keyword=mac',
  },
];

const LAPTOP_FEATURES: FeatureFilterItem[] = [
  { id: 'lap-f1', label: 'Văn phòng', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&q=80', tag: 'office' },
  { id: 'lap-f2', label: 'Gaming', imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=100&q=80', tag: 'gaming' },
  { id: 'lap-f3', label: 'Mỏng nhẹ', imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&q=80', tag: 'slim' },
  { id: 'lap-f4', label: 'Đồ họa - kỹ thuật', imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&q=80', tag: 'graphic' },
  { id: 'lap-f5', label: 'Sinh viên', imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=100&q=80', tag: 'student' },
  { id: 'lap-f6', label: 'Cảm ứng', imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=100&q=80', tag: 'touch' },
];

export default function AdminLaptopShowcasePage() {
  const [banners, setBanners] = useState<ShowcaseBannerItem[]>(DEFAULT_LAPTOP_BANNERS);
  const [features, setFeatures] = useState<FeatureFilterItem[]>(LAPTOP_FEATURES);
  const [products, setProducts] = useState<ShowcaseProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'banner' | 'features' | 'products'>('products');
  const [brandFilter, setBrandFilter] = useState('all');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal Sửa & Thêm sản phẩm
  const [editingProduct, setEditingProduct] = useState<ShowcaseProduct | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: 'ASUS',
    price: 18000000,
    oldPrice: 20000000,
    specs: 'Intel Core i5 | 16GB RAM | 512GB SSD',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80',
    status: 'new_arrival' as const,
  });

  const loadLaptopProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/products`, { cache: 'no-store' });
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw)) {
          const laptopsOnly = raw
            .filter((p: any) => {
              const name = (p.name || '').toLowerCase();
              const slug = (p.categorySlug || '').toLowerCase();
              return (
                slug === 'laptop' ||
                slug === 'pc' ||
                slug === 'macbook' ||
                slug === 'man-hinh' ||
                name.includes('laptop') ||
                name.includes('macbook') ||
                name.includes('mac mini') ||
                name.includes('vivobook') ||
                name.includes('omnibook') ||
                name.includes('cyborg') ||
                name.includes('ideapad') ||
                name.includes('tuf') ||
                name.includes('nitro')
              );
            })
            .map((p: any) => {
              const price = Number(p.price) || 0;
              const maxP = p.maxPrice ? Number(p.maxPrice) : Math.round(price * 1.15);
              const discount = maxP > price ? Math.round(((maxP - price) / maxP) * 100) : 0;

              return {
                id: String(p.id),
                name: p.name,
                brand: p.brandName || 'ASUS',
                category: 'phone' as const,
                image: p.primaryImage || 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80',
                price,
                oldPrice: maxP,
                discountPercent: discount,
                hasZeroInstallment: true,
                status: 'new_arrival' as const,
                smemberDiscount: `Smember giảm đến ${new Intl.NumberFormat('vi-VN').format(Math.round(price * 0.01))}đ`,
                installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
                rating: 5,
                isFastDelivery: true,
                tags: ['gaming', 'office'],
              };
            });

          setProducts(laptopsOnly);
        }
      }

      // Nạp banner laptop từ PostgreSQL
      const bRes = await fetch(`${API_BASE_URL}/banners`, { cache: 'no-store' });
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
              lapBanners.map((b: any) => ({
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
      console.error('Lỗi nạp laptop:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaptopProducts();
  }, []);

  // Update banner fields
  const handleUpdateBanner = (id: string, field: keyof ShowcaseBannerItem, value: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleAddBanner = () => {
    const newB: ShowcaseBannerItem = {
      id: 'laptop-banner-' + Date.now(),
      title: 'Banner Laptop Mới',
      imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
      targetLink: '/products?keyword=laptop',
    };
    setBanners([...banners, newB]);
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Bạn có chắc muốn xoá banner này?')) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Update product inline & auto-save to SQL
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
    setSaveMessage('⏳ Đang lưu cấu hình Laptop & PC vào PostgreSQL...');
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
    if (brandFilter === 'all') return true;
    return p.brand.toLowerCase() === brandFilter.toLowerCase();
  });

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>Quản Lý Chuyên Mục Laptop, Màn Hình & PC</h1>
          <p>Tùy chỉnh riêng Banner dọc, danh sách sản phẩm Laptop / MacBook / PC, thông số và giá bán</p>
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
          <span>💻</span> Danh sách Laptop & PC ({products.length})
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

      {/* TAB 1: DANH SÁCH SẢN PHẨM LAPTOP */}
      {activeTab === 'products' && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Danh Sách Sản Phẩm Laptop & Máy Tính</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                className={styles.select}
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option value="all">Tất cả thương hiệu</option>
                <option value="Apple">Apple (MacBook / Mac mini)</option>
                <option value="ASUS">ASUS</option>
                <option value="MSI">MSI</option>
                <option value="HP">HP</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Acer">Acer</option>
                <option value="Dell">Dell</option>
              </select>

              <button className={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
                + Thêm Laptop Mới
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ color: '#9ca3af', padding: 30, textAlign: 'center' }}>
              Đang tải danh sách laptop từ PostgreSQL...
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Ảnh</th>
                    <th>Tên Laptop / PC</th>
                    <th>Hãng</th>
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
                                'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&q=80';
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
                        <span className={styles.badgeCategory}>{p.brand}</span>
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
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className={styles.btnEdit}
                            onClick={() => setEditingProduct(p)}
                            title="Sửa chi tiết"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className={styles.btnDelete}
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Xóa khỏi PostgreSQL"
                          >
                            🗑️
                          </button>
                        </div>
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
            <span>Danh Sách Banner Dọc Laptop (Left Column Posters)</span>
            <button className={styles.btnPrimary} onClick={handleAddBanner}>
              + Thêm Banner Laptop Mới
            </button>
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
                        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80';
                    }}
                  />
                </div>

                <div className={styles.bannerFields}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#fff', fontSize: 14 }}>Banner #{idx + 1}</strong>
                    <button
                      className={styles.btnDelete}
                      onClick={() => handleDeleteBanner(b.id)}
                    >
                      🗑️ Xóa
                    </button>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên / Mô tả Banner</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={b.title}
                      onChange={(e) => handleUpdateBanner(b.id, 'title', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Đường dẫn ảnh Banner</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={b.imageUrl}
                      onChange={(e) => handleUpdateBanner(b.id, 'imageUrl', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Link liên kết khi Click</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={b.targetLink || ''}
                      onChange={(e) => handleUpdateBanner(b.id, 'targetLink', e.target.value)}
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
            <span>Nhu Cầu & Tính Năng Laptop (Feature Pills)</span>
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
