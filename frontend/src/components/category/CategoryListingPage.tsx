'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { categoryService, CategoryTreeItem } from '../../services/categoryService';
import { brandService, BrandItem } from '../../services/brandService';
import { productService, ProductItem, ProductPageResponse } from '../../services/productService';
import styles from './CategoryListingPage.module.css';

interface CategoryListingPageProps {
  categorySlug: string;
  brandSlug?: string;
}

type SortType = 'default' | 'price_asc' | 'price_desc' | 'newest';

interface PriceRange {
  label: string;
  min?: number;
  max?: number;
}

const formatVND = (price: number): string => {
  return price.toLocaleString('vi-VN') + 'đ';
};

export const CategoryListingPage: React.FC<CategoryListingPageProps> = ({
  categorySlug,
  brandSlug,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<CategoryTreeItem | null>(null);
  const [allCategories, setAllCategories] = useState<CategoryTreeItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [productsData, setProductsData] = useState<ProductPageResponse>({
    items: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
  });

  // Local filters
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedSort, setSelectedSort] = useState<SortType>('default');
  const [selectedPriceIdx, setSelectedPriceIdx] = useState<number>(-1);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  // Price range configuration based on category type
  const isComputerCategory = useMemo(() => {
    const slug = (categorySlug || '').toLowerCase();
    return slug.includes('laptop') || slug.includes('pc') || slug.includes('mac');
  }, [categorySlug]);

  const priceRanges: PriceRange[] = useMemo(() => {
    if (isComputerCategory) {
      return [
        { label: 'Dưới 10 triệu', max: 10000000 },
        { label: '10 - 15 triệu', min: 10000000, max: 15000000 },
        { label: '15 - 20 triệu', min: 15000000, max: 20000000 },
        { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
        { label: 'Trên 30 triệu', min: 30000000 },
      ];
    }
    return [
      { label: 'Dưới 2 triệu', max: 2000000 },
      { label: '2 - 4 triệu', min: 2000000, max: 4000000 },
      { label: '4 - 7 triệu', min: 4000000, max: 7000000 },
      { label: '7 - 13 triệu', min: 7000000, max: 13000000 },
      { label: '13 - 20 triệu', min: 13000000, max: 20000000 },
      { label: 'Trên 20 triệu', min: 20000000 },
    ];
  }, [isComputerCategory]);

  // Load favorites from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const toggleFavorite = (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = { ...prev, [productId]: !prev[productId] };
      try {
        localStorage.setItem('user_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // 1. Load Category Metadata & Available Brands for this category
  useEffect(() => {
    let isMounted = true;

    async function loadCategoryMeta() {
      try {
        const [catData, allCats, catBrands] = await Promise.all([
          categoryService.getCategoryBySlug(categorySlug),
          categoryService.getAllCategories(false),
          brandService.getBrands({ categorySlug, activeOnly: true }),
        ]);

        if (!isMounted) return;

        setCategory(catData);
        setAllCategories(allCats);
        setBrands(catBrands);
      } catch (err) {
        console.error('Lỗi tải thông tin danh mục:', err);
      }
    }

    loadCategoryMeta();

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  // 2. Load Products with Category + Brand + Price + Pagination filters
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const priceFilter = selectedPriceIdx >= 0 ? priceRanges[selectedPriceIdx] : undefined;

      const paged = await productService.fetchProductsPaged({
        categorySlug,
        brandSlug: brandSlug || undefined,
        minPrice: priceFilter?.min,
        maxPrice: priceFilter?.max,
        isNew: selectedSort === 'newest' ? true : undefined,
        page: currentPage,
        size: 20,
        activeOnly: true,
      });

      // Handle client-side price sorting if backend sorting is not requested
      let sortedItems = [...paged.items];
      if (selectedSort === 'price_asc') {
        sortedItems.sort((a, b) => a.price - b.price);
      } else if (selectedSort === 'price_desc') {
        sortedItems.sort((a, b) => b.price - a.price);
      }

      setProductsData({
        ...paged,
        items: sortedItems,
      });
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm danh mục:', err);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, brandSlug, selectedPriceIdx, selectedSort, currentPage, priceRanges]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Determine active brand
  const activeBrand = useMemo(() => {
    if (!brandSlug) return null;
    return brands.find((b) => b.slug.toLowerCase() === brandSlug.toLowerCase()) || null;
  }, [brands, brandSlug]);

  // Determine parent category for breadcrumbs
  const parentCategory = useMemo(() => {
    if (!category || !category.parentId) return null;
    return allCategories.find((c) => c.categoryId === category.parentId) || null;
  }, [category, allCategories]);

  // Subcategories (child categories if any)
  const subCategories = useMemo(() => {
    if (!category) return [];
    return allCategories.filter((c) => c.parentId === category.categoryId);
  }, [category, allCategories]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if brand is specified but does not belong to this category
  const isInvalidBrandForCategory = brandSlug && brands.length > 0 && !activeBrand;

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span className={styles.breadcrumbSeparator}>/</span>

        {parentCategory && (
          <>
            <Link href={`/category/${parentCategory.slug}`}>{parentCategory.name}</Link>
            <span className={styles.breadcrumbSeparator}>/</span>
          </>
        )}

        {category ? (
          brandSlug && activeBrand ? (
            <>
              <Link href={`/category/${category.slug}`}>{category.name}</Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{activeBrand.name}</span>
            </>
          ) : (
            <span className={styles.breadcrumbCurrent}>{category.name}</span>
          )
        ) : (
          <span className={styles.breadcrumbCurrent}>Danh mục</span>
        )}
      </nav>

      {/* 2. Category Title & Total count */}
      <div className={styles.headerSection}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>
            {category ? category.name : 'Sản phẩm'}
            {activeBrand ? ` ${activeBrand.name}` : ''}
          </h1>
          {!loading && (
            <span className={styles.productCount}>
              ({productsData.totalElements} sản phẩm)
            </span>
          )}
        </div>
      </div>

      {/* 3. Filter Card: Brand Pills, Subcategory Pills, Price Pills & Sorting */}
      <div className={styles.filterCard}>
        {/* Brand Filter Row (Only brands with actual products in this category) */}
        {brands.length > 0 && (
          <div className={styles.filterRow}>
            <div className={styles.filterLabel}>
              <span>🏷️</span> Thương hiệu:
            </div>
            <div className={styles.pillGroup}>
              <Link
                href={`/category/${categorySlug}`}
                className={`${styles.pill} ${!brandSlug ? styles.pillActive : ''}`}
                onClick={() => setCurrentPage(0)}
              >
                Tất cả
              </Link>
              {brands.map((b) => {
                const isActive = brandSlug?.toLowerCase() === b.slug.toLowerCase();
                return (
                  <Link
                    key={b.brandId}
                    href={`/category/${categorySlug}/${b.slug}`}
                    className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                    onClick={() => setCurrentPage(0)}
                  >
                    {b.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Subcategories (if any) */}
        {subCategories.length > 0 && (
          <div className={styles.filterRow}>
            <div className={styles.filterLabel}>
              <span>📂</span> Danh mục con:
            </div>
            <div className={styles.pillGroup}>
              {subCategories.map((sub) => (
                <Link
                  key={sub.categoryId}
                  href={`/category/${sub.slug}`}
                  className={styles.pill}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Price Range Filter Pills */}
        <div className={styles.filterRow}>
          <div className={styles.filterLabel}>
            <span>💰</span> Mức giá:
          </div>
          <div className={styles.pillGroup}>
            <button
              type="button"
              className={`${styles.pill} ${selectedPriceIdx === -1 ? styles.pillActive : ''}`}
              onClick={() => {
                setSelectedPriceIdx(-1);
                setCurrentPage(0);
              }}
            >
              Tất cả
            </button>
            {priceRanges.map((pr, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.pill} ${selectedPriceIdx === idx ? styles.pillActive : ''}`}
                onClick={() => {
                  setSelectedPriceIdx(idx);
                  setCurrentPage(0);
                }}
              >
                {pr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort & Order Toolbar */}
        <div className={styles.toolbarRow}>
          <div className={styles.sortGroup}>
            <span className={styles.sortLabel}>Sắp xếp theo:</span>
            <button
              type="button"
              className={`${styles.sortButton} ${selectedSort === 'default' ? styles.sortButtonActive : ''}`}
              onClick={() => setSelectedSort('default')}
            >
              Nổi bật
            </button>
            <button
              type="button"
              className={`${styles.sortButton} ${selectedSort === 'newest' ? styles.sortButtonActive : ''}`}
              onClick={() => setSelectedSort('newest')}
            >
              Mới nhất
            </button>
            <button
              type="button"
              className={`${styles.sortButton} ${selectedSort === 'price_asc' ? styles.sortButtonActive : ''}`}
              onClick={() => setSelectedSort('price_asc')}
            >
              Giá thấp - cao
            </button>
            <button
              type="button"
              className={`${styles.sortButton} ${selectedSort === 'price_desc' ? styles.sortButtonActive : ''}`}
              onClick={() => setSelectedSort('price_desc')}
            >
              Giá cao - thấp
            </button>
          </div>
        </div>
      </div>

      {/* 4. Products Grid / Empty States / Loading */}
      {loading ? (
        <div className={styles.productGrid}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonCard}>
              <div className={styles.skeletonImg} />
              <div className={styles.skeletonLine} style={{ width: '80%' }} />
              <div className={styles.skeletonLine} style={{ width: '60%' }} />
              <div className={styles.skeletonLine} style={{ width: '40%' }} />
            </div>
          ))}
        </div>
      ) : isInvalidBrandForCategory ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h2 className={styles.emptyTitle}>Thương hiệu không thuộc danh mục này</h2>
          <p className={styles.emptyText}>
            Thương hiệu &quot;{brandSlug}&quot; hiện không có sản phẩm nào thuộc danh mục &quot;{category?.name || categorySlug}&quot;.
          </p>
          <Link href={`/category/${categorySlug}`} className={styles.actionBtn}>
            Xem tất cả sản phẩm {category?.name || ''}
          </Link>
        </div>
      ) : productsData.items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h2 className={styles.emptyTitle}>Không tìm thấy sản phẩm phù hợp</h2>
          <p className={styles.emptyText}>
            Rất tiếc, hiện chưa có sản phẩm nào phù hợp với bộ lọc bạn đã chọn. Vui lòng thử chọn mức giá hoặc thương hiệu khác.
          </p>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => {
              setSelectedPriceIdx(-1);
              setSelectedSort('default');
              if (brandSlug) {
                router.push(`/category/${categorySlug}`);
              }
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className={styles.productGrid}>
            {productsData.items.map((prod) => {
              const discountPercent =
                prod.maxPrice && prod.maxPrice > prod.price
                  ? Math.round(((prod.maxPrice - prod.price) / prod.maxPrice) * 100)
                  : 0;

              const isFav = !!favorites[prod.id];
              const imgUrl = prod.primaryImage || (prod.images && prod.images[0]) || '/images/placeholder.png';

              return (
                <Link
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  className={styles.productCard}
                >
                  {/* Top Badge Row */}
                  <div className={styles.badgeRow}>
                    {discountPercent > 0 ? (
                      <span className={styles.discountBadge}>Giảm {discountPercent}%</span>
                    ) : (
                      <span />
                    )}
                    <span className={styles.installmentBadge}>Trả góp 0%</span>
                  </div>

                  {/* Product Image */}
                  <div className={styles.imageContainer}>
                    <Image
                      src={imgUrl}
                      alt={prod.name}
                      fill
                      className={styles.productImage}
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>

                  {/* Product Info */}
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName} title={prod.name}>
                      {prod.name}
                    </h3>

                    {/* Price Row */}
                    <div className={styles.priceRow}>
                      <span className={styles.currentPrice}>{formatVND(prod.price)}</span>
                      {prod.maxPrice && prod.maxPrice > prod.price && (
                        <span className={styles.oldPrice}>{formatVND(prod.maxPrice)}</span>
                      )}
                    </div>

                    {/* Smember Box */}
                    <div className={styles.smemberBox}>
                      Smember giảm đến {formatVND(Math.round((prod.price * 0.01) / 1000) * 1000)}
                    </div>
                  </div>

                  {/* Card Footer: Fast Delivery, Rating, Favorite Heart */}
                  <div className={styles.cardFooter}>
                    <div className={styles.footerLeft}>
                      <span className={styles.fastDeliveryBadge} title="Giao nhanh 2 giờ">
                        ⚡ 2 Giờ
                      </span>
                      <span className={styles.ratingDisplay} title="5 sao">
                        ★ 5.0
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`${styles.heartBtn} ${isFav ? styles.favorited : ''}`}
                      onClick={(e) => toggleFavorite(prod.id, e)}
                      title={isFav ? 'Bỏ thích' : 'Yêu thích'}
                    >
                      {isFav ? '❤️' : '♡'}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 5. Pagination */}
          {productsData.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                « Trước
              </button>

              {Array.from({ length: productsData.totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.pageBtn} ${currentPage === idx ? styles.pageBtnActive : ''}`}
                  onClick={() => handlePageChange(idx)}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage >= productsData.totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Sau »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
