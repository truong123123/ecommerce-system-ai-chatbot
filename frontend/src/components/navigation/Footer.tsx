'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Clock, 
  Headphones, 
  HelpCircle, 
  FileText, 
  Settings, 
  ExternalLink 
} from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footerWrapper} aria-label="TruongStore Footer">
      <div className={styles.footerContainer}>
        {/* Main 5-Column Grid */}
        <div className={styles.mainGrid}>
          {/* CỘT 1: LOGO + KẾT NỐI VỚI CHÚNG TÔI */}
          <div className={styles.col}>
            {/* Logo TruongStore */}
            <Link href="/" className={styles.footerLogo} aria-label="TruongStore Trang chủ">
              <div className={styles.logoIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#ffffff" />
                  <path d="M2 17L12 22L22 17" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.logoTextWrap}>
                <div className={styles.brandTitle}>
                  TRUONG<span>STORE</span>
                </div>
                <div className={styles.brandDomain}>TRUONGSTORE.VN</div>
              </div>
            </Link>

            {/* Kết nối với chúng tôi */}
            <div className={styles.connectBlock}>
              <h3 className={styles.colHeading}>KẾT NỐI VỚI CHÚNG TÔI</h3>
              <div className={styles.socialIconsRow}>
                {/* Facebook */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialBtn}
                  aria-label="Facebook TruongStore"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialBtn}
                  aria-label="TikTok TruongStore"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.58c.02 1.88-.47 3.8-1.58 5.31-1.39 1.87-3.6 3.03-5.91 3.06-2.6.08-5.18-1.07-6.81-3.05-1.68-2.02-2.34-4.78-1.8-7.39.52-2.5 2.15-4.69 4.39-5.83 1.55-.8 3.32-1.12 5.06-.93v4.13c-.93-.24-1.95-.21-2.84.14-.99.37-1.8 1.16-2.21 2.12-.51 1.13-.47 2.48.1 3.56.54 1.01 1.55 1.73 2.68 1.95 1.14.24 2.37-.02 3.31-.72.84-.63 1.34-1.63 1.37-2.68.03-3.67.01-7.34.02-11.01z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialBtn}
                  aria-label="YouTube TruongStore"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Instagram / Community */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialBtn}
                  aria-label="Instagram TruongStore"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* CỘT 2: TỔNG ĐÀI HỖ TRỢ (8:00 - 21:00) */}
          <div className={styles.col}>
            <h3 className={styles.colHeading}>TỔNG ĐÀI HỖ TRỢ (8:00 - 21:00)</h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Tư vấn mua hàng</span>
                <a href="tel:19005301" className={styles.contactHotline}>1900.5301</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Hỗ trợ kỹ thuật, bảo hành</span>
                <a href="tel:19005325" className={styles.contactHotline}>1900.5325</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Góp ý, khiếu nại</span>
                <a href="tel:18006173" className={styles.contactHotline}>1800.6173</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Email</span>
                <a href="mailto:cskh@truongstore.vn" className={styles.contactEmail}>cskh@truongstore.vn</a>
              </li>
            </ul>
          </div>

          {/* CỘT 3: VỀ TRUONGSTORE & CHÍNH SÁCH */}
          <div className={styles.col}>
            {/* Về TruongStore */}
            <div className={styles.navGroup}>
              <h3 className={styles.colHeading}>VỀ TRUONGSTORE</h3>
              <ul className={styles.linksList}>
                <li><Link href="/about" className={styles.footerLink}>Giới thiệu</Link></li>
                <li><Link href="/careers" className={styles.footerLink}>Tuyển dụng</Link></li>
                <li><Link href="/contact" className={styles.footerLink}>Liên hệ</Link></li>
              </ul>
            </div>

            {/* Chính sách */}
            <div className={styles.navGroup}>
              <h3 className={styles.colHeading}>CHÍNH SÁCH</h3>
              <ul className={styles.linksList}>
                <li><Link href="/legal/warranty" className={styles.footerLink}>Chính sách bảo hành</Link></li>
                <li><Link href="/legal/shipping" className={styles.footerLink}>Chính sách vận chuyển</Link></li>
                <li><Link href="/legal/privacy" className={styles.footerLink}>Chính sách bảo mật</Link></li>
                <li><Link href="/legal/cookies" className={styles.footerLink}>Cài đặt cookie</Link></li>
              </ul>
            </div>
          </div>

          {/* CỘT 4: THÔNG TIN */}
          <div className={styles.col}>
            <h3 className={styles.colHeading}>THÔNG TIN</h3>
            <ul className={styles.linksList}>
              <li><Link href="/stores" className={styles.footerLink}>Hệ thống cửa hàng</Link></li>
              <li><Link href="/help/buying-guide" className={styles.footerLink}>Hướng dẫn mua hàng</Link></li>
              <li><Link href="/help/payment-guide" className={styles.footerLink}>Hướng dẫn thanh toán</Link></li>
              <li><Link href="/help/installment" className={styles.footerLink}>Hướng dẫn trả góp</Link></li>
              <li><Link href="/warranty-lookup" className={styles.footerLink}>Tra cứu địa chỉ bảo hành</Link></li>
              <li><Link href="/build-pc" className={styles.footerLink}>Build PC</Link></li>
            </ul>
          </div>

          {/* CỘT 5: HỖ TRỢ THANH TOÁN & ĐƠN VỊ VẬN CHUYỂN */}
          <div className={styles.col}>
            {/* Hỗ trợ thanh toán */}
            <div className={styles.navGroup}>
              <h3 className={styles.colHeading}>HỖ TRỢ THANH TOÁN</h3>
              <div className={styles.badgeGrid}>
                {/* VNPAY */}
                <div className={`${styles.badgeItem} ${styles.badgeVnpay}`} title="VNPay QR">
                  <span className={styles.vnpayV}>VN</span><span className={styles.vnpayP}>PAY</span>
                </div>
                {/* JCB */}
                <div className={`${styles.badgeItem} ${styles.badgeJcb}`} title="JCB">
                  <span className={styles.jcbText}>JCB</span>
                </div>
                {/* MasterCard */}
                <div className={`${styles.badgeItem} ${styles.badgeMastercard}`} title="MasterCard">
                  <span className={styles.mcCircle1}></span>
                  <span className={styles.mcCircle2}></span>
                </div>
                {/* ZaloPay */}
                <div className={`${styles.badgeItem} ${styles.badgeZalo}`} title="ZaloPay">
                  <span>Zalo<small>Pay</small></span>
                </div>
                {/* Tiền mặt */}
                <div className={`${styles.badgeItem} ${styles.badgeCash}`} title="Tiền mặt tại cửa hàng / COD">
                  <span>Tiền mặt</span>
                </div>
                {/* Trả góp 0% */}
                <div className={`${styles.badgeItem} ${styles.badgeInstallment}`} title="Trả góp 0%">
                  <span>0%</span>
                </div>
                {/* VISA */}
                <div className={`${styles.badgeItem} ${styles.badgeVisa}`} title="VISA">
                  <span>VISA</span>
                </div>
                {/* MoMo */}
                <div className={`${styles.badgeItem} ${styles.badgeMomo}`} title="MoMo">
                  <span>MoMo</span>
                </div>
              </div>
            </div>

            {/* Đơn vị vận chuyển */}
            <div className={styles.navGroup}>
              <h3 className={styles.colHeading}>ĐƠN VỊ VẬN CHUYỂN</h3>
              <div className={styles.badgeGrid}>
                {/* GHN */}
                <div className={`${styles.badgeItem} ${styles.badgeGhn}`} title="Giao Hàng Nhanh (GHN)">
                  <span style={{ color: '#ea580c', fontWeight: 800 }}>GHN</span>
                </div>
                {/* EMS */}
                <div className={`${styles.badgeItem} ${styles.badgeEms}`} title="Bưu điện EMS">
                  <span style={{ color: '#0284c7', fontWeight: 800 }}>EMS</span>
                </div>
                {/* GVN Express */}
                <div className={`${styles.badgeItem} ${styles.badgeGvn}`} title="GVN Express">
                  <span style={{ color: '#dc2626', fontWeight: 900 }}>GVN</span>
                </div>
                {/* ViettelPost */}
                <div className={`${styles.badgeItem} ${styles.badgeViettel}`} title="Viettel Post">
                  <span style={{ color: '#b91c1c', fontWeight: 800 }}>Viettel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & LEGAL BAR */}
        <div className={styles.bottomLegalBar}>
          <div className={styles.legalInfoText}>
            <p className={styles.companyInfo}>
              Công ty TNHH Thương Mại <strong>TruongStore</strong>, địa chỉ: 82 Hoàng Hoa Thám, Phường Bảy Hiền, Thành phố Hồ Chí Minh.
              MST/GCN ĐKDN số: <strong>0316517394</strong>, đăng ký lần đầu: ngày 01/10/2020.
              Đại diện pháp luật: <strong>Nguyễn Thế Trường</strong>.
            </p>
          </div>

          {/* Dấu xác nhận Đã Thông Báo Bộ Công Thương (Chuẩn trong ảnh đính kèm) */}
          <div className={styles.boCongThuongSeal} title="Website Thương mại điện tử đã thông báo với Bộ Công Thương">
            <div className={styles.sealBadge}>
              <div className={styles.sealCheckCircle}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#0099ff" strokeWidth="2.4" fill="none" />
                  <path d="M7 12.5L10.5 16L17 9" stroke="#0099ff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.sealTextWrap}>
                <span className={styles.sealTitle}>ĐÃ THÔNG BÁO</span>
                <span className={styles.sealSub}>BỘ CÔNG THƯƠNG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
