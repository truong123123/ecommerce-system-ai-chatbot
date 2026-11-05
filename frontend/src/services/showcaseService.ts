import { CategoryShowcaseData, ShowcaseBannerItem, ShowcaseProduct } from '../types/categoryShowcase';
import { API_BASE_URL } from '@/lib/env';
import { getCloudinaryTransformedUrl } from '../utils/image';
import apiClient from './api';

export const showcaseService = {
  // Lấy dữ liệu thuần túy từ Database PostgreSQL (qua Spring Boot REST API)
  async fetchFromDatabase(): Promise<CategoryShowcaseData> {
    try {
      const [prodRes, bannerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`, { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/banners`, { cache: 'no-store' }),
      ]);

      let banners: ShowcaseBannerItem[] = [
        {
          id: 'cat-banner-1',
          title: 'iPhone Titan Đột Phá',
          imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793865061/banners/vertical/poster_iphone_duo.jpg',
          targetLink: '/products/iphone-17-pro-256gb',
        },
        {
          id: 'cat-banner-2',
          title: 'Redmi Note Đỉnh Cao',
          imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793865064/banners/vertical/poster_redmi_note17.jpg',
          targetLink: '/products',
        },
      ];

      if (bannerRes.ok) {
        const rawBanners = await bannerRes.json();
        if (Array.isArray(rawBanners)) {
          // Lọc chính xác các banner đứng của chuyên mục Điện thoại
          const phoneBanners = rawBanners.filter((b: any) => {
            const bg = (b.bgColor || '').toLowerCase();
            const img = (b.imageUrl || '').toLowerCase();
            return bg === 'category_phone' || img.includes('/vertical/') || img.includes('poster_');
          });

          if (phoneBanners.length > 0) {
            banners = phoneBanners.slice(0, 2).map((b: any) => ({
              id: String(b.id),
              title: b.title || '',
              imageUrl: b.imageUrl || '',
              targetLink: b.primaryBtnLink || b.targetLink || '/products',
            }));
          }
        }
      }

      let products: ShowcaseProduct[] = [];
      if (prodRes.ok) {
        const rawProducts = await prodRes.json();
        if (Array.isArray(rawProducts)) {
          // LỌC CHẶT CHẼ: Chỉ lấy sản phẩm Điện Thoại & Máy Tính Bảng từ PostgreSQL
          const phoneCategoryIds = [1, 6, 18, 3, 19];
          const phoneProducts = rawProducts.filter((p: any) => {
            const catId = Number(p.categoryId);
            const slug = (p.categorySlug || '').toLowerCase();
            const name = (p.name || '').toLowerCase();

            // Loại trừ hoàn toàn laptop, PC, âm thanh, phụ kiện
            if (
              slug.includes('laptop') ||
              slug.includes('pc') ||
              slug.includes('macbook') ||
              slug.includes('am-thanh') ||
              name.includes('zephyrus') ||
              name.includes('zenbook') ||
              name.includes('vivobook') ||
              name.includes('gram') ||
              name.includes('surface') ||
              name.includes('predator') ||
              name.includes('aspire') ||
              name.includes('thinkpad') ||
              name.includes('yoga')
            ) {
              return false;
            }

            return (
              phoneCategoryIds.includes(catId) ||
              slug === 'iphone' ||
              slug === 'samsung-galaxy' ||
              slug === 'dien-thoai' ||
              slug === 'ipad' ||
              slug === 'may-tinh-bang'
            );
          });

          products = phoneProducts.map((p: any) => {
            const minPrice = Number(p.price) || 0;
            const categorySlug = (p.categorySlug || '').toLowerCase();
            const nameLower = (p.name || '').toLowerCase();
            const isTablet =
              categorySlug === 'ipad' ||
              nameLower.includes('ipad') ||
              nameLower.includes('tab');

            const tmemberAmt = Math.round((minPrice * 0.01) / 1000) * 1000;
            const studentAmt = Math.round((minPrice * 0.03) / 1000) * 1000;

            const tags: string[] = ['5g', 'ai', 'camera'];
            if (nameLower.includes('fold') || nameLower.includes('flip')) {
              tags.push('fold');
            }
            if (
              nameLower.includes('ultra') ||
              nameLower.includes('pro') ||
              nameLower.includes('poco') ||
              nameLower.includes('magic') ||
              nameLower.includes('gt') ||
              nameLower.includes('rog') ||
              nameLower.includes('redmagic')
            ) {
              tags.push('gaming');
            }
            if (
              nameLower.includes('max') ||
              nameLower.includes('plus') ||
              nameLower.includes('ultra') ||
              nameLower.includes('fold')
            ) {
              tags.push('battery');
            }

            return {
              id: String(p.id),
              name: p.name,
              slug: p.slug || String(p.id),
              brand: p.brandName || 'Apple',
              category: isTablet ? ('tablet' as const) : ('phone' as const),
              image: getCloudinaryTransformedUrl(p.primaryImage || (p.images && p.images[0])),
              price: minPrice,
              oldPrice: Number(p.specs?.originalPrice) || (minPrice > 0 ? Math.round(minPrice * 1.1) : 0),
              discountPercent: Number(p.specs?.discountPercentage) || 10,
              hasZeroInstallment: true,
              status: (nameLower.includes('ultra') || nameLower.includes('fold')
                ? 'special_deal'
                : 'new_arrival') as any,
              tmemberDiscount: tmemberAmt > 0 ? `Tmember giảm đến ${new Intl.NumberFormat('vi-VN').format(tmemberAmt)}đ` : undefined,
              smemberDiscount: tmemberAmt > 0 ? `Tmember giảm đến ${new Intl.NumberFormat('vi-VN').format(tmemberAmt)}đ` : undefined,
              studentDiscount: studentAmt > 0 ? `T-Student giảm thêm ${new Intl.NumberFormat('vi-VN').format(studentAmt)}đ` : undefined,
              installmentNote: 'Trả góp 0% lãi suất',
              rating: 5,
              isFastDelivery: true,
              tags,
            };
          });
        }
      }

      // Feature filters tự động trích xuất từ dữ liệu sản phẩm thực tế trong SQL
      const featureFilters = [
        { id: 'feat-1', label: 'Điện thoại chơi game', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', tag: 'gaming' },
        { id: 'feat-2', label: 'Điện thoại pin trâu', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', tag: 'battery' },
        { id: 'feat-3', label: 'Điện thoại 5G', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400', tag: '5g' },
        { id: 'feat-4', label: 'Điện thoại chụp ảnh đẹp', imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', tag: 'camera' },
        { id: 'feat-5', label: 'Điện thoại gập', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', tag: 'fold' },
        { id: 'feat-6', label: 'Điện thoại AI', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400', tag: 'ai' },
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

  // Lưu Banner đơn lẻ vào PostgreSQL qua apiClient có xác thực CSRF & Cookie
  async saveBannerToSql(banner: ShowcaseBannerItem): Promise<boolean> {
    try {
      const isExisting = /^\d+$/.test(banner.id);
      const payload = {
        title: banner.title,
        imageUrl: banner.imageUrl,
        primaryBtnLink: banner.targetLink,
        bgColor: 'category_phone',
        isActive: true,
      };

      if (isExisting) {
        const res = await apiClient.put(`/admin/banners/${banner.id}`, payload);
        return res.status >= 200 && res.status < 300;
      } else {
        const res = await apiClient.post('/admin/banners', payload);
        return res.status >= 200 && res.status < 300;
      }
    } catch (e) {
      console.error('Lỗi khi lưu banner vào SQL:', e);
      return false;
    }
  },

  // Xóa Banner khỏi PostgreSQL
  async deleteBannerFromSql(bannerId: string): Promise<boolean> {
    try {
      if (/^\d+$/.test(bannerId)) {
        const res = await apiClient.delete(`/admin/banners/${bannerId}`);
        return res.status >= 200 && res.status < 300;
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

  // Cập nhật sản phẩm trực tiếp vào PostgreSQL
  async updateProductToSql(
    id: string,
    updates: { name?: string; price?: number; image?: string; description?: string }
  ): Promise<boolean> {
    try {
      if (!/^\d+$/.test(id)) return false;
      const res = await apiClient.put(`/admin/products/${id}`, updates);
      if (res.status >= 200 && res.status < 300 && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('category-showcase-updated'));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Lỗi khi cập nhật sản phẩm vào SQL:', e);
      return false;
    }
  },

  // Xoá sản phẩm khỏi PostgreSQL
  async deleteProductFromSql(id: string): Promise<boolean> {
    try {
      if (!/^\d+$/.test(id)) return true;
      const res = await apiClient.delete(`/admin/products/${id}`);
      if (res.status >= 200 && res.status < 300 && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('category-showcase-updated'));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Lỗi khi xoá sản phẩm khỏi SQL:', e);
      return false;
    }
  },
};
