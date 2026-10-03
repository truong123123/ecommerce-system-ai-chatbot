'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquarePlus, Send } from 'lucide-react';
import { ProductReviewItem, ReviewBreakdown } from '../../types/productDetail';
import styles from './ProductReviews.module.css';

interface ProductReviewsProps {
  reviews: ProductReviewItem[];
  overallRating: number;
  totalReviews: number;
  reviewBreakdown?: ReviewBreakdown;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  reviews: initialReviews,
  overallRating,
  totalReviews,
  reviewBreakdown
}) => {
  const [reviewsList, setReviewsList] = useState<ProductReviewItem[]>(initialReviews);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedUserMap, setLikedUserMap] = useState<Record<string, boolean>>({});

  // Review submission state
  const [authorName, setAuthorName] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const breakdownData = [
    { star: 5, pct: reviewBreakdown?.star5Pct ?? 0, count: reviewBreakdown?.star5Count ?? 0 },
    { star: 4, pct: reviewBreakdown?.star4Pct ?? 0, count: reviewBreakdown?.star4Count ?? 0 },
    { star: 3, pct: reviewBreakdown?.star3Pct ?? 0, count: reviewBreakdown?.star3Count ?? 0 },
    { star: 2, pct: reviewBreakdown?.star2Pct ?? 0, count: reviewBreakdown?.star2Count ?? 0 },
    { star: 1, pct: reviewBreakdown?.star1Pct ?? 0, count: reviewBreakdown?.star1Count ?? 0 }
  ];

  const handleToggleLike = (id: string, defaultLikes: number) => {
    const isLiked = likedUserMap[id];
    const currentLikes = likesMap[id] ?? defaultLikes;

    if (isLiked) {
      setLikedUserMap({ ...likedUserMap, [id]: false });
      setLikesMap({ ...likesMap, [id]: currentLikes - 1 });
    } else {
      setLikedUserMap({ ...likedUserMap, [id]: true });
      setLikesMap({ ...likesMap, [id]: currentLikes + 1 });
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentText.trim()) return;

    const newRev: ProductReviewItem = {
      id: `rev-${Date.now()}`,
      author: authorName,
      rating: ratingVal,
      date: 'Vừa xong',
      isVerified: true,
      comment: commentText,
      likes: 0
    };

    setReviewsList([newRev, ...reviewsList]);
    setAuthorName('');
    setCommentText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div id="product-reviews-section" className={styles.reviewsSection}>
      <h3 className={styles.sectionTitle}>
        <span>Đánh giá & Nhận xét</span>
      </h3>

      {/* Overview Card */}
      <div className={styles.overviewBox}>
        <div className={styles.scoreCol}>
          <div className={styles.bigScore}>{overallRating > 0 ? overallRating.toFixed(1) : '0'}/5</div>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                className={s <= Math.round(overallRating) ? styles.starFilled : styles.starEmpty}
              />
            ))}
          </div>
          <div className={styles.totalReviewsCount}>
            {totalReviews > 0 ? `${totalReviews} lượt đánh giá thực tế` : 'Chưa có đánh giá thực tế'}
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className={styles.breakdownCol}>
          {breakdownData.map((bar) => (
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

      {/* Review Submission Form */}
      <form className={styles.reviewForm} onSubmit={handleAddReview}>
        <div className={styles.formHeader}>
          <MessageSquarePlus size={16} className={styles.formIcon} />
          <h4 className={styles.formTitle}>Gửi đánh giá hoặc câu hỏi của bạn</h4>
        </div>

        <div className={styles.starRatingSelect}>
          <span className={styles.rateLabel}>Bạn đánh giá máy mấy sao?</span>
          <div className={styles.starsPicker}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                className={styles.starPickBtn}
                onClick={() => setRatingVal(s)}
              >
                <Star
                  size={20}
                  className={s <= ratingVal ? styles.starFilled : styles.starEmpty}
                />
              </button>
            ))}
            <span className={styles.ratingTextDesc}>
              {ratingVal === 5 ? 'Tuyệt vời' : ratingVal === 4 ? 'Hài lòng' : 'Bình thường'}
            </span>
          </div>
        </div>

        <div className={styles.formInputs}>
          <input
            type="text"
            className={styles.nameInput}
            placeholder="Họ và tên của bạn *"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
          <textarea
            className={styles.commentInput}
            placeholder="Xin mời chia sẻ một số cảm nhận về thiết bị này..."
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
          />
        </div>

        <div className={styles.formSubmitRow}>
          {submitted && <span className={styles.successMsg}>✓ Cảm ơn bạn đã gửi đánh giá!</span>}
          <button type="submit" className={styles.submitBtn}>
            <Send size={14} />
            <span>Gửi đánh giá</span>
          </button>
        </div>
      </form>

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {reviewsList.length === 0 ? (
          <div className={styles.emptyReviews}>
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận của bạn!
          </div>
        ) : (
          reviewsList.map((rev) => {
          const currentLikes = likesMap[rev.id] ?? rev.likes;
          const isLiked = likedUserMap[rev.id];

          return (
            <div key={rev.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.authorInfo}>
                  <div className={styles.avatarCircle}>
                    {rev.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.authorNameRow}>
                      <span className={styles.authorName}>{rev.author}</span>
                      {rev.isVerified && (
                        <span className={styles.verifiedBadge}>
                          <CheckCircle size={12} />
                          <span>Đã mua tại cửa hàng</span>
                        </span>
                      )}
                    </div>
                    <span className={styles.reviewDate}>{rev.date}</span>
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

              <div className={styles.reviewFooter}>
                <button
                  type="button"
                  className={`${styles.likeBtn} ${isLiked ? styles.activeLike : ''}`}
                  onClick={() => handleToggleLike(rev.id, rev.likes)}
                >
                  <ThumbsUp size={13} />
                  <span>Hữu ích ({currentLikes})</span>
                </button>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
