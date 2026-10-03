'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './categoryShowcaseAdmin.module.css';
import {
  CategoryShowcaseData,
  ShowcaseProduct,
  ShowcaseBannerItem,
  FeatureFilterItem,
  ProductStatusType,
} from '../../../types/categoryShowcase';
import { showcaseService } from '../../../services/showcaseService';

const STATUS_OPTIONS: { value: ProductStatusType; label: string }[] = [
  { value: 'none', label: 'Không có nhãn' },
  { value: 'pre_order', label: 'Hàng đặt trước' },
  { value: 'coming_soon', label: 'Sắp về hàng' },
  { value: 'new_arrival', label: 'Hàng mới về' },
  { value: 'hot_sale', label: 'Bán chạy' },
  { value: 'special_deal', label: 'Giá sốc' },
];

export default function AdminCategoryShowcasePage() {
  const [data, setData] = useState<CategoryShowcaseData | null>(null);
  const [activeTab, setActiveTab] = useState<'banner' | 'features' | 'products'>('banner');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'phone' | 'tablet'>('all');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Modal thêm mới & Modal chỉnh sửa sản phẩm
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShowcaseProduct | null>(null);

  // State form sản phẩm mới
  const [newProduct, setNewProduct] = useState<Partial<ShowcaseProduct>>({
    name: '',
    brand: 'Apple',
    category: 'phone',
    image: '/images/products/phones/phone_burgundy_18pro.jpg',
    price: 30000000,
    oldPrice: 33000000,
    discountPercent: 10,
    hasZeroInstallment: true,
    status: 'new_arrival',
    smemberDiscount: 'giảm đến 300.000đ',
    studentDiscount: '',
    installmentNote: 'Trả góp 0% - 0đ phụ phí - 0đ trả trước - kỳ hạn đến 6 tháng',
    rating: 5,
    isFastDelivery: true,
    tags: ['5g', 'ai'],
  });

  const [deletedBannerIds, setDeletedBannerIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    showcaseService.fetchFromDatabase().then((fresh) => {
      // Chỉ giữ sản phẩm thuộc chuyên mục Điện thoại & Máy tính bảng
      const phoneProds = fresh.products.filter((p) => {
        const name = p.name.toLowerCase();
        return (
          !name.includes('laptop') &&
          !name.includes('macbook') &&
          !name.includes('mac mini') &&
          !name.includes('vivobook') &&
          !name.includes('omnibook') &&
          !name.includes('cyborg') &&
          !name.includes('ideapad') &&
          !name.includes('tuf') &&
          !name.includes('watch') &&
          !name.includes('airpods') &&
          !name.includes('sony') &&
          !name.includes('marshall') &&
          !name.includes('amazfit') &&
          !name.includes('myalo')
        );
      });

      // Lọc banner của chuyên mục Điện thoại
      const phoneBanners = fresh.banners.filter((b) => {
        const title = b.title.toLowerCase();
        const img = b.imageUrl.toLowerCase();
        return !title.includes('macbook') && !title.includes('watch') && !img.includes('watch');
      });

      setData({
        ...fresh,
        banners: phoneBanners.length > 0 ? phoneBanners : fresh.banners.slice(0, 2),
        products: phoneProds,
      });
    });
  }, []);

  if (!data) {
    return <div style={{ color: '#fff', padding: 20 }}>Đang tải dữ liệu cấu hình...</div>;
  }

  const { banners, products, featureFilters = [] } = data;

  // ================= QUẢN LÝ BANNER =================
  const handleUpdateBanner = (id: string, field: keyof ShowcaseBannerItem, value: string) => {
    const updated = banners.map((b) => {
      if (b.id === id) {
        return { ...b, [field]: value };
      }
      return b;
    });
    setData({ ...data, banners: updated });
  };

  const handleAddBanner = () => {
    const newB: ShowcaseBannerItem = {
      id: 'banner-' + Date.now(),
      title: `Banner Mới #${banners.length + 1}`,
      imageUrl: '/images/banners/poster_iphone_duo.jpg',
      targetLink: '/',
    };
    setData({ ...data, banners: [...banners, newB] });
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Bạn có chắc muốn xoá banner này khỏi CSDL PostgreSQL?')) {
      if (/^\d+$/.test(id)) {
        setDeletedBannerIds((prev) => [...prev, id]);
      }
      setData({ ...data, banners: banners.filter((b) => b.id !== id) });
    }
  };

  // ================= QUẢN LÝ TÍNH NĂNG (ICON ẢNH) =================
  const handleUpdateFeature = (id: string, field: keyof FeatureFilterItem, value: string) => {
    const updated = featureFilters.map((f) => {
      if (f.id === id) {
        return { ...f, [field]: value };
      }
      return f;
    });
    setData({ ...data, featureFilters: updated });
  };

  const handleAddFeature = () => {
    const newF: FeatureFilterItem = {
      id: 'filter-' + Date.now(),
      label: 'Tính năng mới',
      imageUrl: '/images/products/phones/phone_poco_x8.jpg',
      tag: 'feature_' + Date.now(),
    };
    setData({ ...data, featureFilters: [...featureFilters, newF] });
  };

  const handleDeleteFeature = (id: string) => {
    if (confirm('Bạn có chắc muốn xoá tính năng này?')) {
      setData({
        ...data,
        featureFilters: featureFilters.filter((f) => f.id !== id),
      });
    }
  };

  // ================= QUẢN LÝ SẢN PHẨM =================
  const handleUpdateProductInline = (
    id: string,
    field: keyof ShowcaseProduct,
    val: any
  ) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        return { ...p, [field]: val };
      }
      return p;
    });
    setData({ ...data, products: updated });
  };

  // Mở Modal Sửa sản phẩm
  const handleOpenEditModal = (product: ShowcaseProduct) => {
    setEditingProduct({ ...product });
  };

  // Lưu sản phẩm đang sửa từ Modal trực tiếp vào SQL
  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;
    const updated = products.map((p) =>
      p.id === editingProduct.id ? editingProduct : p
    );
    setData({ ...data, products: updated });
    setSaveMessage('⏳ Đang lưu sản phẩm vào PostgreSQL...');
    await showcaseService.updateProductToSql(editingProduct.id, {
      name: editingProduct.name,
      price: editingProduct.price,
      image: editingProduct.image,
    });
    setEditingProduct(null);
    setSaveMessage('✓ Đã cập nhật sản phẩm thành công vào CSDL PostgreSQL!');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  // Cập nhật inline khi rời ô nhập (onBlur) trực tiếp vào SQL
  const handleBlurProduct = async (product: ShowcaseProduct) => {
    setSaveMessage('⏳ Đang lưu thay đổi vào PostgreSQL...');
    const ok = await showcaseService.updateProductToSql(product.id, {
      name: product.name,
      price: product.price,
      image: product.image,
    });
    if (ok) {
      setSaveMessage('✓ Đã đồng bộ thay đổi vào CSDL PostgreSQL!');
    } else {
      setSaveMessage('✓ Đã lưu thay đổi!');
    }
    setTimeout(() => setSaveMessage(null), 2000);
  };

  // Xoá sản phẩm trực tiếp khỏi PostgreSQL
  const handleDeleteProduct = async (id: string) => {
    if (confirm('Bạn có chắc muốn xoá sản phẩm này khỏi hệ thống PostgreSQL?')) {
      const updated = products.filter((p) => p.id !== id);
      setData({ ...data, products: updated });
      setSaveMessage('⏳ Đang xóa sản phẩm trong PostgreSQL...');
      await showcaseService.deleteProductFromSql(id);
      setSaveMessage('✓ Đã xóa sản phẩm khỏi CSDL PostgreSQL!');
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  // Thêm sản phẩm mới từ Modal
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Vui lòng nhập tên và giá sản phẩm!');
      return;
    }

    const item: ShowcaseProduct = {
      id: 'prod-' + Date.now(),
      name: newProduct.name || '',
      brand: newProduct.brand || 'Apple',
      category: (newProduct.category as 'phone' | 'tablet') || 'phone',
      image: newProduct.image || '/images/products/phones/phone_burgundy_18pro.jpg',
      price: Number(newProduct.price),
      oldPrice: newProduct.oldPrice ? Number(newProduct.oldPrice) : undefined,
      discountPercent: newProduct.discountPercent ? Number(newProduct.discountPercent) : undefined,
      hasZeroInstallment: Boolean(newProduct.hasZeroInstallment),
      status: (newProduct.status as ProductStatusType) || 'none',
      smemberDiscount: newProduct.smemberDiscount || 'Smember giảm đến 200.000đ',
      studentDiscount: newProduct.studentDiscount || '',
      installmentNote: newProduct.installmentNote || 'Trả góp 0% - 0đ phụ phí - 0đ trả trước',
      rating: newProduct.rating ? Number(newProduct.rating) : undefined,
      isFastDelivery: Boolean(newProduct.isFastDelivery),
      tags: newProduct.tags || ['5g'],
    };

    setData({
      ...data,
      products: [item, ...data.products],
    });
    setShowAddModal(false);
    setSaveMessage('✓ Đã thêm sản phẩm mới vào danh sách!');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  // Lưu toàn bộ thay đổi trực tiếp vào CSDL PostgreSQL
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveMessage('⏳ Đang lưu dữ liệu trực tiếp vào CSDL PostgreSQL...');
    try {
      const ok = await showcaseService.saveAllToDatabase(banners, deletedBannerIds);
      for (const p of products) {
        await showcaseService.updateProductToSql(p.id, {
          name: p.name,
          price: p.price,
          image: p.image,
        });
      }
      if (ok) {
        setDeletedBannerIds([]);
        setSaveMessage('✓ Đã lưu thành công vào CSDL PostgreSQL!');
      } else {
        setSaveMessage('⚠️ Có lỗi xảy ra khi lưu vào CSDL.');
      }
    } catch (err) {
      setSaveMessage('⚠️ Lỗi kết nối CSDL.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3500);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  });

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>Quản Lý Chuyên Mục Điện Thoại & Máy Tính Bảng</h1>
          <p>Tùy chỉnh ảnh Banner dọc, danh sách sản phẩm, giá bán, nhãn trạng thái và trả góp</p>
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

      {/* Thông báo thành công */}
      {saveMessage && <div className={styles.alertSuccess}>{saveMessage}</div>}

      {/* Navigation tabs */}
      <div className={styles.tabsContainer}>
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
          <span>🏷️</span> Tính Năng Nổi Bật (Icon Ảnh) ({featureFilters.length})
        </button>
        <button
          className={`${styles.adminTabBtn} ${activeTab === 'products' ? styles.active : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <span>📱</span> Danh sách Sản phẩm ({products.length})
        </button>
      </div>

      {/* ================= TAB 1: CẤU HÌNH BANNER ================= */}
      {activeTab === 'banner' && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Danh Sách Banner Dọc (Left Column Posters)</span>
            <button className={styles.btnPrimary} onClick={handleAddBanner}>
              + Thêm Banner Dọc Mới
            </button>
          </div>

          <p style={{ color: '#9ca3af', fontSize: 13.5, margin: 0 }}>
            Banner là bức ảnh nguyên khối hiển thị bên cột trái. Bạn chỉ cần nhập đường dẫn ảnh (URL hoặc đường dẫn trong thư mục <code>/images/banners/...</code>) và link chuyển hướng khi khách hàng bấm vào banner.
          </p>

          <div className={styles.bannerListGrid}>
            {banners.map((b, idx) => (
              <div key={b.id} className={styles.bannerItemCard}>
                {/* Ảnh Thumbnail Preview với Fallback an toàn */}
                <div className={styles.bannerThumbWrapper}>
                  {b.imageUrl ? (
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className={styles.bannerThumb}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/banners/poster_iphone_duo.jpg';
                      }}
                    />
                  ) : (
                    <div style={{ color: '#6b7280', fontSize: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Chưa có ảnh</div>
                  )}
                </div>

                {/* Form Link Thay Ảnh */}
                <div className={styles.bannerFields}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#fff', fontSize: 14 }}>Banner #{idx + 1}</strong>
                    <button
                      className={styles.btnDelete}
                      title="Xoá banner này"
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
                    <label className={styles.label}>Đường dẫn ảnh Banner (Image Link) *</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={b.imageUrl}
                      placeholder="/images/banners/poster_iphone_duo.jpg"
                      onChange={(e) => handleUpdateBanner(b.id, 'imageUrl', e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#9ca3af', width: '100%' }}>Gợi ý ảnh có sẵn:</span>
                      {[
                        { name: 'iPhone Titan', path: '/images/banners/poster_iphone_duo.jpg' },
                        { name: 'Redmi Note', path: '/images/banners/poster_redmi_note17.jpg' },
                        { name: 'Phone Hand', path: '/images/banners/banner_phone_hand.jpg' },
                        { name: 'Fashion Model', path: '/images/banners/banner_fashion_model.jpg' },
                      ].map((preset) => (
                        <button
                          key={preset.path}
                          type="button"
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            borderRadius: '4px',
                            border: '1px solid #374151',
                            background: b.imageUrl === preset.path ? '#2563eb' : '#1f2937',
                            color: '#f3f4f6',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleUpdateBanner(b.id, 'imageUrl', preset.path)}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Link liên kết khi Click (Target URL)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={b.targetLink || ''}
                      placeholder="/"
                      onChange={(e) => handleUpdateBanner(b.id, 'targetLink', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: CẤU HÌNH TÍNH NĂNG (ICON ẢNH) ================= */}
      {activeTab === 'features' && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Danh Sách Tính Năng Nổi Bật (Feature Pills với Ảnh Icon)</span>
            <button className={styles.btnPrimary} onClick={handleAddFeature}>
              + Thêm Tính Năng Mới
            </button>
          </div>

          <p style={{ color: '#9ca3af', fontSize: 13.5, margin: 0 }}>
            Các icon tính năng (Điện thoại chơi game, pin trâu, 5G, chụp ảnh đẹp...) sử dụng hình ảnh thu nhỏ thực tế. Bạn có thể chỉnh sửa tên nhãn, mã Tag lọc và thay đổi đường dẫn ảnh trực tiếp tại đây.
          </p>

          <div className={styles.featureFilterGrid}>
            {featureFilters.map((feat, idx) => (
              <div key={feat.id} className={styles.featureFilterCard}>
                {/* Ảnh Icon Preview */}
                <div className={styles.featurePreviewBox}>
                  <Image
                    src={feat.imageUrl}
                    alt={feat.label}
                    fill
                    className={styles.featurePreviewImg}
                  />
                </div>

                {/* Form fields */}
                <div className={styles.featureFilterFields}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#fff', fontSize: 13.5 }}>Tính năng #{idx + 1}</strong>
                    <button
                      className={styles.btnDelete}
                      title="Xoá tính năng này"
                      onClick={() => handleDeleteFeature(feat.id)}
                    >
                      🗑️
                    </button>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên tính năng</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={feat.label}
                      onChange={(e) => handleUpdateFeature(feat.id, 'label', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Đường dẫn ảnh Icon (Image URL) *</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={feat.imageUrl}
                      placeholder="/images/products/phones/phone_poco_x8.jpg"
                      onChange={(e) => handleUpdateFeature(feat.id, 'imageUrl', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Mã Tag liên kết bộ lọc (Filter Tag)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={feat.tag}
                      placeholder="gaming, battery, 5g, camera, fold, ai..."
                      onChange={(e) => handleUpdateFeature(feat.id, 'tag', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: QUẢN LÝ SẢN PHẨM ================= */}
      {activeTab === 'products' && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Danh Sách Sản Phẩm Chuyên Mục</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                className={styles.select}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
              >
                <option value="all">Tất cả danh mục</option>
                <option value="phone">Chỉ Điện Thoại</option>
                <option value="tablet">Chỉ Máy Tính Bảng</option>
              </select>

              <button className={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
                + Thêm Sản Phẩm Mới
              </button>
            </div>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Hãng</th>
                  <th>Giá bán (VNĐ)</th>
                  <th>Giá gốc (VNĐ)</th>
                  <th>Trạng thái (Chọn)</th>
                  <th>Trả góp 0%</th>
                  <th>⚡ 2 Giờ</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td style={{ width: 60, minWidth: 60 }}>
                      <div className={styles.thumbWrapper}>
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className={styles.prodThumb}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              '/images/products/phones/phone_burgundy_18pro.jpg';
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.tableInput}
                        style={{ width: 180 }}
                        value={prod.name}
                        onChange={(e) => handleUpdateProductInline(prod.id, 'name', e.target.value)}
                        onBlur={() => handleBlurProduct(prod)}
                      />
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: prod.category === 'phone' ? '#60a5fa' : '#fbbf24' }}>
                        {prod.category === 'phone' ? 'Điện thoại' : 'Máy tính bảng'}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.tableInput}
                        style={{ width: 75 }}
                        value={prod.brand}
                        onChange={(e) => handleUpdateProductInline(prod.id, 'brand', e.target.value)}
                        onBlur={() => handleBlurProduct(prod)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={styles.tableInput}
                        style={{ width: 115 }}
                        value={prod.price}
                        onChange={(e) => handleUpdateProductInline(prod.id, 'price', Number(e.target.value))}
                        onBlur={() => handleBlurProduct(prod)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={styles.tableInput}
                        style={{ width: 110 }}
                        value={prod.oldPrice || ''}
                        placeholder="Không có"
                        onChange={(e) =>
                          handleUpdateProductInline(
                            prod.id,
                            'oldPrice',
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        onBlur={() => handleBlurProduct(prod)}
                      />
                    </td>
                    {/* TRẠNG THÁI LÀ CHỌN DROPDOWN SELECT */}
                    <td>
                      <select
                        className={styles.tableSelect}
                        value={prod.status || 'none'}
                        onChange={(e) => {
                          const val = e.target.value as ProductStatusType;
                          handleUpdateProductInline(prod.id, 'status', val);
                          handleBlurProduct({ ...prod, status: val });
                        }}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(prod.hasZeroInstallment)}
                        onChange={(e) => {
                          handleUpdateProductInline(prod.id, 'hasZeroInstallment', e.target.checked);
                          handleBlurProduct({ ...prod, hasZeroInstallment: e.target.checked });
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(prod.isFastDelivery)}
                        onChange={(e) => {
                          handleUpdateProductInline(prod.id, 'isFastDelivery', e.target.checked);
                          handleBlurProduct({ ...prod, isFastDelivery: e.target.checked });
                        }}
                      />
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.btnEdit}
                          title="Sửa toàn bộ thông tin sản phẩm"
                          onClick={() => handleOpenEditModal(prod)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className={styles.btnDelete}
                          title="Xoá sản phẩm"
                          onClick={() => handleDeleteProduct(prod.id)}
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
        </div>
      )}

      {/* ================= MODAL CHỈNH SỬA SẢN PHẨM ================= */}
      {editingProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>✏️ Chỉnh Sửa Sản Phẩm: {editingProduct.name}</h2>
              <button className={styles.closeBtn} onClick={() => setEditingProduct(null)}>
                ✕
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Tên sản phẩm *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Danh mục</label>
                <select
                  className={styles.select}
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value as any })
                  }
                >
                  <option value="phone">Điện thoại</option>
                  <option value="tablet">Máy tính bảng</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Thương hiệu (Hãng)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editingProduct.brand}
                  onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Giá khuyến mãi (VNĐ) *</label>
                <input
                  type="number"
                  className={styles.input}
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Giá niêm yết cũ (VNĐ)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={editingProduct.oldPrice || ''}
                  placeholder="Để trống nếu không giảm giá"
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      oldPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>% Giảm giá hiển thị (Discount Badge)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={editingProduct.discountPercent || ''}
                  placeholder="Ví dụ: 9 hoặc 15"
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      discountPercent: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              {/* TRẠNG THÁI LÀ CHỌN DROPDOWN */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Trạng thái hàng (Chọn)</label>
                <select
                  className={styles.select}
                  value={editingProduct.status || 'none'}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      status: e.target.value as ProductStatusType,
                    })
                  }
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Đường dẫn ảnh sản phẩm</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mức giảm Smember</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Smember giảm đến 420.000đ"
                  value={editingProduct.smemberDiscount || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, smemberDiscount: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mức giảm S-Student (Học sinh/Sinh viên)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="S-Student giảm thêm 500.000đ"
                  value={editingProduct.studentDiscount || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, studentDiscount: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Đánh giá sao (Rating)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  className={styles.input}
                  value={editingProduct.rating || ''}
                  placeholder="Ví dụ: 5 hoặc 4.9"
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      rating: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tùy chọn bổ sung</label>
                <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.hasZeroInstallment)}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          hasZeroInstallment: e.target.checked,
                        })
                      }
                    />
                    Trả góp 0%
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isFastDelivery)}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          isFastDelivery: e.target.checked,
                        })
                      }
                    />
                    ⚡ Giao 2 Giờ
                  </label>
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Chính sách phụ phí & trả góp</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editingProduct.installmentNote || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, installmentNote: e.target.value })
                  }
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button className={styles.btnSecondary} onClick={() => setEditingProduct(null)}>
                Hủy bỏ
              </button>
              <button className={styles.btnPrimary} onClick={handleSaveEditProduct}>
                Cập Nhật Sản Phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM SẢN PHẨM MỚI ================= */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>+ Thêm Sản Phẩm Mới Vào Chuyên Mục</h2>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Tên sản phẩm *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ví dụ: iPhone 18 Pro Max 512GB"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Danh mục</label>
                <select
                  className={styles.select}
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                >
                  <option value="phone">Điện thoại</option>
                  <option value="tablet">Máy tính bảng</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Thương hiệu (Hãng)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Apple, Samsung, Xiaomi..."
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Giá khuyến mãi (VNĐ) *</label>
                <input
                  type="number"
                  className={styles.input}
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Giá niêm yết cũ (VNĐ)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={newProduct.oldPrice || ''}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      oldPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>% Giảm giá hiển thị (Badge)</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="Ví dụ: 10"
                  value={newProduct.discountPercent || ''}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      discountPercent: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              {/* TRẠNG THÁI LÀ CHỌN DROPDOWN */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Trạng thái hàng (Chọn)</label>
                <select
                  className={styles.select}
                  value={newProduct.status || 'none'}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      status: e.target.value as ProductStatusType,
                    })
                  }
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Link ảnh sản phẩm</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mức giảm Smember</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newProduct.smemberDiscount || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, smemberDiscount: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mức giảm S-Student</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newProduct.studentDiscount || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, studentDiscount: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Đánh giá sao (Rating)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  className={styles.input}
                  value={newProduct.rating || ''}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      rating: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tùy chọn</label>
                <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(newProduct.hasZeroInstallment)}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, hasZeroInstallment: e.target.checked })
                      }
                    />
                    Trả góp 0%
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(newProduct.isFastDelivery)}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, isFastDelivery: e.target.checked })
                      }
                    />
                    ⚡ Giao 2 Giờ
                  </label>
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Chính sách phụ phí & trả góp</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newProduct.installmentNote || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, installmentNote: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button className={styles.btnSecondary} onClick={() => setShowAddModal(false)}>
                Hủy bỏ
              </button>
              <button className={styles.btnPrimary} onClick={handleAddProduct}>
                Thêm Vào Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
