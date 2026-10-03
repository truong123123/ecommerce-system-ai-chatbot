'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Sparkles, Box, Video } from 'lucide-react';
import styles from './ProductGallery.module.css';

interface GalleryImage {
  url: string;
  alt: string;
  type?: 'image' | 'video' | 'highlight';
  title?: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  badgeText?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName, badgeText }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  const activeImage = images[activeIndex] || images[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles.galleryWrapper}>
      {/* Main Image Display Box */}
      <div className={styles.mainImageBox}>
        {activeImage?.url ? (
          <img
            src={activeImage.url}
            alt={activeImage.alt || productName}
            className={styles.mainImage}
            onClick={() => setIsZoomModalOpen(true)}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '360px', color: '#94a3b8', gap: '8px' }}>
            <Box size={48} strokeWidth={1.5} />
            <span style={{ fontSize: '13px' }}>Đang cập nhật hình ảnh sản phẩm</span>
          </div>
        )}

        {/* Feature Badges overlaid */}
        <div className={styles.badgesOverlay}>
          <span className={styles.insideBadge}>
            <Sparkles size={13} />
            <span>{badgeText || 'Chính hãng 100%'}</span>
          </span>
          <span className={styles.videoBadge}>
            <Video size={13} />
            <span>Video Review</span>
          </span>
        </div>

        {/* Zoom trigger */}
        {activeImage?.url && (
          <button
            type="button"
            className={styles.zoomBtn}
            onClick={() => setIsZoomModalOpen(true)}
            title="Xem ảnh phóng to"
          >
            <Maximize2 size={16} />
          </button>
        )}

        {/* Prev / Next controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.prevBtn}`}
              onClick={handlePrev}
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.nextBtn}`}
              onClick={handleNext}
              aria-label="Ảnh sau"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      <div className={styles.thumbnailsContainer}>
        {/* Static Feature pill 1: Hàng mới */}
        <button
          type="button"
          className={`${styles.specialThumb} ${activeIndex === 0 ? styles.activeThumb : ''}`}
          onClick={() => setActiveIndex(0)}
          title="Hàng mới 100%"
        >
          <Box size={18} className={styles.specialIcon} />
          <span className={styles.thumbLabel}>Hàng mới</span>
        </button>

        {/* Static Feature pill 2: Điểm nổi bật */}
        <button
          type="button"
          className={`${styles.specialThumb} ${activeIndex === 1 ? styles.activeThumb : ''}`}
          onClick={() => setActiveIndex(1)}
          title="Điểm nổi bật"
        >
          <Sparkles size={18} className={styles.specialIcon} />
          <span className={styles.thumbLabel}>Điểm nổi bật</span>
        </button>

        {/* Real Product Images Thumbnails */}
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            className={`${styles.thumbBtn} ${activeIndex === idx ? styles.activeThumb : ''}`}
            onClick={() => setActiveIndex(idx)}
            title={img.title || `Ảnh ${idx + 1}`}
          >
            <img src={img.url} alt={img.alt} className={styles.thumbImage} />
          </button>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isZoomModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsZoomModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeModalBtn}
              onClick={() => setIsZoomModalOpen(false)}
            >
              ✕
            </button>
            <img
              src={activeImage?.url}
              alt={activeImage?.alt || productName}
              className={styles.modalImage}
            />
            <div className={styles.modalCaption}>
              {activeImage?.title || productName} ({activeIndex + 1}/{images.length})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
