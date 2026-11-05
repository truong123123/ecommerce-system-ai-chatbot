import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Banner } from '../../../types/showcase';
import styles from '../WatchAudioShowcase.module.css';

interface BannerPosterProps {
  banner: Banner;
  priority?: boolean;
}

export const BannerPoster: React.FC<BannerPosterProps> = ({ banner, priority = false }) => {
  const isCustomGraphic = Boolean(banner.imageUrl && !banner.imageUrl.includes('placeholder'));
  return (
    <Link
      href={banner.targetLink}
      className={styles.posterCard}
      title={banner.title}
    >
      <div className={styles.posterImageWrapper}>
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          unoptimized={Boolean(banner.imageUrl && banner.imageUrl.startsWith('http'))}
          sizes="(max-width: 1024px) 50vw, 250px"
          priority={priority}
          className={styles.posterImage}
        />
        {!isCustomGraphic && (
          <div className={styles.posterOverlay}>
            <span className={styles.posterBadge}>{banner.badgeText}</span>
            <h3 className={styles.posterTitle}>{banner.title}</h3>
            <span className={styles.posterBtn}>MUA NGAY &gt;</span>
          </div>
        )}
      </div>
    </Link>
  );
};
