'use client';

import React, { useMemo, useState } from 'react';
import styles from './AdminDataTable.module.css';

export interface Column<T> {
  key: string;
  title: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T | string)[];
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubtext?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function AdminDataTable<T extends Record<string, any>>({
  columns,
  data = [],
  keyExtractor,
  searchable = true,
  searchPlaceholder = 'Tìm kiếm dữ liệu...',
  searchFields,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  isLoading = false,
  emptyMessage = 'Không tìm thấy dữ liệu phù hợp',
  emptySubtext = 'Hãy thử thay đổi từ khóa tìm kiếm hoặc làm mới trang',
  actions,
  className = '',
}: AdminDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // 1. Tìm kiếm (Search Filter)
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.trim().toLowerCase();

    return data.filter((item) => {
      // Nếu có cấu hình searchFields cụ thể
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field as string];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
      }

      // Mặc định tìm qua tất cả các trường chuỗi hoặc số
      return Object.values(item).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchFields]);

  // 2. Sắp xếp (Sorting)
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB), 'vi', { numeric: true });
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortOrder]);

  // 3. Phân trang (Pagination)
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, validCurrentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const startIndex = (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, totalItems);

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Top action bar: Search & custom actions */}
      {(searchable || actions) && (
        <div className={styles.topBar}>
          {searchable ? (
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
          ) : <div />}

          {actions && <div className={styles.actionsWrap}>{actions}</div>}
        </div>
      )}

      {/* Main Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ width: col.width, textAlign: col.align || 'left' }}
                      className={`${styles.th} ${col.sortable ? styles.thSortable : ''}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      {col.title}
                      {col.sortable && (
                        <span className={styles.sortIcon}>
                          {isSorted ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className={styles.tbody}>
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={`skeleton-${rIdx}`}>
                    {columns.map((col, cIdx) => (
                      <td key={`skeleton-col-${cIdx}`} className={styles.td}>
                        <div
                          className={styles.skeletonCell}
                          style={{ width: `${Math.max(40, 90 - (cIdx * 15))}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={columns.length} className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📂</div>
                    <div className={styles.emptyText}>{emptyMessage}</div>
                    <div className={styles.emptySubtext}>{emptySubtext}</div>
                  </td>
                </tr>
              ) : (
                // Data rows
                paginatedData.map((item, index) => {
                  const absoluteIndex = (validCurrentPage - 1) * pageSize + index;
                  return (
                    <tr key={keyExtractor(item, absoluteIndex)}>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={styles.td}
                          style={{ textAlign: col.align || 'left' }}
                        >
                          {col.render
                            ? col.render(item, absoluteIndex)
                            : String(item[col.key] !== null && item[col.key] !== undefined ? item[col.key] : '—')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && totalItems > 0 && (
          <div className={styles.paginationBar}>
            <div className={styles.pageInfo}>
              <span>
                Hiển thị <strong>{startIndex} - {endIndex}</strong> trong <strong>{totalItems}</strong> mục
              </span>
              <span>•</span>
              <label>
                Mỗi trang:
                <select
                  className={styles.pageSizeSelect}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.pageControls}>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={validCurrentPage <= 1}
                title="Trang trước"
              >
                ◀
              </button>

              {Array.from({ length: totalPages }).map((_, pIdx) => {
                const pageNum = pIdx + 1;
                // Chỉ hiển thị các trang lân cận nếu nhiều hơn 7 trang
                if (
                  totalPages > 7 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - validCurrentPage) > 1
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={`ellipsis-${pageNum}`} style={{ padding: '0 4px' }}>...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`${styles.pageBtn} ${pageNum === validCurrentPage ? styles.pageBtnActive : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={validCurrentPage >= totalPages}
                title="Trang sau"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

