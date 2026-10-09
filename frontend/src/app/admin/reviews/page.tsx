'use client';

import React, { useEffect, useState, useMemo } from 'react';
import styles from '../adminCrud.module.css';
import { reviewService, ReviewDto } from '../../../services/reviewService';

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'>('ALL');
  const [starFilter, setStarFilter] = useState<'ALL' | number>('ALL');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal / Form state for shop reply
  const [replyingReview, setReplyingReview] = useState<ReviewDto | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAllAdminReviews();
      setReviews(data);
    } catch {
      showAlert('error', 'Không thể tải danh sách đánh giá từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const handleUpdateStatus = async (id: number, newStatus: 'APPROVED' | 'REJECTED' | 'HIDDEN') => {
    try {
      const updated = await reviewService.updateReviewStatus(id, newStatus);
      setReviews((prev) => prev.map((r) => (r.reviewId === id ? updated : r)));
      const labelMap: Record<string, string> = {
        APPROVED: 'Đã duyệt hiển thị',
        REJECTED: 'Đã từ chối',
        HIDDEN: 'Đã ẩn',
      };
      showAlert('success', `Đã chuyển trạng thái: ${labelMap[newStatus] || newStatus}`);
    } catch {
      showAlert('error', 'Lỗi khi cập nhật trạng thái đánh giá.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này? Thao tác sẽ được ghi vào nhật ký kiểm toán (audit log).')) return;
    try {
      await reviewService.deleteAdminReview(id);
      setReviews((prev) => prev.filter((r) => r.reviewId !== id));
      showAlert('success', 'Đã xóa đánh giá thành công.');
    } catch {
      showAlert('error', 'Không thể xóa đánh giá.');
    }
  };

  const handleOpenReplyModal = (rev: ReviewDto) => {
    setReplyingReview(rev);
    setReplyText(rev.reply?.comment || '');
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;
    if (!replyText.trim()) {
      showAlert('error', 'Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setReplySubmitting(true);
    try {
      const updated = await reviewService.addReviewReply(replyingReview.reviewId, replyText.trim());
      setReviews((prev) => prev.map((r) => (r.reviewId === replyingReview.reviewId ? updated : r)));
      showAlert('success', 'Đã lưu phản hồi của shop thành công.');
      setReplyingReview(null);
      setReplyText('');
    } catch {
      showAlert('error', 'Không thể lưu phản hồi của shop.');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDeleteReply = async (reviewId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phản hồi này của shop?')) return;
    try {
      await reviewService.deleteReviewReply(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r.reviewId === reviewId ? { ...r, reply: null } : r))
      );
      showAlert('success', 'Đã xóa phản hồi của shop thành công.');
    } catch {
      showAlert('error', 'Không thể xóa phản hồi.');
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const kw = searchKeyword.toLowerCase();
      const matchKeyword =
        (r.productName && r.productName.toLowerCase().includes(kw)) ||
        (r.customerName && r.customerName.toLowerCase().includes(kw)) ||
        (r.comment && r.comment.toLowerCase().includes(kw));

      const currentStatus = (r.status || 'APPROVED').toUpperCase();
      const matchStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
      const matchStar = starFilter === 'ALL' || r.rating === starFilter;

      return matchKeyword && matchStatus && matchStar;
    });
  }, [reviews, searchKeyword, statusFilter, starFilter]);

  const verifiedCount = reviews.filter((r) => r.isVerifiedPurchase).length;
  const approvedCount = reviews.filter((r) => (r.status || '').toUpperCase() === 'APPROVED').length;
  const hiddenCount = reviews.filter((r) => ['HIDDEN', 'REJECTED'].includes((r.status || '').toUpperCase())).length;

  return (
    <div className={styles.container}>
      {alert && (
        <div className={`${styles.alert} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Kiểm duyệt Đánh giá & Nhận xét (Reviews)</h1>
          <p className={styles.subtitle}>
            Quản lý kiểm duyệt đánh giá, phản hồi chính thức của shop và ghi nhận nhật ký kiểm toán (audit log).
          </p>
        </div>
        <button className={styles.btnSecondary} onClick={loadReviews}>
          <span>🔄</span> Làm mới danh sách
        </button>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{reviews.length}</div>
          <div className={styles.statLabel}>Tổng lượt nhận xét</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#10b981' }}>{approvedCount}</div>
          <div className={styles.statLabel}>Đã duyệt hiển thị (APPROVED)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#ef4444' }}>{hiddenCount}</div>
          <div className={styles.statLabel}>Từ chối / Bị ẩn (REJECTED / HIDDEN)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#3b82f6' }}>{verifiedCount}</div>
          <div className={styles.statLabel}>Khách hàng đã mua thật (Verified)</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, khách hàng, nội dung nhận xét..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterTabs}>
          {(['ALL', 'APPROVED', 'PENDING', 'REJECTED', 'HIDDEN'] as const).map((st) => (
            <button
              key={st}
              className={`${styles.filterTab} ${statusFilter === st ? styles.filterTabActive : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL'
                ? `Tất cả (${reviews.length})`
                : st === 'APPROVED'
                ? `Đã duyệt (${approvedCount})`
                : st === 'PENDING'
                ? `Chờ duyệt (${reviews.filter((r) => (r.status || '').toUpperCase() === 'PENDING').length})`
                : st === 'REJECTED'
                ? `Từ chối (${reviews.filter((r) => (r.status || '').toUpperCase() === 'REJECTED').length})`
                : `Bị ẩn (${reviews.filter((r) => (r.status || '').toUpperCase() === 'HIDDEN').length})`}
            </button>
          ))}
        </div>

        {/* Lọc theo sao */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Lọc theo sao:</span>
          <button
            className={`${styles.filterTab} ${starFilter === 'ALL' ? styles.filterTabActive : ''}`}
            onClick={() => setStarFilter('ALL')}
            style={{ padding: '3px 10px', fontSize: '11px' }}
          >
            Tất cả sao
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              className={`${styles.filterTab} ${starFilter === s ? styles.filterTabActive : ''}`}
              onClick={() => setStarFilter(s)}
              style={{ padding: '3px 10px', fontSize: '11px' }}
            >
              {s} ★
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingWrapper}>Đang tải đánh giá...</div>
        ) : filteredReviews.length === 0 ? (
          <div className={styles.emptyState}>Không tìm thấy đánh giá nào phù hợp.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Khách hàng</th>
                <th style={{ textAlign: 'center' }}>Số sao</th>
                <th>Nội dung nhận xét & Phản hồi shop</th>
                <th>Xác thực</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((r) => {
                const upperStatus = (r.status || 'APPROVED').toUpperCase();
                return (
                  <tr key={r.reviewId}>
                    <td style={{ fontWeight: 600 }}>{r.productName || `Sản phẩm #${r.productId}`}</td>
                    <td>{r.customerName}</td>
                    <td style={{ textAlign: 'center', color: '#f59e0b', fontWeight: 700 }}>
                      {r.rating} ★
                    </td>
                    <td style={{ maxWidth: '320px', fontSize: '0.85rem' }}>
                      <div style={{ color: '#1e293b' }}>{r.comment}</div>
                      {/* Hiển thị phản hồi từ shop nếu có */}
                      {r.reply && (
                        <div
                          style={{
                            marginTop: '6px',
                            background: '#eff6ff',
                            borderLeft: '3px solid #3b82f6',
                            padding: '6px 10px',
                            borderRadius: '0 6px 6px 0',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#1d4ed8', display: 'flex', justifyContent: 'space-between' }}>
                            <span>💬 Shop ({r.reply.staffName}):</span>
                            <button
                              onClick={() => handleDeleteReply(r.reviewId)}
                              style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '10px' }}
                              title="Xóa phản hồi này"
                            >
                              Xóa phản hồi
                            </button>
                          </div>
                          <div style={{ color: '#334155', marginTop: '2px' }}>{r.reply.comment}</div>
                        </div>
                      )}
                    </td>
                    <td>
                      {r.isVerifiedPurchase ? (
                        <span className={styles.badge} style={{ background: '#10b981', color: '#fff', fontSize: '0.75rem' }}>
                          ✓ Đã mua
                        </span>
                      ) : (
                        <span className={styles.badge} style={{ background: '#64748b', color: '#fff', fontSize: '0.75rem' }}>
                          Chưa mua
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td>
                      {upperStatus === 'APPROVED' ? (
                        <span className={styles.badge} style={{ background: '#10b981', color: '#fff' }}>Hiển thị</span>
                      ) : upperStatus === 'PENDING' ? (
                        <span className={styles.badge} style={{ background: '#f59e0b', color: '#fff' }}>Chờ duyệt</span>
                      ) : upperStatus === 'REJECTED' ? (
                        <span className={styles.badge} style={{ background: '#ef4444', color: '#fff' }}>Từ chối</span>
                      ) : (
                        <span className={styles.badge} style={{ background: '#64748b', color: '#fff' }}>Bị ẩn</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionGroup}>
                        {upperStatus !== 'APPROVED' && (
                          <button
                            className={styles.btnSmall}
                            onClick={() => handleUpdateStatus(r.reviewId, 'APPROVED')}
                            title="Duyệt hiển thị"
                            style={{ color: '#10b981' }}
                          >
                            ✓ Duyệt
                          </button>
                        )}
                        {upperStatus !== 'HIDDEN' && (
                          <button
                            className={styles.btnSmall}
                            onClick={() => handleUpdateStatus(r.reviewId, 'HIDDEN')}
                            title="Ẩn đánh giá này"
                          >
                            👁️‍🗨️ Ẩn
                          </button>
                        )}
                        {upperStatus !== 'REJECTED' && (
                          <button
                            className={styles.btnSmall}
                            onClick={() => handleUpdateStatus(r.reviewId, 'REJECTED')}
                            title="Từ chối đánh giá"
                            style={{ color: '#ef4444' }}
                          >
                            ✕ Từ chối
                          </button>
                        )}
                        <button
                          className={styles.btnSmall}
                          onClick={() => handleOpenReplyModal(r)}
                          title="Trả lời của Shop"
                          style={{ color: '#3b82f6' }}
                        >
                          💬 Trả lời
                        </button>
                        <button
                          className={`${styles.btnSmall} ${styles.btnDanger}`}
                          onClick={() => handleDelete(r.reviewId)}
                          title="Xóa vĩnh viễn"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal / Dialog phản hồi shop */}
      {replyingReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>
              💬 Phản hồi của Shop
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
              Đánh giá cho sản phẩm <strong>{replyingReview.productName}</strong> từ khách hàng{' '}
              <strong>{replyingReview.customerName}</strong>: &quot;{replyingReview.comment}&quot;
            </p>

            <form onSubmit={handleSaveReply}>
              <textarea
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  minHeight: '100px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                placeholder="Nhập nội dung phản hồi chính thức của cửa hàng..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={500}
                required
              />
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#94a3b8', marginTop: 4 }}>
                {replyText.length}/500
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setReplyingReview(null)}
                  disabled={replySubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={replySubmitting}
                  style={{ background: '#3b82f6', color: '#fff' }}
                >
                  {replySubmitting ? 'Đang gửi...' : 'Lưu phản hồi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
