'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

interface ColumnData {
  colId: string;
  sections: FooterSection[];
}

const FOOTER_COLUMNS: ColumnData[] = [
  {
    colId: 'col-1',
    sections: [
      {
        id: 'shop-learn',
        title: 'Mua Sắm Và Tìm Hiểu',
        links: [
          { label: 'Cửa Hàng', href: '/store' },
          { label: 'Mac', href: '/mac' },
          { label: 'iPad', href: '/ipad' },
          { label: 'iPhone', href: '/iphone' },
          { label: 'Watch', href: '/watch' },
          { label: 'AirPods', href: '/airpods' },
          { label: 'TV & Nhà', href: '/tv-home' },
          { label: 'AirTag', href: '/airtag' },
          { label: 'Phụ Kiện', href: '/accessories' },
          { label: 'Thẻ Quà Tặng', href: '/gift-cards' },
        ],
      },
      {
        id: 'apple-wallet',
        title: 'Ví Apple',
        links: [
          { label: 'Ví', href: '/wallet' },
          { label: 'Apple Pay', href: '/apple-pay' },
        ],
      },
    ],
  },
  {
    colId: 'col-2',
    sections: [
      {
        id: 'account',
        title: 'Tài Khoản',
        links: [
          { label: 'Quản Lý Tài Khoản Apple Của Bạn', href: '/account' },
          { label: 'Tài Khoản Apple Store', href: '/account' },
          { label: 'iCloud.com', href: 'https://www.icloud.com' },
        ],
      },
      {
        id: 'entertainment',
        title: 'Giải Trí',
        links: [
          { label: 'Apple TV+', href: '/entertainment' },
          { label: 'Apple Music', href: '/entertainment' },
          { label: 'Apple Arcade', href: '/entertainment' },
          { label: 'Apple Fitness+', href: '/entertainment' },
          { label: 'Apple Podcasts', href: '/entertainment' },
          { label: 'Apple Books', href: '/entertainment' },
          { label: 'App Store', href: '/entertainment' },
        ],
      },
    ],
  },
  {
    colId: 'col-3',
    sections: [
      {
        id: 'apple-store',
        title: 'Apple Store',
        links: [
          { label: 'Ứng Dụng Apple Store', href: '/store' },
          { label: 'Apple Trade In', href: '/trade-in' },
          { label: 'Tài Chính', href: '/financing' },
          { label: 'Tình Trạng Đơn Hàng', href: '/orders' },
          { label: 'Hỗ Trợ Mua Hàng', href: '/support' },
        ],
      },
    ],
  },
  {
    colId: 'col-4',
    sections: [
      {
        id: 'business',
        title: 'Dành Cho Doanh Nghiệp',
        links: [
          { label: 'Apple và Doanh Nghiệp', href: '/business' },
          { label: 'Mua Hàng Cho Doanh Nghiệp', href: '/business' },
        ],
      },
      {
        id: 'education',
        title: 'Cho Giáo Dục',
        links: [
          { label: 'Apple và Giáo Dục', href: '/education' },
          { label: 'Mua Hàng Cho Bậc Đại Học', href: '/education' },
        ],
      },
      {
        id: 'healthcare',
        title: 'Cho Chăm Sóc Sức Khỏe',
        links: [
          { label: 'Apple và Chăm Sóc Sức Khỏe', href: '/healthcare' },
        ],
      },
      {
        id: 'government',
        title: 'Cho Chính Phủ',
        links: [
          { label: 'Apple và Chính Phủ', href: '/government' },
        ],
      },
    ],
  },
  {
    colId: 'col-5',
    sections: [
      {
        id: 'values',
        title: 'Giá Trị Cốt Lõi Của Apple',
        links: [
          { label: 'Trợ Năng', href: '/values' },
          { label: 'Môi Trường', href: '/values' },
          { label: 'Quyền Riêng Tư', href: '/values' },
          { label: 'Đổi Mới Chuỗi Cung Ứng', href: '/values' },
        ],
      },
      {
        id: 'about',
        title: 'Về Apple',
        links: [
          { label: 'Newsroom', href: '/newsroom' },
          { label: 'Lãnh Đạo Của Apple', href: '/leadership' },
          { label: 'Cơ Hội Nghề Nghiệp', href: '/careers' },
          { label: 'Nhà Đầu Tư', href: '/investors' },
          { label: 'Đạo Đức & Quy Tắc', href: '/ethics' },
          { label: 'Sự Kiện', href: '/events' },
          { label: 'Liên Hệ Apple', href: '/contact' },
        ],
      },
    ],
  },
];

export const Footer: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <footer className={styles.footerWrapper} aria-label="Apple Footer">
      <div className={styles.footerContainer}>
        {/* Footnotes / Disclaimers */}
        <section className={styles.footnotesSection} aria-label="Footnotes">
          <p>
            * Từ ngày 16 tháng 7 năm 2026 đến ngày 24 tháng 9 năm 2026, Người Mua Đủ Điều Kiện có thể nhận được Ưu Đãi Tiết Kiệm khi mua một Sản Phẩm Đủ Điều Kiện và lựa chọn một Sản Phẩm Khuyến Mại tại Địa Điểm Thỏa Mãn Điều Kiện. Mỗi Người Mua Đủ Điều Kiện chỉ được mua một Sản Phẩm Khuyến Mại cùng với một Sản Phẩm Đủ Điều Kiện. Ưu đãi này tùy thuộc vào tình trạng hàng sẵn có. Ưu đãi này không chấp nhận một số phương thức thanh toán nhất định. Xem chi tiết ở trang thanh toán. Các điều khoản và điều kiện được nêu{' '}
            <Link href="/promotions" className={styles.footnotesLink}>
              tại đây
            </Link>{' '}
            áp dụng đối với ưu đãi này.
          </p>
          <p>Apple TV+ yêu cầu đăng ký thuê bao.</p>
          <p>Một số tính năng có thể thay đổi. Một số tính năng, ứng dụng và dịch vụ chỉ khả dụng ở một số khu vực hoặc ngôn ngữ.</p>
        </section>

        {/* Directory Grid */}
        <nav className={styles.directoryGrid} aria-label="Apple Directory">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.colId} className={styles.directoryCol}>
              {col.sections.map((section) => {
                const isOpen = !!openSections[section.id];
                return (
                  <div key={section.id} className={styles.directoryGroup}>
                    {/* Desktop Heading */}
                    <h3 className={styles.groupTitle}>{section.title}</h3>

                    {/* Mobile Accordion Toggle */}
                    <button
                      type="button"
                      className={styles.accordionHeader}
                      aria-expanded={isOpen}
                      onClick={() => toggleSection(section.id)}
                    >
                      <span>{section.title}</span>
                      <span className={styles.accordionIcon}>+</span>
                    </button>

                    {/* Links list */}
                    <ul className={`${styles.groupList} ${isOpen ? styles.open : ''}`}>
                      {section.links.map((link, idx) => (
                        <li key={idx} className={styles.groupItem}>
                          <Link href={link.href} className={styles.groupLink}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Shop Section */}
        <section className={styles.shopSection}>
          Xem thêm cách để mua hàng:{' '}
          <Link href="/stores" className={styles.shopLink}>
            Tìm cửa hàng bán lẻ
          </Link>{' '}
          gần bạn. Hoặc gọi{' '}
          <a href="tel:18001192" className={styles.shopLink}>
            1800 1192
          </a>
          .
        </section>

        {/* Bottom Legal Section */}
        <section className={styles.bottomSection}>
          <div className={styles.legalLeft}>
            <div className={styles.copyright}>
              Bản quyền © 2026 Apple Inc. Bảo lưu mọi quyền.
            </div>
            <ul className={styles.legalLinks}>
              <li className={styles.legalItem}>
                <Link href="/legal/privacy" className={styles.legalLink}>
                  Chính Sách Quyền Riêng Tư
                </Link>
              </li>
              <li className={styles.legalItem}>
                <Link href="/legal/terms" className={styles.legalLink}>
                  Điều Khoản Sử Dụng
                </Link>
              </li>
              <li className={styles.legalItem}>
                <Link href="/legal/sales-refund" className={styles.legalLink}>
                  Bán Hàng Và Hoàn Tiền
                </Link>
              </li>
              <li className={styles.legalItem}>
                <Link href="/legal" className={styles.legalLink}>
                  Pháp Lý
                </Link>
              </li>
              <li className={styles.legalItem}>
                <Link href="/sitemap" className={styles.legalLink}>
                  Bản Đồ Trang Web
                </Link>
              </li>
            </ul>
          </div>
          <div className={styles.localeSelector}>
            Việt Nam
          </div>
        </section>
      </div>
    </footer>
  );
};
