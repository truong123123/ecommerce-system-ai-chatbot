const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface DashboardOverview {
  today: {
    orders_today?: number;
    revenue_today?: number;
    new_customers_today?: number;
    orders_to_handle?: number;
    low_stock_items?: number;
    open_tickets?: number;
  };
  monthlyRevenue: Array<{
    month: string;
    total_orders: number;
    total_customers: number;
    revenue: number;
    gross_profit: number;
  }>;
  pendingOrders: Array<{
    order_id: number;
    order_date: string;
    status: string;
    total_amount: number;
    channel: string;
    customer: string;
    phone: string;
    waiting_hours: number;
    payment_status: string;
  }>;
  lowStockItems: Array<{
    warehouse: string;
    product: string;
    sku: string;
    quantity: number;
    reserved_qty: number;
    available: number;
    reorder_level: number;
  }>;
  recentOrders: Array<{
    order_id: number;
    order_date: string;
    status: string;
    total_amount: number;
    channel: string;
    customer_name: string;
    customer_email: string;
  }>;
}

export const dashboardService = {
  async fetchOverview(): Promise<DashboardOverview | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/overview`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error('Lỗi khi tải dữ liệu dashboard:', e);
      return null;
    }
  },
};
