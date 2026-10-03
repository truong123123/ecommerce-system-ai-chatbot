'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import styles from '../adminCrud.module.css';
import { productService, ProductItem } from '../../../services/productService';
import { categoryService, CategoryTreeItem } from '../../../services/categoryService';
import { brandService, BrandItem } from '../../../services/brandService';

interface ProductFormState {
  name: string;
  slug: string;
  categoryId: number | '';
  brandId: number | '';
  modelCode: string;
  price: number | '';
  costPrice: number | '';
  image: string;
  description: string;
  isHot: boolean;
  isNew: boolean;
  isActive: boolean;
}

const PAGE_SIZE = 20;

export default function AdminProductPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryTreeItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'hot' | 'new'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const [formData, setFormData] = useState<ProductFormState>({
    name: '',
    slug: '',
    categoryId: '',
    brandId: '',
    modelCode: '',
    price: '',
    costPrice: '',
    image: '',
    description: '',
    isHot: false,
    isNew: false,
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats, brs] = await Promise.all([
        productService.fetchProducts({ activeOnly: false }),
        categoryService.getAllCategories(false),
        brandService.getBrands({ activeOnly: false }),
      ]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brs);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu sản phẩm:', err);
      showAlert('error', 'Không thể tải danh sách sản phẩm từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showAlert = useCallback((type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  }, []);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug ? generateSlug(val) : prev.slug,
    }));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setAutoSlug(true);
    setFormData({
      name: '',
      slug: '',
      categoryId: categories.length > 0 ? categories[0].categoryId : '',
      brandId: brands.length > 0 ? brands[0].brandId : '',
      modelCode: '',
      price: '',
      costPrice: '',
      image: '',
      description: '',
      isHot: false,
      isNew: true,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setAutoSlug(false);
    setFormData({
      name: p.name,
      slug: p.slug,
      categoryId: p.categoryId || '',
      brandId: p.brandId || '',
      modelCode: '',
      price: p.price || '',
      costPrice: '',
      image: p.primaryImage || '',
      description: p.description || '',
      isHot: !!p.isHot,
      isNew: !!p.isNew,
      isActive: p.isActive,
    });
    setShowModal(true);
  };

  // Lưu Modal: Cập nhật state trực tiếp không fetch lại toàn bộ
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showAlert('error', 'Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!formData.categoryId) {
      showAlert('error', 'Vui lòng chọn danh mục cho sản phẩm!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        slug: formData.slug?.trim() || generateSlug(formData.name),
        categoryId: Number(formData.categoryId),
        brandId: formData.brandId ? Number(formData.brandId) : null,
        modelCode: formData.modelCode?.trim() || null,
        price: formData.price ? Number(formData.price) : null,
        costPrice: formData.costPrice ? Number(formData.costPrice) : null,
        image: formData.image?.trim() || null,
        description: formData.description?.trim() || null,
        isHot: formData.isHot,
        isNew: formData.isNew,
        isActive: formData.isActive,
      };

      const categoryObj = categories.find((c) => c.categoryId === payload.categoryId);
      const brandObj = brands.find((b) => b.brandId === payload.brandId);

      if (editingProduct) {
        const updated = await productService.updateProduct(editingProduct.id, payload);
        // Cập nhật React state ngay lập tức mà không gọi lại API GET
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingProduct.id
              ? {
                  ...item,
                  ...updated,
                  name: payload.name,
                  slug: payload.slug,
                  categoryId: payload.categoryId,
                  categoryName: categoryObj ? categoryObj.name : item.categoryName,
                  categorySlug: categoryObj ? categoryObj.slug : item.categorySlug,
                  brandId: payload.brandId,
                  brandName: brandObj ? brandObj.name : item.brandName,
                  price: payload.price ?? item.price,
                  primaryImage: payload.image || updated.primaryImage || item.primaryImage,
                  description: payload.description,
                  isHot: payload.isHot,
                  isNew: payload.isNew,
                  isActive: payload.isActive,
                }
              : item
          )
        );
        showAlert('success', `Cập nhật sản phẩm "${payload.name}" thành công!`);
      } else {
        const created = await productService.createProduct(payload);
        const newProductItem: ProductItem = {
          ...created,
          name: payload.name,
          slug: payload.slug,
          categoryId: payload.categoryId,
          categoryName: categoryObj ? categoryObj.name : '',
          categorySlug: categoryObj ? categoryObj.slug : '',
          brandId: payload.brandId,
          brandName: brandObj ? brandObj.name : '',
          price: payload.price || 0,
          maxPrice: payload.price || 0,
          primaryImage: payload.image || created.primaryImage || '',
          description: payload.description || '',
          isHot: payload.isHot,
          isNew: payload.isNew,
          isActive: payload.isActive,
          variants: created.variants || [],
          images: payload.image ? [payload.image] : [],
        };
        // Thêm vào đầu state
        setProducts((prev) => [newProductItem, ...prev]);
        showAlert('success', `Tạo sản phẩm "${payload.name}" thành công!`);
      }

      setShowModal(false);
    } catch (err: any) {
      console.error('Lỗi khi lưu sản phẩm:', err);
      const errMsg = err?.response?.data?.message || err.message || 'Lỗi khi lưu sản phẩm.';
      showAlert('error', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle HOT: Chỉ gửi PUT item đó và cập nhật local React state, KHÔNG GET lại toàn bộ danh sách
  const handleQuickToggleHot = async (p: ProductItem) => {
    const newHot = !p.isHot;
    // Cập nhật giao diện lập tức (Optimistic Update)
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, isHot: newHot } : item))
    );

    try {
      await productService.updateProduct(p.id, {
        isHot: newHot,
      });
      showAlert('success', `Đã ${newHot ? 'gắn cờ HOT 🔥' : 'bỏ cờ HOT'} cho "${p.name}".`);
    } catch (err: any) {
      // Hoàn tác nếu có lỗi
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, isHot: !newHot } : item))
      );
      showAlert('error', 'Không thể cập nhật cờ HOT.');
    }
  };

  // Toggle NEW: Chỉ gửi PUT item đó và cập nhật local React state, KHÔNG GET lại toàn bộ danh sách
  const handleQuickToggleNew = async (p: ProductItem) => {
    const newFlag = !p.isNew;
    // Cập nhật giao diện lập tức (Optimistic Update)
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, isNew: newFlag } : item))
    );

    try {
      await productService.updateProduct(p.id, {
        isNew: newFlag,
      });
      showAlert('success', `Đã ${newFlag ? 'gắn cờ NEW 🆕' : 'bỏ cờ NEW'} cho "${p.name}".`);
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, isNew: !newFlag } : item))
      );
      showAlert('error', 'Không thể cập nhật cờ MỚI.');
    }
  };

  // Toggle ACTIVE: Chỉ gửi PUT item đó và cập nhật local React state, KHÔNG GET lại toàn bộ danh sách
  const handleQuickToggleActive = async (p: ProductItem) => {
    const newActive = !p.isActive;
    // Cập nhật giao diện lập tức (Optimistic Update)
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, isActive: newActive } : item))
    );

    try {
      await productService.updateProduct(p.id, {
        isActive: newActive,
      });
      showAlert('success', `Đã ${newActive ? 'kích hoạt bán' : 'tạm ngưng bán'} "${p.name}".`);
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, isActive: !newActive } : item))
      );
      showAlert('error', 'Không thể thay đổi trạng thái sản phẩm.');
    }
  };

  // Xóa sản phẩm: Cập nhật local React state, KHÔNG GET lại toàn bộ danh sách
  const handleDelete = async (p: ProductItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ngưng hoạt động sản phẩm "${p.name}" (ID: ${p.id})?`)) {
      return;
    }

    try {
      await productService.deleteProduct(p.id);
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, isActive: false } : item))
      );
      showAlert('success', `Đã chuyển sản phẩm "${p.name}" sang trạng thái ngừng bán.`);
    } catch (err: any) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      showAlert('error', err?.response?.data?.message || 'Lỗi khi xóa sản phẩm.');
    }
  };

  // Thống kê nhanh với useMemo
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const hotCount = products.filter((p) => p.isHot).length;
    const newCount = products.filter((p) => p.isNew).length;
    return { total, active, hotCount, newCount };
  }, [products]);

  // Bộ lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchKeyword =
        !searchKeyword ||
        p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.id.toString().includes(searchKeyword);

      const matchCategory =
        selectedCategory === 'all' || p.categoryId.toString() === selectedCategory;

      const matchBrand =
        selectedBrand === 'all' || p.brandId?.toString() === selectedBrand;

      const matchBadge =
        badgeFilter === 'all' ||
        (badgeFilter === 'hot' && p.isHot) ||
        (badgeFilter === 'new' && p.isNew);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.isActive) ||
        (statusFilter === 'inactive' && !p.isActive);

      return matchKeyword && matchCategory && matchBrand && matchBadge && matchStatus;
    });
  }, [products, searchKeyword, selectedCategory, selectedBrand, badgeFilter, statusFilter]);

  // Phân trang (Pagination) 20 sản phẩm/trang
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>📦 Quản lý Sản phẩm (Products)</h1>
          <p>Quản lý toàn bộ kho hàng, phân nhóm danh mục, thương hiệu, giá bán và cờ HOT / NEW</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnPrimary} onClick={openCreateModal}>
            <span>➕</span> Thêm Sản phẩm mới
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div className={`${styles.alertBanner} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.message}</span>
          <button className={styles.alertCloseBtn} onClick={() => setAlert(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>📦</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Tổng số sản phẩm</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>✅</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.active}</span>
            <span className={styles.statLabel}>Đang mở bán</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>🔥</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.hotCount}</span>
            <span className={styles.statLabel}>Sản phẩm HOT Mega Menu</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconInfo}`}>🆕</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.newCount}</span>
            <span className={styles.statLabel}>Sản phẩm Mới</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className={styles.toolbarCard}>
        <div className={styles.filterGroup}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên sản phẩm, slug, ID..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.iconUrl ? c.iconUrl + ' ' : ''}
                {c.parentId ? '└ ' : ''}
                {c.name}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả thương hiệu</option>
            {brands.map((b) => (
              <option key={b.brandId} value={b.brandId}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={badgeFilter}
            onChange={(e: any) => {
              setBadgeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả nhãn</option>
            <option value="hot">Chỉ sản phẩm HOT 🔥</option>
            <option value="new">Chỉ sản phẩm MỚI 🆕</option>
          </select>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e: any) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang mở bán</option>
            <option value="inactive">Đang tạm ẩn</option>
          </select>
        </div>

        <div style={{ fontSize: 13, color: '#9ca3af' }}>
          Tổng tìm thấy: <strong style={{ color: '#fff' }}>{filteredProducts.length}</strong> sản phẩm
        </div>
      </div>

      {/* Table Content */}
      <div className={styles.contentCard}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <p className={styles.emptyTitle}>Đang tải danh sách sản phẩm...</p>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <p className={styles.emptyTitle}>Chưa có sản phẩm nào</p>
            <p className={styles.emptyDesc}>Bấm &quot;Thêm Sản phẩm mới&quot; để đăng sản phẩm đầu tiên lên hệ thống.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th style={{ width: 70 }}>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Thương hiệu</th>
                    <th style={{ textAlign: 'right' }}>Giá bán</th>
                    <th style={{ textAlign: 'center', width: 90 }}>HOT 🔥</th>
                    <th style={{ textAlign: 'center', width: 90 }}>MỚI 🆕</th>
                    <th style={{ textAlign: 'center', width: 120 }}>Trạng thái</th>
                    <th style={{ textAlign: 'center', width: 110 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '30px' }}>
                        Không tìm thấy sản phẩm nào phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700, color: '#9ca3af' }}>#{p.id}</td>
                        <td>
                          {p.primaryImage ? (
                            <div style={{ width: 44, height: 44, position: 'relative', borderRadius: 6, overflow: 'hidden', background: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <Image
                                src={p.primaryImage}
                                alt={p.name}
                                fill
                                style={{ objectFit: 'contain' }}
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                              📦
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: 13.5, maxWidth: 300, lineHeight: 1.3 }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>
                            /{p.slug}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: '#e5e7eb' }}>
                            {p.categoryName || `ID ${p.categoryId}`}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: '#d1d5db', fontWeight: 600 }}>
                            {p.brandName || '—'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#ff4d4f', fontSize: 13.5 }}>
                          {p.price ? `${Number(p.price).toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                        </td>

                        {/* Nút bật/tắt nhanh cờ isHot */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className={styles.btnToggle}
                            onClick={() => handleQuickToggleHot(p)}
                            title={p.isHot ? 'Bỏ cờ HOT' : 'Gắn cờ HOT'}
                          >
                            {p.isHot ? (
                              <span className={`${styles.badge} ${styles.badgeHot}`}>🔥 HOT</span>
                            ) : (
                              <span style={{ opacity: 0.25, fontSize: 16 }}>🔥</span>
                            )}
                          </button>
                        </td>

                        {/* Nút bật/tắt nhanh cờ isNew */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className={styles.btnToggle}
                            onClick={() => handleQuickToggleNew(p)}
                            title={p.isNew ? 'Bỏ cờ NEW' : 'Gắn cờ NEW'}
                          >
                            {p.isNew ? (
                              <span className={`${styles.badge} ${styles.badgeNew}`}>🆕 NEW</span>
                            ) : (
                              <span style={{ opacity: 0.25, fontSize: 16 }}>🆕</span>
                            )}
                          </button>
                        </td>

                        {/* Trạng thái isActive */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className={styles.btnToggle}
                            onClick={() => handleQuickToggleActive(p)}
                            title="Nhấn để đổi trạng thái"
                          >
                            {p.isActive ? (
                              <span className={`${styles.badge} ${styles.badgeSuccess}`}>● Đang bán</span>
                            ) : (
                              <span className={`${styles.badge} ${styles.badgeMuted}`}>○ Tạm ẩn</span>
                            )}
                          </button>
                        </td>

                        {/* Thao tác Sửa / Xóa */}
                        <td>
                          <div className={styles.actionGroup} style={{ justifyContent: 'center' }}>
                            <button
                              type="button"
                              className={`${styles.btnIcon} ${styles.btnIconEdit}`}
                              title="Sửa sản phẩm"
                              onClick={() => openEditModal(p)}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className={`${styles.btnIcon} ${styles.btnIconDelete}`}
                              title="Ngưng bán"
                              onClick={() => handleDelete(p)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Thanh Phân Trang (Pagination) 20 sản phẩm/trang */}
            {filteredProducts.length > 0 && (
              <div className={styles.paginationWrapper}>
                <div className={styles.paginationInfo}>
                  Hiển thị <strong>{Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredProducts.length)}</strong> -{' '}
                  <strong>{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)}</strong> trong tổng số{' '}
                  <strong>{filteredProducts.length}</strong> sản phẩm (Trang {currentPage} / {totalPages})
                </div>

                <div className={styles.paginationControls}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    « Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .map((pageNum, idx, arr) => (
                      <React.Fragment key={pageNum}>
                        {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                          <span style={{ color: '#6b7280', padding: '0 4px', fontSize: 12 }}>...</span>
                        )}
                        <button
                          type="button"
                          className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Sau »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL THÊM / SỬA SẢN PHẨM */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => !isSubmitting && setShowModal(false)}>
          <div className={styles.modalDialog} style={{ maxWidth: 660 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingProduct ? '✏️ Chỉnh sửa Sản phẩm' : '➕ Thêm Sản phẩm mới'}
              </h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => !isSubmitting && setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className={styles.modalBody}>
                {/* Tên sản phẩm */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Tên sản phẩm <span className={styles.formRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Ví dụ: iPhone 16 Pro Max 256GB, Laptop ASUS TUF Gaming F15..."
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                  />
                </div>

                {/* Slug */}
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.formLabel}>Slug đường dẫn URL</label>
                    <label style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                      />
                      Tự sinh từ tên
                    </label>
                  </div>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="iphone-16-pro-max-256gb..."
                    value={formData.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                  />
                </div>

                {/* Danh mục & Thương hiệu */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Danh mục <span className={styles.formRequired}>*</span>
                    </label>
                    <select
                      className={styles.modalSelect}
                      value={formData.categoryId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: Number(e.target.value) }))}
                      required
                    >
                      <option value="">— Chọn danh mục —</option>
                      {categories.map((c) => (
                        <option key={c.categoryId} value={c.categoryId}>
                          {c.iconUrl ? c.iconUrl + ' ' : ''}
                          {c.parentId ? '└ ' : ''}
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Thương hiệu</label>
                    <select
                      className={styles.modalSelect}
                      value={formData.brandId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          brandId: e.target.value ? Number(e.target.value) : '',
                        }))
                      }
                    >
                      <option value="">— Không có / Chưa chọn —</option>
                      {brands.map((b) => (
                        <option key={b.brandId} value={b.brandId}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Giá bán & Giá vốn */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Giá bán (VNĐ)</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      placeholder="Ví dụ: 30000000"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value ? Number(e.target.value) : '',
                        }))
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Giá niêm yết / Giá gốc (VNĐ)</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      placeholder="Ví dụ: 34990000"
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          costPrice: e.target.value ? Number(e.target.value) : '',
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Ảnh đại diện */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ảnh đại diện sản phẩm (Image URL)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="https://... hoặc /images/products/..."
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                  />
                  {formData.image && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Xem trước:</span>
                      <div style={{ width: 48, height: 48, position: 'relative', borderRadius: 6, overflow: 'hidden', background: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Image
                          src={formData.image}
                          alt="Preview"
                          fill
                          style={{ objectFit: 'contain' }}
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mô tả */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mô tả tóm tắt</label>
                  <textarea
                    rows={2}
                    className={styles.formTextarea}
                    placeholder="Đặc điểm nổi bật, cấu hình chính của sản phẩm..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Cờ HOT, NEW, ACTIVE */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 4 }}>
                  <label className={styles.switchContainer} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
                    <input
                      type="checkbox"
                      checked={formData.isHot}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isHot: e.target.checked }))}
                    />
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>🔥 Sản phẩm HOT</div>
                  </label>

                  <label className={styles.switchContainer} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isNew: e.target.checked }))}
                    />
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>🆕 Sản phẩm MỚI</div>
                  </label>

                  <label className={styles.switchContainer} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>✅ Mở bán</div>
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  disabled={isSubmitting}
                  onClick={() => setShowModal(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : editingProduct ? '💾 Lưu thay đổi' : '➕ Tạo sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
