// Cấu hình tìm kiếm đề xuất do Admin quản lý
// Admin có thể dễ dàng thay đổi banner quảng cáo, tiêu đề và danh sách từ khóa xu hướng tại đây

export interface SearchTrendingItem {
  id: number;
  name: string;
  query: string;
  image: string;
  href?: string;
}

export interface AdminSearchConfig {
  banner: {
    title: string;
    subtitle: string;
    badge: string;
    ctaText: string;
    imageUrl: string;
    targetQuery: string;
    href?: string;
  };
  trendingTitle: string;
  trendingItems: SearchTrendingItem[];
}

export const ADMIN_SEARCH_CONFIG: AdminSearchConfig = {
  banner: {
    title: 'iPhone 18 Pro Max - Lên đời chỉ từ 35.63 Triệu',
    subtitle: 'Trợ giá thu cũ đến 5 Triệu • Trả góp 0% 18 tháng',
    badge: 'Lên đời chỉ từ 35.63 Triệu',
    ctaText: 'Mua ngay',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_400,h_400,c_pad,b_white,q_auto,f_auto/v1793711824/products/iphone-18-pro-max-01.webp',
    targetQuery: 'iPhone 18 Pro Max',
    href: '/products/iphone-18-pro-max'
  },
  trendingTitle: 'Xu hướng tìm kiếm',
  trendingItems: [
    {
      id: 1,
      name: 'iPhone 18 Pro',
      query: 'iPhone 18 Pro',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_120,h_120,c_pad,b_white,q_auto,f_auto/v1793711824/products/iphone-18-pro-01.webp',
      href: '/products/iphone-18-pro'
    },
    {
      id: 2,
      name: 'Samsung Galaxy Z8 Series',
      query: 'Galaxy Z Fold',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_120,h_120,c_pad,b_white,q_auto,f_auto/v1793711824/products/samsung-galaxy-z-fold-8-lavender-01.webp',
      href: '/products/samsung-galaxy-z-fold-8-lavender'
    },
    {
      id: 3,
      name: 'iPhone Duo',
      query: 'iPhone Duo',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_120,h_120,c_pad,b_white,q_auto,f_auto/v1793711824/products/iphone-duo-01.webp',
      href: '/products/iphone-duo'
    },
    {
      id: 4,
      name: 'OPPO Find X10 Series',
      query: 'OPPO',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_120,h_120,c_pad,b_white,q_auto,f_auto/v1793711824/products/oppo-find-x10-pro-max-white-01_1.webp',
      href: '/category/phone-tablet'
    },
    {
      id: 5,
      name: 'iPad mini (2026)',
      query: 'iPad',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_120,h_120,c_pad,b_white,q_auto,f_auto/v1793711824/products/ipad-a16-11-inch_10_.webp',
      href: '/ipad'
    },
    {
      id: 6,
      name: 'iMac M6',
      query: 'Mac',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_120,h_120,c_pad,b_white,q_auto,f_auto/v1793711824/products/macbook_13_66.webp',
      href: '/mac'
    },
    {
      id: 7,
      name: 'MacBook Pro M6',
      query: 'MacBook Pro',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_120,h_120,c_pad,b_white,q_auto,f_auto/v1793711824/products/macbook_13_67.webp',
      href: '/mac'
    },
    {
      id: 8,
      name: 'Tivi giá rẻ',
      query: 'Tivi',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_120,h_120,c_pad,b_white,q_auto,f_auto/v1793711824/products/smart-tivi-samsung-qled-55q6fa-4k-55-inch.webp',
      href: '/category/tv-appliances'
    },
    {
      id: 9,
      name: 'MacBook Pro PROLED XDR',
      query: 'MacBook Pro',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_120,h_120,c_pad,b_white,q_auto,f_auto/v1793711824/products/macbook_3__25.png',
      href: '/mac'
    },
    {
      id: 10,
      name: 'Dán màn hình iPhone 18',
      query: 'iPhone',
      image: 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_120,h_120,c_pad,b_white,q_auto,f_auto/v1793711824/products/iphone_17_256gb-3_2.webp',
      href: '/accessories'
    }
  ]
};

