export type ProductStatusType =
  | 'none'
  | 'pre_order'
  | 'coming_soon'
  | 'new_arrival'
  | 'hot_sale'
  | 'special_deal';

export interface ShowcaseBannerItem {
  id: string;
  title: string;
  imageUrl: string;
  targetLink?: string;
}

export interface FeatureFilterItem {
  id: string;
  label: string;
  imageUrl: string;
  tag: string;
}

export interface ShowcaseProduct {
  id: string;
  name: string;
  slug?: string;
  brand: string;
  category: 'phone' | 'tablet';
  image: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  hasZeroInstallment?: boolean;
  status: ProductStatusType;
  statusCustomText?: string;
  smemberDiscount?: string;
  studentDiscount?: string;
  installmentNote?: string;
  rating?: number;
  isFastDelivery?: boolean;
  tags?: string[];
}

export interface CategoryShowcaseData {
  banners: ShowcaseBannerItem[];
  featureFilters: FeatureFilterItem[];
  products: ShowcaseProduct[];
}
