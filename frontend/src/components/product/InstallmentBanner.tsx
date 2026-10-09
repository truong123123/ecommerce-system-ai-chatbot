'use client';

import styles from './InstallmentBanner.module.css';

export const InstallmentBanner: React.FC = () => {
  return (
    <div className={styles.bannerContainer}>
      <div className={styles.leftContent}>
        <div className={styles.mainTitle}>
          <span>CHỌN TRẢ GÓP 0%</span>
        </div>
        <div className={styles.subTitle}>
          <span>Trả Trước 0đ</span>
          <span className={styles.divider}>|</span>
          <span>Phụ phí 0đ</span>
        </div>
      </div>

      <div className={styles.rightLogos}>
        <div className={styles.cardLogo} title="Visa">
          <span className={styles.visaText}>VISA</span>
        </div>
        <div className={styles.cardLogo} title="Mastercard">
          <div className={styles.masterCircles}>
            <div className={styles.circleRed} />
            <div className={styles.circleYellow} />
          </div>
        </div>
        <div className={styles.cardLogo} title="JCB">
          <span className={styles.jcbText}>JCB</span>
        </div>
      </div>
    </div>
  );
};
