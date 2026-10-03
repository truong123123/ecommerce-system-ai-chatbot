export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface ProductVariantOption {
  id: string;
  sku?: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image?: string;
  colorCode?: string;
  inStock: boolean;
}

export interface ProductConfigOption {
  id: string;
  label: string;
  cpu: string;
  ram: string;
  storage: string;
  price: number;
  oldPrice?: number | null;
}

export interface ProductSpecRow {
  label: string;
  value: string;
  group?: string;
}

export interface ProductCommitment {
  id: string;
  title: string;
  description: string;
  iconName: 'shield' | 'refresh' | 'box' | 'receipt';
}

export interface PromotionVoucher {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  discount: string;
}

export interface PaymentOffer {
  id: string;
  partner: string;
  title: string;
  description: string;
  discountType?: string;
  discountValue?: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  discount: string;
  tag: string;
  logoUrl?: string;
}

export interface InstallmentPlan {
  id: string;
  provider: string;
  termMonths: number;
  monthlyRatePct: number;
  downPaymentPct: number;
  minOrderAmount: number;
}

export interface ProductBundleItem {
  id: string;
  bundledVariantId?: number;
  name: string;
  sku?: string;
  originalPrice: number;
  bundlePrice: number;
  discountPercent: number;
  image: string;
  category?: string;
  selected?: boolean;
}

export interface WarrantyPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  description: string;
  isRecommended?: boolean;
}

export interface StoreLocation {
  id: string;
  province: string;
  district: string;
  address: string;
  phone: string;
  mapUrl: string;
  stockCount: number;
}

export interface ProductReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  isVerified: boolean;
  comment: string;
  likes: number;
}

export interface ReviewBreakdown {
  star5Count: number;
  star5Pct: number;
  star4Count: number;
  star4Pct: number;
  star3Count: number;
  star3Pct: number;
  star2Count: number;
  star2Pct: number;
  star1Count: number;
  star1Pct: number;
}

export interface MembershipDiscount {
  tierId: number;
  code: string;
  name: string;
  discountPercent: number;
  discountAmount: number;
}

export interface FullProductDetail {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  slug: string;
  brand: string;
  brandSlug?: string;
  category: string;
  categorySlug?: string;
  series: string;
  seriesSlug?: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  questionsCount: number;
  images: {
    url: string;
    alt: string;
    type?: 'image' | 'video' | 'highlight';
    title?: string;
  }[];
  specs: ProductSpecRow[];
  commitments: ProductCommitment[];
  variants: ProductVariantOption[];
  configurations: ProductConfigOption[];
  promotions: {
    vouchers: PromotionVoucher[];
    bullets: string[];
    tradeIn: {
      title: string;
      minPrice: number;
      subsidy: number;
    } | null;
  };
  paymentOffers: PaymentOffer[];
  installmentPlans: InstallmentPlan[];
  stores: StoreLocation[];
  bundles: ProductBundleItem[];
  warranties: WarrantyPlan[];
  membership: {
    studentDiscount: number;
    smemberDiscount: number;
  };
  membershipDiscounts: MembershipDiscount[];
  reviews: ProductReviewItem[];
  reviewBreakdown?: ReviewBreakdown;
}
