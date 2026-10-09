'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Star,
  ThumbsUp,
  CheckCircle,
  MessageSquarePlus,
  Send,
  Edit2,
  Trash2,
  LogIn,
  AlertCircle,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import {
  reviewService,
  ReviewDto,
  ReviewSummary,
  ReviewEligibilityDto,
} from '../../services/reviewService';
import styles from './ProductReviews.module.css';

interface ProductReviewsProps {
  productId?: string | number;
  reviews?: any[];
  overallRating?: number;
  totalReviews?: number;
  reviewBreakdown?: any;
  initialOverallRating?: number;
  initialTotalReviews?: number;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  overallRating: initialOverallRating = 0,
  totalReviews: initialTotalReviews = 0,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryOrderItemId = searchParams.get('orderItemId');

  // Summary State (from API)
  const [summary, setSummary] = useState<ReviewSummary>({
    averageRating: initialOverallRating,
    totalReviews: initialTotalReviews,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  // Eligibility State (5 states: NOT_LOGGED_IN, STAFF_ACCOUNT, NOT_PURCHASED, ALREADY_REVIEWED, ELIGIBLE)
  const [eligibility, setEligibility] = useState<ReviewEligibilityDto | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  // Reviews List State
  const [reviewsList, setReviewsList] = useState<ReviewDto[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(true);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | undefined>(undefined);
  const [selectedSort, setSelectedSort] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Like Map for visual interaction
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedUserMap, setLikedUserMap] = useState<Record<string, boolean>>({});

  // Create Review Form State
  const [createRating, setCreateRating] = useState(5);
  const [createComment, setCreateComment] = useState('');
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number | null>(
    queryOrderItemId ? Number(queryOrderItemId) : null
  );
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});
  const [createGeneralError, setCreateGeneralError] = useState<string | null>(null);

  // Edit Review State (for ALREADY_REVIEWED)
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
  const [editGeneralError, setEditGeneralError] = useState<string | null>(null);

  // Delete Review State
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const formSectionRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Summary
  const loadSummary = useCallback(async () => {
    if (!productId) return;
    try {
      const data = await reviewService.getReviewSummary(productId);
      if (data) {
        setSummary(data);
      }
    } catch {
      // ignore
    }
  }, [productId]);

  // 2. Fetch Eligibility
  const loadEligibility = useCallback(async () => {
    if (!productId) return;
    setEligibilityLoading(true);
    try {
      const data = await reviewService.checkEligibility(productId);
      setEligibility(data);

      // Pre-fill selectedOrderItemId
      if (queryOrderItemId) {
        setSelectedOrderItemId(Number(queryOrderItemId));
      } else if (data.eligibleOrderItemIds && data.eligibleOrderItemIds.length > 0) {
        setSelectedOrderItemId(data.eligibleOrderItemIds[0]);
      }

      // Pre-fill edit fields if already reviewed
      if (data.status === 'ALREADY_REVIEWED' && (data.review || data.myReview)) {
        const rev = data.review || data.myReview;
        if (rev) {
          setEditRating(rev.rating);
          setEditComment(rev.comment);
        }
      }
    } catch {
      setEligibility({
        status: 'NOT_LOGGED_IN',
        message: 'Vui lòng đăng nhập để đánh giá.',
        canReview: false,
      });
    } finally {
      setEligibilityLoading(false);
    }
  }, [productId, queryOrderItemId]);

  // 3. Fetch Paged Reviews
  const loadReviews = useCallback(
    async (pageToLoad = 0, isAppend = false) => {
      if (!productId) return;
      setReviewsLoading(true);
      try {
        const res = await reviewService.getReviewsPaged(productId, {
          page: pageToLoad,
          size: 5,
          rating: selectedRatingFilter,
          sort: selectedSort,
        });

        if (isAppend) {
          setReviewsList((prev) => [...prev, ...res.content]);
        } else {
          setReviewsList(res.content);
        }
        setCurrentPage(res.number);
        setIsLastPage(res.last);
      } catch {
        if (!isAppend) setReviewsList([]);
      } finally {
        setReviewsLoading(false);
      }
    },
    [productId, selectedRatingFilter, selectedSort]
  );

  // Initial Load & re-load when filters change
  useEffect(() => {
    loadSummary();
    loadEligibility();
    loadReviews(0, false);
  }, [loadSummary, loadEligibility, loadReviews]);

  // Auto-scroll to review form if orderItemId provided in query
  useEffect(() => {
    if (queryOrderItemId && formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [queryOrderItemId, eligibility]);

  // Handle Likes
  const handleToggleLike = (id: string | number, defaultLikes = 0) => {
    const key = String(id);
    const isLiked = likedUserMap[key];
    const currentLikes = likesMap[key] ?? defaultLikes;

    if (isLiked) {
      setLikedUserMap((prev) => ({ ...prev, [key]: false }));
      setLikesMap((prev) => ({ ...prev, [key]: currentLikes - 1 }));
    } else {
      setLikedUserMap((prev) => ({ ...prev, [key]: true }));
      setLikesMap((prev) => ({ ...prev, [key]: currentLikes + 1 }));
    }
  };

  // Star keyboard navigation helper
  const handleStarKeyDown = (
    e: React.KeyboardEvent,
    currentVal: number,
    setter: (val: number) => void
  ) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setter(Math.min(5, currentVal + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setter(Math.max(1, currentVal - 1));
    }
  };

  // Submit New Review
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || createSubmitting) return;

    // Client-side validations
    const errors: Record<string, string> = {};
    if (!createRating || createRating < 1 || createRating > 5) {
      errors.rating = 'Vui lòng chọn số sao từ 1 đến 5.';
    }
    const trimmedComment = createComment.trim();
    if (!trimmedComment) {
      errors.comment = 'Nội dung nhận xét không được để trống.';
    } else if (trimmedComment.length > 500) {
      errors.comment = 'Nội dung nhận xét không được vượt quá 500 ký tự.';
    }

    const orderIdToSubmit =
      selectedOrderItemId ||
      (eligibility?.eligibleOrderItemIds && eligibility.eligibleOrderItemIds[0]) ||
      null;

    if (!orderIdToSubmit) {
      errors.orderItemId = 'Vui lòng chọn chi tiết đơn hàng đã mua để đánh giá.';
    }

    if (Object.keys(errors).length > 0) {
      setCreateFieldErrors(errors);
      return;
    }

    setCreateSubmitting(true);
    setCreateFieldErrors({});
    setCreateGeneralError(null);

    try {
      await reviewService.createReview(productId, {
        rating: createRating,
        comment: trimmedComment,
        orderItemId: orderIdToSubmit as number,
      });

      setCreateSuccessMsg('Cảm ơn bạn đã gửi đánh giá thành công!');
      setCreateComment('');
      setTimeout(() => setCreateSuccessMsg(null), 4000);

      // Refresh all after submission
      await Promise.all([loadSummary(), loadEligibility(), loadReviews(0, false)]);
    } catch (err: unknown) {
      const errResp = (
        err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string> } } }
      )?.response;

      if (errResp?.data?.errors && Object.keys(errResp.data.errors).length > 0) {
        setCreateFieldErrors(errResp.data.errors);
      }
      const msg =
        errResp?.data?.message ||
        (errResp?.status === 401
          ? 'Vui lòng đăng nhập để đánh giá sản phẩm.'
          : errResp?.status === 403
          ? 'Bạn không có quyền đánh giá sản phẩm này.'
          : errResp?.status === 409
          ? 'Bạn đã đánh giá sản phẩm này rồi.'
          : 'Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.');
      setCreateGeneralError(msg);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Update Review (Edit Mode)
  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeReview = eligibility?.review || eligibility?.myReview;
    if (!activeReview || editSubmitting) return;

    // Client-side validations
    const errors: Record<string, string> = {};
    if (!editRating || editRating < 1 || editRating > 5) {
      errors.rating = 'Số sao phải từ 1 đến 5.';
    }
    const trimmed = editComment.trim();
    if (!trimmed) {
      errors.comment = 'Nội dung nhận xét không được để trống.';
    } else if (trimmed.length > 500) {
      errors.comment = 'Nội dung nhận xét không được vượt quá 500 ký tự.';
    }

    if (Object.keys(errors).length > 0) {
      setEditFieldErrors(errors);
      return;
    }

    setEditSubmitting(true);
    setEditFieldErrors({});
    setEditGeneralError(null);

    try {
      await reviewService.updateReview(activeReview.reviewId, {
        rating: editRating,
        comment: trimmed,
      });

      setIsEditing(false);
      await Promise.all([loadSummary(), loadEligibility(), loadReviews(0, false)]);
    } catch (err: unknown) {
      const errResp = (
        err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string> } } }
      )?.response;
      if (errResp?.data?.errors) {
        setEditFieldErrors(errResp.data.errors);
      }
      setEditGeneralError(errResp?.data?.message || 'Không thể cập nhật đánh giá.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async () => {
    const activeReview = eligibility?.review || eligibility?.myReview;
    if (!activeReview || deleteSubmitting) return;

    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đánh giá này không?')) return;

    setDeleteSubmitting(true);
    try {
      await reviewService.deleteReview(activeReview.reviewId);
      await Promise.all([loadSummary(), loadEligibility(), loadReviews(0, false)]);
    } catch (err: unknown) {
      const errResp = (err as { response?: { data?: { message?: string } } })?.response;
      alert(errResp?.data?.message || 'Không thể xóa đánh giá.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // 6. Helpful Vote
  const handleVoteHelpful = async (reviewId: number) => {
    try {
      const res = await reviewService.voteHelpful(reviewId);
      setReviewsList((prev) =>
        prev.map((r) =>
          r.reviewId === reviewId
            ? { ...r, helpfulCount: res.helpfulCount, isHelpful: true }
            : r
        )
      );
    } catch (err: unknown) {
      const errResp = (
        err as { response?: { status?: number; data?: { message?: string } } }
      )?.response;
      if (errResp?.status === 401) {
        alert('Vui lòng đăng nhập để bình chọn hữu ích.');
      } else {
        alert(errResp?.data?.message || 'Không thể thực hiện bình chọn.');
      }
    }
  };

  // Compute breakdown bar percentages
  const totalInSummary = summary.totalReviews || 0;
  const breakdownRows = [5, 4, 3, 2, 1].map((star) => {
    const count = summary.ratingBreakdown?.[star] ?? summary.ratingBreakdown?.[String(star)] ?? 0;
    const pct = totalInSummary > 0 ? Math.round((count / totalInSummary) * 100) : 0;
    return { star, count, pct };
  });

  const activeMyReview = eligibility?.review || eligibility?.myReview;

  return (
    <div id="product-reviews-section" className={styles.reviewsSection} ref={formSectionRef}>
      <h3 className={styles.sectionTitle}>
        <span>Đánh giá & Nhận xét</span>
      </h3>

      {/* Overview Card: Score & Breakdown (strictly from API summary) */}
      <div className={styles.overviewBox}>
        <div className={styles.scoreCol}>
          <div className={styles.bigScore}>
            {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : '0'}/5
          </div>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                className={s <= Math.round(summary.averageRating) ? styles.starFilled : styles.starEmpty}
              />
            ))}
          </div>
          <div className={styles.totalReviewsCount}>
            {summary.totalReviews > 0
              ? `${summary.totalReviews} lượt đánh giá thực tế`
              : 'Chưa có đánh giá thực tế'}
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className={styles.breakdownCol}>
          {breakdownRows.map((bar) => (
            <div key={bar.star} className={styles.barRow}>
              <span className={styles.barLabel}>{bar.star} ★</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${bar.pct}%` }} />
              </div>
              <span className={styles.barCount}>{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 5 TRẠNG THÁI ELIGIBILITY & FORM ═══ */}
      {eligibilityLoading ? (
        <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          <Loader2 size={16} className="animate-spin" style={{ display: 'inline', marginRight: 6 }} />
          Đang kiểm tra điều kiện đánh giá...
        </div>
      ) : eligibility?.status === 'NOT_LOGGED_IN' ? (
        /* TRẠNG THÁI 1: CHƯA ĐĂNG NHẬP */
        <div className={`${styles.eligibilityNotice} ${styles.noticeInfo}`}>
          <div>
            <strong>Đăng nhập để đánh giá</strong>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>
              Vui lòng đăng nhập với tài khoản khách hàng để chia sẻ trải nghiệm sản phẩm của bạn.
            </p>
          </div>
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname || '/')}`}
            className={styles.loginPromptBtn}
          >
            <LogIn size={14} />
            <span>Đăng nhập</span>
          </Link>
        </div>
      ) : eligibility?.status === 'STAFF_ACCOUNT' ? (
        /* TRẠNG THÁI 2: TÀI KHOẢN QUẢN TRỊ */
        <div className={`${styles.eligibilityNotice} ${styles.noticeWarning}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>Tài khoản quản trị không thể tham gia đánh giá sản phẩm.</span>
          </div>
        </div>
      ) : eligibility?.status === 'NOT_PURCHASED' ? (
        /* TRẠNG THÁI 3: CHƯA MUA / CHƯA NHẬN HÀNG */
        <div className={`${styles.eligibilityNotice} ${styles.noticeInfo}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>
              {eligibility.message ||
                'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công.'}
            </span>
          </div>
        </div>
      ) : eligibility?.status === 'ALREADY_REVIEWED' && activeMyReview ? (
        /* TRẠNG THÁI 4: ĐÃ ĐÁNH GIÁ (HIỆN THẺ REVIEW CỦA MÌNH + SỬA/XÓA) */
        <div className={styles.myReviewCard}>
          <div className={styles.myReviewHeader}>
            <div className={styles.myReviewTitle}>
              <Check size={16} />
              <span>Đánh giá của bạn</span>
            </div>
            {!isEditing && (
              <div className={styles.myReviewActions}>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => {
                    setIsEditing(true);
                    setEditRating(activeMyReview.rating);
                    setEditComment(activeMyReview.comment);
                  }}
                >
                  <Edit2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Sửa
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={handleDeleteReview}
                  disabled={deleteSubmitting}
                >
                  <Trash2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {deleteSubmitting ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            /* Xem review của mình */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 8px' }}>
                <div className={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= activeMyReview.rating ? styles.starFilled : styles.starEmpty}
                    />
                  ))}
                </div>
                <span className={styles.reviewDate}>
                  {activeMyReview.createdAt
                    ? new Date(activeMyReview.createdAt).toLocaleDateString('vi-VN')
                    : 'Gần đây'}
                </span>
                <span className={styles.verifiedBadge}>
                  <CheckCircle size={11} />
                  <span>✓ Đã mua hàng tại Store</span>
                </span>
              </div>
              <p className={styles.commentContent} style={{ color: '#14532d' }}>
                {activeMyReview.comment}
              </p>
            </div>
          ) : (
            /* Form chỉnh sửa review của mình */
            <form onSubmit={handleUpdateReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className={styles.starRatingSelect}>
                <span className={styles.rateLabel}>Chỉnh sửa số sao:</span>
                <div
                  className={styles.starsPicker}
                  tabIndex={0}
                  role="radiogroup"
                  aria-label="Đánh giá sao"
                  onKeyDown={(e) => handleStarKeyDown(e, editRating, setEditRating)}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-label={`${s} sao`}
                      className={styles.starPickBtn}
                      onClick={() => setEditRating(s)}
                    >
                      <Star
                        size={20}
                        className={s <= editRating ? styles.starFilled : styles.starEmpty}
                      />
                    </button>
                  ))}
                  <span className={styles.ratingTextDesc}>{editRating} sao</span>
                </div>
              </div>
              {editFieldErrors.rating && <div className={styles.fieldErrorMsg}>{editFieldErrors.rating}</div>}

              <div className={styles.formInputs}>
                <textarea
                  className={styles.commentInput}
                  rows={3}
                  maxLength={500}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Cập nhật cảm nhận của bạn (tối đa 500 ký tự)..."
                />
                <div className={styles.charCounter}>{editComment.length}/500</div>
                {editFieldErrors.comment && <div className={styles.fieldErrorMsg}>{editFieldErrors.comment}</div>}
              </div>

              {editGeneralError && <div className={styles.fieldErrorMsg}>{editGeneralError}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className={styles.secondaryBtn || styles.starFilterBtn}
                  onClick={() => setIsEditing(false)}
                  disabled={editSubmitting}
                >
                  <X size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Hủy
                </button>
                <button type="submit" className={styles.submitBtn} disabled={editSubmitting}>
                  <Check size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {editSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : eligibility?.status === 'ELIGIBLE' ? (
        /* TRẠNG THÁI 5: ĐỦ ĐIỀU KIỆN (HIỂN THỊ FORM ĐÁNH GIÁ) */
        <form className={styles.reviewForm} onSubmit={handleCreateReview}>
          <div className={styles.formHeader}>
            <MessageSquarePlus size={16} className={styles.formIcon} />
            <h4 className={styles.formTitle}>Gửi đánh giá trải nghiệm của bạn</h4>
          </div>

          {/* Star Picker with Keyboard Navigation & aria-label */}
          <div className={styles.starRatingSelect}>
            <span className={styles.rateLabel}>Bạn đánh giá máy mấy sao?</span>
            <div
              className={styles.starsPicker}
              tabIndex={0}
              role="radiogroup"
              aria-label="Chọn số sao đánh giá"
              onKeyDown={(e) => handleStarKeyDown(e, createRating, setCreateRating)}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-label={`${s} sao`}
                  className={styles.starPickBtn}
                  onClick={() => setCreateRating(s)}
                >
                  <Star
                    size={20}
                    className={s <= createRating ? styles.starFilled : styles.starEmpty}
                  />
                </button>
              ))}
              <span className={styles.ratingTextDesc}>
                {createRating === 5
                  ? 'Tuyệt vời'
                  : createRating === 4
                  ? 'Hài lòng'
                  : createRating === 3
                  ? 'Bình thường'
                  : createRating === 2
                  ? 'Không hài lòng'
                  : 'Rất tệ'}
              </span>
            </div>
          </div>
          {createFieldErrors.rating && <div className={styles.fieldErrorMsg}>{createFieldErrors.rating}</div>}

          {/* Comment Textarea with Character Counter */}
          <div className={styles.formInputs}>
            <textarea
              className={styles.commentInput}
              placeholder="Xin mời chia sẻ một số cảm nhận về thiết bị này (tối đa 500 ký tự)..."
              rows={3}
              maxLength={500}
              value={createComment}
              onChange={(e) => setCreateComment(e.target.value)}
            />
            <div className={styles.charCounter}>{createComment.length}/500</div>
            {createFieldErrors.comment && (
              <div className={styles.fieldErrorMsg}>{createFieldErrors.comment}</div>
            )}
            {createFieldErrors.orderItemId && (
              <div className={styles.fieldErrorMsg}>{createFieldErrors.orderItemId}</div>
            )}
          </div>

          {createGeneralError && (
            <div className={styles.fieldErrorMsg} style={{ marginTop: 4 }}>
              ⚠️ {createGeneralError}
            </div>
          )}

          <div className={styles.formSubmitRow}>
            {createSuccessMsg && <span className={styles.successMsg}>✓ {createSuccessMsg}</span>}
            <button
              type="submit"
              disabled={createSubmitting}
              className={styles.submitBtn}
            >
              <Send size={14} />
              <span>{createSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}</span>
            </button>
          </div>
        </form>
      ) : null}

      {/* ═══ BỘ LỌC SAO & SẮP XẾP ═══ */}
      <div className={styles.filterControlsRow}>
        <div className={styles.starFilterTabs}>
          <button
            type="button"
            className={`${styles.starFilterBtn} ${selectedRatingFilter === undefined ? styles.starFilterBtnActive : ''}`}
            onClick={() => setSelectedRatingFilter(undefined)}
          >
            Tất cả ({summary.totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = summary.ratingBreakdown?.[s] ?? summary.ratingBreakdown?.[String(s)] ?? 0;
            return (
              <button
                key={s}
                type="button"
                className={`${styles.starFilterBtn} ${selectedRatingFilter === s ? styles.starFilterBtnActive : ''}`}
                onClick={() => setSelectedRatingFilter(s)}
              >
                {s} sao ({count})
              </button>
            );
          })}
        </div>

        <div>
          <select
            className={styles.sortSelect}
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as 'newest' | 'highest' | 'lowest')}
          >
            <option value="newest">Mới nhất</option>
            <option value="highest">Đánh giá cao nhất</option>
            <option value="lowest">Đánh giá thấp nhất</option>
          </select>
        </div>
      </div>

      {/* ═══ DANH SÁCH ĐÁNH GIÁ ═══ */}
      <div className={styles.reviewsList}>
        {reviewsLoading && reviewsList.length === 0 ? (
          /* Skeleton Loader */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map((sk) => (
              <div key={sk} className={styles.skeletonItem}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className={styles.skeletonLine} style={{ width: '30%' }} />
                    <div className={styles.skeletonLine} style={{ width: '15%' }} />
                  </div>
                </div>
                <div className={styles.skeletonLine} style={{ width: '85%' }} />
              </div>
            ))}
          </div>
        ) : reviewsList.length === 0 ? (
          /* Empty State */
          <div className={styles.emptyReviews}>
            Chưa có đánh giá nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          reviewsList.map((rev) => {
            const currentLikes = likesMap[String(rev.reviewId)] ?? 0;
            const isLiked = likedUserMap[String(rev.reviewId)];

            return (
              <div key={rev.reviewId} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.authorInfo}>
                    <div className={styles.avatarCircle}>
                      {(rev.customerName || 'K').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.authorNameRow}>
                        <span className={styles.authorName}>{rev.customerName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className={styles.verifiedBadge}>
                            <CheckCircle size={12} />
                            <span>✓ Đã mua hàng tại Store</span>
                          </span>
                        )}
                      </div>
                      <span className={styles.reviewDate}>
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString('vi-VN')
                          : 'Gần đây'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= rev.rating ? styles.starFilled : styles.starEmpty}
                      />
                    ))}
                  </div>
                </div>

                <p className={styles.commentContent}>{rev.comment}</p>

                {/* Phản hồi từ shop (nếu có) */}
                {rev.reply && (
                  <div className={styles.replyBox}>
                    <div className={styles.replyHeader}>
                      <span className={styles.replyBadge}>Phản hồi từ shop</span>
                      <span className={styles.replyStaffName}>{rev.reply.staffName || 'Quản trị viên'}</span>
                      <span className={styles.replyDate}>
                        {rev.reply.createdAt ? new Date(rev.reply.createdAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                    <p className={styles.replyContent}>{rev.reply.comment}</p>
                  </div>
                )}

                <div className={styles.reviewFooter}>
                  <button
                    type="button"
                    className={`${styles.likeBtn} ${rev.isHelpful ? styles.activeLike : ''}`}
                    onClick={() => handleVoteHelpful(rev.reviewId)}
                    title="Bình chọn đánh giá này hữu ích"
                  >
                    <ThumbsUp size={13} />
                    <span>Hữu ích ({rev.helpfulCount ?? 0})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Nút Xem Thêm / Phân Trang */}
        {!isLastPage && (
          <button
            type="button"
            className={styles.loadMoreBtn}
            onClick={() => loadReviews(currentPage + 1, true)}
            disabled={reviewsLoading}
          >
            {reviewsLoading ? 'Đang tải thêm...' : 'Xem thêm đánh giá'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
