'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { FlashSaleCampaign } from '../../types/flashSale';
import { flashSaleService } from '../../services/flashSaleService';
import { dashboardService, DashboardOverview } from '../../services/dashboardService';

export default function AdminDashboardPage() {
  const [campaign, setCampaign] = useState<FlashSaleCampaign | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      flashSaleService.fetchCampaignFromApi(),
      dashboardService.fetchOverview(),
    ]).then(([campData, dashData]) => {
      setCampaign(campData);
      setOverview(dashData);
      setLoading(false);
    });
  }, []);

  const formatVnd = (num?: number) => {
    return (num || 0).toLocaleString('vi-VN') + 'đ';
  };

  const currentMonthRev = overview?.monthlyRevenue?.[0];
  const todayStats = overview?.today;

  // Các chỉ số phản ánh trạng thái thực tế từ PostgreSQL Views
  const kpiData = [
    {
      label: 'Doanh Thu Tháng (v_monthly_revenue)',
      value: formatVnd(currentMonthRev?.revenue),
      trend: currentMonthRev ? `Lợi nhuận gộp: ${formatVnd(currentMonthRev.gross_profit)}` : 'Đang cập nhật',
      isUp: true,
      icon: '💰',
    },
    {
      label: 'Đơn Hàng Hoàn Thành',
      value: `${currentMonthRev?.total_orders || 0} đơn`,
      trend: `${currentMonthRev?.total_customers || 0} khách hàng mua`,
      isUp: true,
      icon: '📦',
    },
    {
      label: 'Đơn Cần Xử Lý (v_pending_orders)',
      value: `${todayStats?.orders_to_handle || 0} đơn`,
      trend: `${overview?.pendingOrders?.length || 0} đơn trong danh sách chờ duyệt`,
      isUp: false,
      icon: '⏳',
    },
    {
      label: 'Cảnh Báo Hết Hàng (v_low_stock)',
      value: `${todayStats?.low_stock_items || 0} sản phẩm`,
      trend: todayStats?.low_stock_items ? 'Cần nhập hàng ngay' : 'Kho hàng an toàn',
      isUp: false,
      icon: '⚠️',
    },
  ];

  const recentOrders = overview?.recentOrders || [];
  const lowStockItems = overview?.lowStockItems || [];
  const pendingOrders = overview?.pendingOrders || [];
  const hasFlashSale = campaign && campaign.products && campaign.products.length > 0;

  return (
    <div className={styles.dashboardWrapper}>
      {/* Banner chào đón */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeText}>
          <h1>Xin chào, Quản trị viên! 👋</h1>
          <p>
            Hệ thống đang kết nối trực tiếp với <strong>PostgreSQL (LNT_Doantotnghiep)</strong> qua Spring Boot.
            {loading && ' Đang đồng bộ số liệu mới nhất...'}
          </p>
        </div>
      </div>

      {/* Thông báo chiến dịch Flash Sale */}
      <div className={styles.flashSaleAlertCard}>
        <div className={styles.flashSaleAlertInfo}>
          <div className={styles.flashIcon}>⚡</div>
          <div>
            <div className={styles.flashTitle}>
              {hasFlashSale
                ? `Chiến dịch: ${campaign?.title} (${campaign?.products.length} sản phẩm)`
                : 'Chưa có sản phẩm nào trong chiến dịch Flash Sale'}
            </div>
            <div className={styles.flashDesc}>
              {hasFlashSale
                ? 'Chiến dịch đang sẵn sàng. Dữ liệu đồng bộ trực tiếp với database flash_sale_campaign.'
                : 'Bạn hãy bấm vào Quản lý Flash Sale để thêm sản phẩm từ database.'}
            </div>
          </div>
        </div>

        <Link href="/admin/flash-sale" className={styles.manageFlashBtn}>
          👉 Vào Quản Lý Flash Sale
        </Link>
      </div>

      {/* Quản lý 3 Chuyên mục Trưng bày tương ứng với Trang Khách Hàng */}
      <div className={styles.showcaseNavSection}>
        <h2 className={styles.showcaseNavTitle}>
          <span>📑</span> Quản Lý 3 Chuyên Mục Trưng Bày (Tương ứng Trang Chủ)
        </h2>
        <div className={styles.showcaseNavGrid}>
          <Link href="/admin/category-showcase" className={styles.showcaseCard}>
            <div className={styles.showcaseCardTop}>
              <span className={styles.showcaseIcon}>📱</span>
              <span className={styles.showcaseArrow}>→</span>
            </div>
            <h3 className={styles.showcaseName}>Điện Thoại & Tablet</h3>
            <p className={styles.showcaseDesc}>
              Quản lý banner dọc, icon tính năng, và danh sách iPhone, Samsung Galaxy, iPad, tablet Android.
            </p>
          </Link>

          <Link href="/admin/laptop-showcase" className={styles.showcaseCard}>
            <div className={styles.showcaseCardTop}>
              <span className={styles.showcaseIcon}>💻</span>
              <span className={styles.showcaseArrow}>→</span>
            </div>
            <h3 className={styles.showcaseName}>Laptop & Máy Tính</h3>
            <p className={styles.showcaseDesc}>
              Quản lý banner dọc, filter văn phòng/gaming, và danh sách MacBook, Asus ROG/TUF, MSI, HP, Lenovo.
            </p>
          </Link>

          <Link href="/admin/watch-showcase" className={styles.showcaseCard}>
            <div className={styles.showcaseCardTop}>
              <span className={styles.showcaseIcon}>⌚</span>
              <span className={styles.showcaseArrow}>→</span>
            </div>
            <h3 className={styles.showcaseName}>Đồng Hồ & Âm Thanh</h3>
            <p className={styles.showcaseDesc}>
              Quản lý banner dọc, filter thể thao/sức khỏe, và danh sách Apple Watch, Galaxy Watch, AirPods, loa Sony/Marshall.
            </p>
          </Link>
        </div>
      </div>

      {/* Lưới 4 thẻ KPI động từ SQL Views */}
      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, idx) => (
          <div key={idx} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span>{kpi.label}</span>
              <span>{kpi.icon}</span>
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={`${styles.kpiTrend} ${kpi.isUp ? styles.trendUp : styles.trendDown}`}>
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Danh sách cảnh báo tồn kho thấp (v_low_stock) nếu có */}
      {lowStockItems.length > 0 && (
        <div className={styles.sectionCard} style={{ borderLeft: '4px solid #ef4444' }}>
          <h2 className={styles.sectionTitle} style={{ color: '#f87171' }}>
            ⚠️ Cảnh Báo Tồn Kho Thấp (View: v_low_stock)
          </h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kho hàng</th>
                <th>Sản phẩm</th>
                <th>Mã SKU</th>
                <th>Tồn kho</th>
                <th>Đang giữ</th>
                <th>Khả dụng</th>
                <th>Ngưỡng cảnh báo</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ color: '#e5e7eb', fontWeight: 600 }}>{item.warehouse}</td>
                  <td style={{ color: '#60a5fa' }}>{item.product}</td>
                  <td><code>{item.sku}</code></td>
                  <td style={{ color: '#ef4444', fontWeight: 700 }}>{item.quantity}</td>
                  <td>{item.reserved_qty}</td>
                  <td style={{ color: '#f59e0b', fontWeight: 600 }}>{item.available}</td>
                  <td>{item.reorder_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lối tắt quản lý danh mục, thương hiệu, sản phẩm */}
      <div className={styles.showcaseNavSection}>
        <h2 className={styles.showcaseNavTitle}>
          <span>🚀</span> Quản trị Danh mục, Thương hiệu & Sản phẩm (Database Catalog)
        </h2>
        <div className={styles.showcaseNavGrid}>
          <Link href="/admin/categories" className={styles.showcaseCard}>
            <div className={styles.showcaseCardTop}>
              <span className={styles.showcaseIcon}>📁</span>
              <span className={styles.showcaseArrow}>→</span>
            </div>
            <h3 className={styles.showcaseName}>Quản lý Danh mục (Categories)</h3>
            <p className={styles.showcaseDesc}>
              Cấu trúc cây đa cấp, sắp xếp thứ tự, bật/tắt hiển thị Mega Menu & Navbar.
            </p>
          </Link>

          <Link href="/admin/brands" className={styles.showcaseCard}>
            <div className={styles.showcaseCardTop}>
              <span className={styles.showcaseIcon}>🏷️</span>
              <span className={styles.showcaseArrow}>→</span>
            </div>
            <h3 className={styles.showcaseName}>Quản lý Thương hiệu (Brands)</h3>
            <p className={styles.showcaseDesc}>
              Quản lý hãng sản xuất, logo thương hiệu, lọc thương hiệu theo danh mục.
            </p>
          </Link>

          <Link href="/admin/products" className={styles.showcaseCard}>
            <div className={styles.showcaseCardTop}>
              <span className={styles.showcaseIcon}>📦</span>
              <span className={styles.showcaseArrow}>→</span>
            </div>
            <h3 className={styles.showcaseName}>Quản lý Sản phẩm (Products)</h3>
            <p className={styles.showcaseDesc}>
              Quản lý danh sách sản phẩm, giá bán, gắn cờ HOT cho Mega Menu và cờ MỚI.
            </p>
          </Link>
        </div>
      </div>

      {/* Bảng đơn hàng gần đây (orders) */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Đơn Hàng Mới Nhất từ Database (orders)</h2>
        {recentOrders.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '14px',
            }}
          >
            📭 Hiện chưa có đơn hàng nào trong hệ thống Database.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Kênh bán</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const isCompleted = order.status === 'completed';
                const isPending = order.status === 'pending';
                return (
                  <tr key={order.order_id}>
                    <td>
                      <strong style={{ color: '#60a5fa' }}>#{order.order_id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{order.customer_name}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{order.customer_email}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      {formatVnd(order.total_amount)}
                    </td>
                    <td>
                      <span style={{ textTransform: 'uppercase', fontSize: '12px', color: '#94a3b8' }}>
                        {order.channel}
                      </span>
                    </td>
                    <td style={{ color: '#9ca3af', fontSize: '12px' }}>
                      {new Date(order.order_date).toLocaleString('vi-VN')}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          isCompleted
                            ? styles.statusCompleted
                            : isPending
                            ? styles.statusPending
                            : styles.statusCompleted
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
