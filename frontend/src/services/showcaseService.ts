import { CategoryShowcaseData, ShowcaseBannerItem, ShowcaseProduct } from '../types/categoryShowcase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const showcaseService = {
  // Lấy dữ liệu thuần túy từ Database PostgreSQL (qua Spring Boot REST API)
  // Lấy dữ liệu thuần túy từ Database PostgreSQL (qua Spring Boot REST API)
  async fetchFromDatabase(): Promise<CategoryShowcaseData> {
    try {
      const [prodRes, bannerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`, { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/banners`, { cache: 'no-store' }),
      ]);

      let banners: ShowcaseBannerItem[] = [];
      if (bannerRes.ok) {
        const rawBanners = await bannerRes.json();
        if (Array.isArray(rawBanners)) {
          // Chỉ lấy đúng 2 Banner dọc thuộc chuyên mục Điện thoại & Tablet
          const phoneBanners = rawBanners.filter((b: any) => {
            const title = (b.title || '').toLowerCase();
            const link = (b.primaryBtnLink || '').toLowerCase();
            const img = (b.imageUrl || '').toLowerCase();
            return (
              !title.includes('laptop') &&
              !title.includes('macbook') &&
              !title.includes('mac mini') &&
              !title.includes('watch') &&
              !title.includes('âm thanh') &&
              !title.includes('tai nghe') &&
              !title.includes('loa') &&
              !link.includes('laptop') &&
              !link.includes('mac') &&
              !link.includes('watch') &&
              !link.includes('audio') &&
              !img.includes('watch') &&
              !img.includes('laptop')
            );
          });
          banners = (phoneBanners.length > 0 ? phoneBanners : rawBanners.slice(0, 2)).map((b: any) => ({
            id: String(b.id),
            title: b.title || '',
            imageUrl: b.imageUrl || '',
            targetLink: b.primaryBtnLink || '/',
          }));
        }
      }

      let products: ShowcaseProduct[] = [];
      if (prodRes.ok) {
        const rawProducts = await prodRes.json();
        if (Array.isArray(rawProducts)) {
          // LỌC CHẶT CHẼ: Chỉ lấy sản phẩm Điện Thoại & Máy Tính Bảng từ PostgreSQL
          const phoneProducts = rawProducts.filter((p: any) => {
            const name = (p.name || '').toLowerCase();
            const slug = (p.categorySlug || '').toLowerCase();

            // Loại bỏ hoàn toàn Laptop, PC, Màn hình, Tai nghe, Đồng hồ
            const isNonPhone =
              slug === 'laptop' ||
              slug === 'pc' ||
              slug === 'macbook' ||
              slug === 'man-hinh' ||
              slug === 'phu-kien-may-tinh' ||
              slug === 'dong-ho' ||
              slug === 'am-thanh' ||
              slug === 'apple-watch' ||
              name.includes('laptop') ||
              name.includes('macbook') ||
              name.includes('mac mini') ||
              name.includes('vivobook') ||
              name.includes('omnibook') ||
              name.includes('cyborg') ||
              name.includes('ideapad') ||
              name.includes('tuf') ||
              name.includes('watch') ||
              name.includes('đồng hồ') ||
              name.includes('airpods') ||
              name.includes('tai nghe') ||
              name.includes('loa') ||
              name.includes('marshall') ||
              name.includes('sony') ||
              name.includes('amazfit') ||
              name.includes('myalo');

            return !isNonPhone;
          });

          products = phoneProducts.map((p: any) => {
            const minPrice = Number(p.price) || 0;
            const categorySlug = (p.categorySlug || '').toLowerCase();
            const nameLower = (p.name || '').toLowerCase();
            const isTablet =
              categorySlug === 'ipad' ||
              nameLower.includes('ipad') ||
              nameLower.includes('tab');

            return {
              id: String(p.id),
              name: p.name,
              brand: p.brandName || 'Apple',
              category: isTablet ? ('tablet' as const) : ('phone' as const),
              image: p.primaryImage || '/images/products/phones/phone_burgundy_18pro.jpg',
              price: minPrice,
              oldPrice: minPrice > 0 ? Math.round(minPrice * 1.1) : 0,
              discountPercent: 10,
              hasZeroInstallment: true,
              status: (nameLower.includes('16') || nameLower.includes('s25')
                ? 'hot_sale'
                : nameLower.includes('ultra')
                ? 'special_deal'
                : 'new_arrival') as any,
              smemberDiscount: 'Smember giảm thêm đến 1%',
              installmentNote: 'Trả góp 0% lãi suất',
              rating: 5,
              isFastDelivery: true,
              tags: ['5g', 'ai'],
            };
          });
        }
      }

      // Feature filters tự động trích xuất từ dữ liệu sản phẩm thực tế trong SQL
      const featureFilters = [
        { id: 'feat-1', label: 'Điện thoại chơi game', imageUrl: products[0]?.image || '/images/products/phones/phone_burgundy_18pro.jpg', tag: 'gaming' },
        { id: 'feat-2', label: 'Điện thoại pin trâu', imageUrl: products[1]?.image || '/images/products/phones/phone_poco_x8.jpg', tag: 'battery' },
        { id: 'feat-3', label: 'Điện thoại 5G', imageUrl: products[2]?.image || '/images/products/phones/phone_burgundy_18pro.jpg', tag: '5g' },
        { id: 'feat-4', label: 'Điện thoại chụp ảnh đẹp', imageUrl: products[3]?.image || '/images/products/phones/phone_poco_x8.jpg', tag: 'camera' },
        { id: 'feat-5', label: 'Điện thoại AI', imageUrl: products[4]?.image || '/images/products/phones/phone_burgundy_18pro.jpg', tag: 'ai' },
      ];

      return {
        banners,
        featureFilters,
        products,
      };
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu từ CSDL PostgreSQL:', err);
      return { banners: [], featureFilters: [], products: [] };
    }
  },

  // Lưu Banner đơn lẻ vào PostgreSQL
  async saveBannerToSql(banner: ShowcaseBannerItem): Promise<boolean> {
    try {
      const isExisting = /^\d+$/.test(banner.id);
      const url = isExisting ? `${API_BASE_URL}/banners/${banner.id}` : `${API_BASE_URL}/banners`;
      const method = isExisting ? 'PUT' : 'POST';

      const payload = {
        title: banner.title,
        imageUrl: banner.imageUrl,
        primaryBtnLink: banner.targetLink,
        isActive: true,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return res.ok;
    } catch (e) {
      console.error('Lỗi khi lưu banner vào SQL:', e);
      return false;
    }
  },

  // Xóa Banner khỏi PostgreSQL
  async deleteBannerFromSql(bannerId: string): Promise<boolean> {
    try {
      if (/^\d+$/.test(bannerId)) {
        const res = await fetch(`${API_BASE_URL}/banners/${bannerId}`, {
          method: 'DELETE',
        });
        return res.ok;
      }
      return true;
    } catch (e) {
      console.error('Lỗi khi xoá banner khỏi SQL:', e);
      return false;
    }
  },

  // Lưu toàn bộ danh sách Banner vào CSDL PostgreSQL
  async saveAllToDatabase(banners: ShowcaseBannerItem[], deletedBannerIds: string[] = []): Promise<boolean> {
    try {
      // 1. Xóa các banner bị loại bỏ
      for (const id of deletedBannerIds) {
        await this.deleteBannerFromSql(id);
      }

      // 2. Thêm mới hoặc cập nhật các banner hiện tại
      for (const b of banners) {
        await this.saveBannerToSql(b);
      }

      // 3. Báo hiệu cho các component tự động tải lại dữ liệu mới từ SQL
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('category-showcase-updated'));
      }

      return true;
    } catch (e) {
      console.error('Lỗi lưu cấu hình vào SQL:', e);
      return false;
    }
  },

  // Cập nhật sản phẩm trực tiếp vào PostgreSQL ngay khi thay đổi
  async updateProductToSql(
    id: string,
    updates: { name?: string; price?: number; image?: string; description?: string }
  ): Promise<boolean> {
    try {
      if (!/^\d+$/.test(id)) return false;
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('category-showcase-updated'));
      }
      return res.ok;
    } catch (e) {
      console.error('Lỗi khi cập nhật sản phẩm vào SQL:', e);
      return false;
    }
  },

  // Xoá sản phẩm khỏi PostgreSQL (soft delete isActive = false)
  async deleteProductFromSql(id: string): Promise<boolean> {
    try {
      if (!/^\d+$/.test(id)) return true;
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('category-showcase-updated'));
      }
      return res.ok;
    } catch (e) {
      console.error('Lỗi khi xoá sản phẩm khỏi SQL:', e);
      return false;
    }
  },
};

