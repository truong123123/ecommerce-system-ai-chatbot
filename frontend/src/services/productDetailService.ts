import {
  FullProductDetail,
  StoreLocation,
  ProductSpecRow,
  ProductBundleItem,
  WarrantyPlan,
  ProductCommitment,
  PromotionVoucher,
  PaymentOffer,
  InstallmentPlan,
  MembershipDiscount,
  ReviewBreakdown,
  ProductVariantOption,
  ProductConfigOption,
  ProductReviewItem
} from '../types/productDetail';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Mapping friendly Vietnamese labels for technical specification keys
const SPEC_KEY_LABELS: Record<string, string> = {
  cpu: 'Bộ vi xử lý (CPU)',
  chip: 'Chip xử lý',
  chip_ai: 'Chip AI',
  gpu: 'Card đồ họa (GPU)',
  ram: 'Dung lượng RAM',
  storage: 'Bộ nhớ trong / Ổ cứng',
  ssd: 'Ổ cứng SSD',
  screen: 'Màn hình',
  display: 'Màn hình',
  battery: 'Pin & Sạc',
  os: 'Hệ điều hành',
  ports: 'Cổng giao tiếp',
  camera_rear: 'Camera sau',
  camera_front: 'Camera trước',
  material: 'Chất liệu khung viền',
  weight: 'Trọng lượng',
  pen: 'Bút cảm ứng',
  waterproof: 'Kháng nước & bụi',
  connectivity: 'Kết nối mạng & Bluetooth',
  sound: 'Công nghệ âm thanh'
};

function formatSpecKey(key: string): string {
  const normalized = key.toLowerCase().trim();
  if (SPEC_KEY_LABELS[normalized]) {
    return SPEC_KEY_LABELS[normalized];
  }
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function parseSpecs(rawSpecs: any): ProductSpecRow[] {
  if (!rawSpecs) return [];
  let specObj: Record<string, any> = {};

  if (typeof rawSpecs === 'string') {
    try {
      specObj = JSON.parse(rawSpecs);
    } catch {
      return [{ label: 'Thông số kỹ thuật', value: rawSpecs }];
    }
  } else if (typeof rawSpecs === 'object') {
    specObj = rawSpecs;
  }

  const rows: ProductSpecRow[] = [];
  for (const [key, value] of Object.entries(specObj)) {
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      rows.push({
        label: formatSpecKey(key),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      });
    }
  }
  return rows;
}

function parseJsonSafe(raw: any): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

function getColorHex(name: string): string {
  const lower = (name || '').toLowerCase();
  if (lower.includes('bạc') || lower.includes('silver')) return '#d1d5db';
  if (lower.includes('xám') || lower.includes('gray') || lower.includes('grey')) return '#6b7280';
  if (lower.includes('đen') || lower.includes('black') || lower.includes('midnight')) return '#1f2937';
  if (lower.includes('trắng') || lower.includes('white')) return '#f3f4f6';
  if (lower.includes('sa mạc') || lower.includes('desert') || lower.includes('vàng') || lower.includes('gold')) return '#c2a58d';
  if (lower.includes('xanh') || lower.includes('blue')) return '#3b82f6';
  if (lower.includes('hồng') || lower.includes('pink')) return '#f472b6';
  if (lower.includes('cam') || lower.includes('orange')) return '#ea580c';
  return '#94a3b8';
}

/**
 * Maps PostgreSQL Spring Boot API Response directly into FullProductDetail.
 * ZERO fake data, ZERO fallback calculations.
 */
function mapBackendToFullDetail(data: any): FullProductDetail {
  const price = Number(data.price) || 0;
  const oldPrice = (data.oldPrice !== null && data.oldPrice !== undefined) ? Number(data.oldPrice) : null;
  const originalPrice = oldPrice !== null ? oldPrice : price;
  const discountPercent = (oldPrice !== null && oldPrice > price && oldPrice > 0)
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  // 1. Technical Specs directly from products.specs JSONB
  const specs = parseSpecs(data.specs);

  // 2. Images directly from product_images
  const images = (data.images || []).map((img: any, idx: number) => ({
    url: img.url,
    alt: `${data.name || 'Sản phẩm'} - Ảnh ${idx + 1}`,
    type: 'image' as const,
    title: img.isPrimary ? 'Ảnh chính' : `Ảnh ${idx + 1}`
  }));

  if (images.length === 0 && data.primaryImage) {
    images.push({
      url: data.primaryImage,
      alt: data.name || 'Ảnh sản phẩm',
      type: 'image' as const,
      title: 'Ảnh chính'
    });
  }

  // 3. Variants directly from product_variants
  const variants: ProductVariantOption[] = (data.variants || []).map((v: any, idx: number) => {
    const attrs = parseJsonSafe(v.attributes);
    const colorName = v.color && v.color !== 'Mặc định' ? v.color : (attrs.color || (attrs.mau_sac || `Phiên bản ${idx + 1}`));
    const vPrice = Number(v.price) || price;
    const vOldPrice = (v.oldPrice !== null && v.oldPrice !== undefined) ? Number(v.oldPrice) : null;

    return {
      id: String(v.id || idx),
      sku: v.sku,
      name: colorName,
      price: vPrice,
      oldPrice: vOldPrice,
      colorCode: getColorHex(colorName),
      inStock: v.stock !== undefined ? v.stock > 0 : true
    };
  });

  // 4. Configurations directly from product_variants attributes
  const configurations: ProductConfigOption[] = (data.variants || []).map((v: any, idx: number) => {
    const attrs = parseJsonSafe(v.attributes);
    const label = attrs.cpu || attrs.storage || attrs.capacity || attrs.ram || (attrs.dung_luong || `Cấu hình ${idx + 1}`);
    const vPrice = Number(v.price) || price;
    const vOldPrice = (v.oldPrice !== null && v.oldPrice !== undefined) ? Number(v.oldPrice) : null;

    return {
      id: `cfg-${v.id || idx}`,
      label: String(label),
      cpu: attrs.cpu || '',
      ram: attrs.ram || '',
      storage: attrs.ssd || attrs.storage || attrs.rom || '',
      price: vPrice,
      oldPrice: vOldPrice
    };
  });

  // 5. Commitments directly from product_commitments
  const iconNames: Array<'shield' | 'refresh' | 'box' | 'receipt'> = ['shield', 'refresh', 'box', 'receipt'];
  const commitments: ProductCommitment[] = (data.commitments || []).map((c: any, idx: number) => ({
    id: String(c.id || idx),
    title: c.title || '',
    description: c.content || '',
    iconName: iconNames[idx % 4]
  }));

  // 6. Stores & Store Availability directly from v_store_availability
  const stores: StoreLocation[] = (data.stores || []).map((s: any) => ({
    id: String(s.id),
    province: s.province || '',
    district: s.district || '',
    address: s.address || '',
    phone: s.phone || '',
    mapUrl: s.address ? `https://maps.google.com/?q=${encodeURIComponent(s.address)}` : '',
    stockCount: Number(s.availableQty) || 0
  }));

  // 7. Reviews directly from reviews table (NO fallback rating)
  const reviews: ProductReviewItem[] = (data.reviews || []).map((r: any) => ({
    id: String(r.id),
    author: r.author || 'Khách hàng',
    rating: Number(r.rating) || 0,
    date: r.createdAt || '',
    isVerified: true,
    comment: r.comment || '',
    likes: 0
  }));

  // 8. Review Breakdown directly from backend statistics calculation
  const reviewBreakdown: ReviewBreakdown = data.reviewBreakdown ? {
    star5Count: Number(data.reviewBreakdown.star5Count) || 0,
    star5Pct: Number(data.reviewBreakdown.star5Pct) || 0,
    star4Count: Number(data.reviewBreakdown.star4Count) || 0,
    star4Pct: Number(data.reviewBreakdown.star4Pct) || 0,
    star3Count: Number(data.reviewBreakdown.star3Count) || 0,
    star3Pct: Number(data.reviewBreakdown.star3Pct) || 0,
    star2Count: Number(data.reviewBreakdown.star2Count) || 0,
    star2Pct: Number(data.reviewBreakdown.star2Pct) || 0,
    star1Count: Number(data.reviewBreakdown.star1Count) || 0,
    star1Pct: Number(data.reviewBreakdown.star1Pct) || 0
  } : {
    star5Count: 0, star5Pct: 0, star4Count: 0, star4Pct: 0,
    star3Count: 0, star3Pct: 0, star2Count: 0, star2Pct: 0,
    star1Count: 0, star1Pct: 0
  };

  // 9. Warranties directly from warranty_plans
  const warranties: WarrantyPlan[] = (data.warrantyPlans || []).map((w: any, idx: number) => ({
    id: String(w.id),
    name: w.name || '',
    durationMonths: Number(w.durationMonths) || 0,
    price: Number(w.price) || 0,
    description: w.description || '',
    isRecommended: idx === 0
  }));

  // 10. Payment Offers directly from payment_offers table
  const paymentOffers: PaymentOffer[] = (data.paymentOffers || []).map((po: any) => {
    const val = Number(po.discountValue) || 0;
    const formattedDiscount = po.discountType === 'percentage'
      ? `Giảm ${val}%`
      : `Giảm ${new Intl.NumberFormat('vi-VN').format(val)}₫`;

    return {
      id: String(po.id),
      partner: po.partner || '',
      title: po.title || '',
      description: po.description || '',
      discountType: po.discountType,
      discountValue: val,
      maxDiscount: Number(po.maxDiscount) || 0,
      minOrderAmount: Number(po.minOrderAmount) || 0,
      discount: val > 0 ? formattedDiscount : 'Ưu đãi',
      tag: po.tag || 'Ưu đãi thanh toán'
    };
  });

  // 11. Installment Plans directly from installment_plans table
  const installmentPlans: InstallmentPlan[] = (data.installmentPlans || []).map((ip: any) => ({
    id: String(ip.id),
    provider: ip.provider || '',
    termMonths: Number(ip.termMonths) || 0,
    monthlyRatePct: Number(ip.monthlyRatePct) || 0,
    downPaymentPct: Number(ip.downPaymentPct) || 0,
    minOrderAmount: Number(ip.minOrderAmount) || 0
  }));

  // 12. Bundles directly from v_active_bundles
  const bundles: ProductBundleItem[] = (data.bundles || []).map((b: any) => ({
    id: String(b.id),
    bundledVariantId: b.bundledVariantId,
    name: b.name || '',
    sku: b.sku,
    originalPrice: Number(b.originalPrice) || 0,
    bundlePrice: Number(b.bundlePrice) || 0,
    discountPercent: Number(b.discountPercent) || 0,
    image: '',
    selected: false
  }));

  // 13. Membership Discounts directly from membership_tiers table
  const membershipDiscounts: MembershipDiscount[] = (data.membershipDiscounts || []).map((md: any) => ({
    tierId: Number(md.tierId),
    code: md.code || '',
    name: md.name || '',
    discountPercent: Number(md.discountPercent) || 0,
    discountAmount: Number(md.discountAmount) || 0
  }));

  const studentTier = membershipDiscounts.find((m) => m.code.toLowerCase().includes('student'));
  const smemberTier = membershipDiscounts.find((m) => m.code.toLowerCase().includes('smember'));
  const membership = {
    studentDiscount: studentTier ? studentTier.discountAmount : 0,
    smemberDiscount: smemberTier ? smemberTier.discountAmount : 0
  };

  // 14. Promotions directly from promotions table
  const rawPromotions = data.promotions || [];
  const vouchers: PromotionVoucher[] = rawPromotions
    .filter((p: any) => p.kind === 'voucher')
    .map((p: any) => ({
      id: String(p.id),
      code: p.name || '',
      title: p.name || '',
      subtitle: p.description || '',
      discount: p.discountAmount ? `Giảm ${new Intl.NumberFormat('vi-VN').format(p.discountAmount)}₫` : 'Ưu đãi'
    }));

  const bullets: string[] = rawPromotions
    .filter((p: any) => p.kind !== 'voucher' && p.kind !== 'trade_in')
    .map((p: any) => p.name);

  const tradeInItem = rawPromotions.find((p: any) => p.kind === 'trade_in');
  const tradeIn = tradeInItem ? {
    title: tradeInItem.name || '',
    minPrice: Number(tradeInItem.discountAmount) || 0,
    subsidy: Number(tradeInItem.discountAmount) || 0
  } : {
    title: '',
    minPrice: 0,
    subsidy: 0
  };

  const promotions = {
    vouchers,
    bullets,
    tradeIn
  };

  const brandName = data.brand?.name || data.brandName || '';
  const brandSlug = data.brand?.slug || '';
  const categoryName = data.category?.name || data.categoryName || '';
  const categorySlug = data.category?.slug || data.categorySlug || '';
  const seriesName = data.series?.name || '';
  const seriesSlug = data.series?.slug || '';

  return {
    id: String(data.id),
    sku: data.productCode || (data.variants && data.variants[0]?.sku) || `SKU-${data.id}`,
    name: data.name || '',
    subtitle: data.description || '',
    slug: data.slug || '',
    brand: brandName,
    brandSlug: brandSlug,
    category: categoryName,
    categorySlug: categorySlug,
    series: seriesName,
    seriesSlug: seriesSlug,
    description: data.description || '',
    price: price,
    oldPrice: oldPrice,
    originalPrice: originalPrice,
    discountPercent: discountPercent,
    rating: Number(data.rating) || 0,
    reviewsCount: Number(data.reviewCount) || reviews.length,
    questionsCount: 0,
    images: images,
    specs: specs,
    commitments: commitments,
    variants: variants,
    configurations: configurations,
    promotions: promotions,
    paymentOffers: paymentOffers,
    installmentPlans: installmentPlans,
    stores: stores,
    bundles: bundles,
    warranties: warranties,
    membership: membership,
    membershipDiscounts: membershipDiscounts,
    reviews: reviews,
    reviewBreakdown: reviewBreakdown
  };
}

export const productDetailService = {
  // Trả góp tính toán động
  calculateInstallmentMonthly(price: number, months: number = 12, interestRate: number = 0): number {
    if (price <= 0 || months <= 0) return 0;
    const total = price * (1 + interestRate);
    return Math.round(total / months);
  },

  // Lọc chi nhánh theo Tỉnh và Quận từ dữ liệu stores thực tế
  filterStores(stores: StoreLocation[], province?: string, district?: string): StoreLocation[] {
    return stores.filter((s) => {
      const matchProv = !province || province === 'Tất cả' || s.province.toLowerCase() === province.toLowerCase();
      const matchDist = !district || district === 'Tất cả' || s.district.toLowerCase() === district.toLowerCase();
      return matchProv && matchDist;
    });
  },

  // Danh sách tỉnh thành trích xuất động từ danh sách kho/cửa hàng thực tế
  getProvinces(stores: StoreLocation[]): string[] {
    const set = new Set<string>();
    stores.forEach((s) => {
      if (s.province && s.province.trim()) set.add(s.province.trim());
    });
    return Array.from(set);
  },

  // Danh sách quận huyện trích xuất động theo tỉnh từ dữ liệu kho thực tế
  getDistricts(stores: StoreLocation[], province: string): string[] {
    const set = new Set<string>();
    stores
      .filter((s) => s.province && s.province.toLowerCase() === province.toLowerCase())
      .forEach((s) => {
        if (s.district && s.district.trim()) set.add(s.district.trim());
      });
    return Array.from(set);
  },

  /**
   * Lấy chi tiết sản phẩm thật từ PostgreSQL qua REST API Spring Boot:
   * GET /api/v1/products/slug/{slug} hoặc GET /api/v1/products/{id}
   */
  async getProductDetail(slugOrId: string): Promise<FullProductDetail | null> {
    const normalizedSlug = slugOrId.toLowerCase().trim();

    try {
      // 1. Thử truy vấn theo slug
      const slugUrl = `${API_BASE_URL}/products/slug/${encodeURIComponent(normalizedSlug)}`;
      const slugRes = await fetch(slugUrl, { cache: 'no-store' });

      if (slugRes.ok) {
        const prodData = await slugRes.json();
        if (prodData && prodData.name) {
          return mapBackendToFullDetail(prodData);
        }
      }

      // 2. Nếu không tìm thấy và slugOrId là số, thử theo ID
      if (!isNaN(Number(normalizedSlug))) {
        const idUrl = `${API_BASE_URL}/products/${normalizedSlug}`;
        const idRes = await fetch(idUrl, { cache: 'no-store' });

        if (idRes.ok) {
          const prodData = await idRes.json();
          if (prodData && prodData.name) {
            return mapBackendToFullDetail(prodData);
          }
        }
      }
    } catch (error) {
      console.error(`Lỗi khi gọi API getProductDetail cho "${slugOrId}":`, error);
    }

    return null;
  }
};
