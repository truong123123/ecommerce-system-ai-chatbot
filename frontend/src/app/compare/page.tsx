'use client';

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCompareStore } from '../../store/compareStore';
import { comparisonService, ComparisonResponse } from '../../services/comparisonService';
import { X, ArrowLeft } from 'lucide-react';
import styles from './compare.module.css';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedProducts, removeProduct } = useCompareStore();

  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyDifferences, setOnlyDifferences] = useState<boolean>(false);

  // Extract IDs from URL or store
  const idsFromUrl = useMemo(() => {
    const p = searchParams.get('ids');
    if (!p) return [];
    return p
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
  }, [searchParams]);

  const targetIds = useMemo(() => {
    if (idsFromUrl.length >= 2) return idsFromUrl;
    if (selectedProducts.length >= 2) return selectedProducts.map((p) => p.productId);
    return [];
  }, [idsFromUrl, selectedProducts]);

  useEffect(() => {
    if (targetIds.length < 2) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    comparisonService
      .getComparison(targetIds)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Không thể tải dữ liệu so sánh sản phẩm.';
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [targetIds]);

  const handleRemove = (productId: number) => {
    removeProduct(productId);
    const newIds = targetIds.filter((id) => id !== productId);
    if (newIds.length >= 2) {
      router.push(`/compare?ids=${newIds.join(',')}`);
    } else {
      router.push('/compare');
      setData(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
          Đang phân tích và đối chiếu thông số kỹ thuật...
        </div>
      </div>
    );
  }

  if (targetIds.length < 2 || !data || data.products.length < 2) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚖️</div>
          <h2 className={styles.emptyTitle}>Chưa có đủ sản phẩm để so sánh</h2>
          <p className={styles.emptyText}>
            Vui lòng chọn từ 2 đến 4 sản phẩm bằng nút "So sánh" tại trang chi tiết hoặc danh mục sản phẩm để đối chiếu cấu hình.
          </p>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Quay lại trang chủ mua sắm</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>So sánh chi tiết thông số kỹ thuật</h1>
          <p className={styles.subtitle}>
            Đối chiếu chi tiết màn hình, vi xử lý, camera, pin và các tính năng nổi bật giữa các thiết bị
          </p>
        </div>

        <div className={styles.controls}>
          <label className={styles.diffFilterLabel}>
            <input
              type="checkbox"
              checked={onlyDifferences}
              onChange={(e) => setOnlyDifferences(e.target.checked)}
            />
            <span>Chỉ xem điểm khác biệt</span>
          </label>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              <th className={styles.productHeaderCell} style={{ width: '200px', background: '#f8fafc' }}>
                <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>
                  Sản phẩm so sánh ({data.products.length})
                </div>
              </th>
              {data.products.map((p) => (
                <th key={p.productId} className={styles.productHeaderCell}>
                  <button
                    type="button"
                    className={styles.removeColBtn}
                    onClick={() => handleRemove(p.productId)}
                    title="Xóa khỏi so sánh"
                  >
                    <X size={16} />
                  </button>

                  <div className={styles.productCardSummary}>
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        width={100}
                        height={100}
                        className={styles.productThumb}
                      />
                    ) : (
                      <div className={styles.productThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee' }}>
                        📦
                      </div>
                    )}

                    <h3 className={styles.productName}>{p.name}</h3>

                    <div className={styles.productPrice}>
                      {p.minPrice ? `${Number(p.minPrice).toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                    </div>

                    <Link href={`/products/${p.slug}`} className={styles.viewDetailBtn}>
                      Xem chi tiết
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.attributeGroups.map((group) => {
              const visibleAttrs = onlyDifferences
                ? group.attributes.filter((attr) => attr.isDifferent)
                : group.attributes;

              if (visibleAttrs.length === 0) return null;

              return (
                <React.Fragment key={group.groupName}>
                  <tr className={styles.groupHeaderRow}>
                    <td colSpan={data.products.length + 1}>{group.groupName}</td>
                  </tr>

                  {visibleAttrs.map((attr) => (
                    <tr
                      key={attr.key}
                      className={`${styles.attrRow} ${attr.isDifferent ? styles.attrRowDiff : ''}`}
                    >
                      <td className={styles.attrLabelCell}>
                        {attr.label}
                        {attr.isDifferent && <span className={styles.diffBadge}>Khác nhau</span>}
                      </td>

                      {data.products.map((p) => {
                        const val = attr.values[String(p.productId)] || '—';
                        return (
                          <td key={p.productId} className={styles.attrValueCell}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Đang tải trang so sánh...</div>}>
      <CompareContent />
    </Suspense>
  );
}
