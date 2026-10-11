import { ApiProduct, ApiBanner } from './showcase';

export interface LaptopProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  category: string;
  image: string;
  price: number;
  oldPrice: number | null;
  discountPercent: number | null;
  specs: string | null;
  rating: number | null;
  reviewCount: number | null;
  tmemberText: string | null;
  studentText: string | null;
  installmentText: string | null;
  isFastDelivery: boolean;
  isNewArrival?: boolean;
}

export interface LaptopBanner {
  id: string;
  title: string;
  imageUrl: string;
  targetLink: string;
  badgeText?: string;
}

export interface GetLaptopProductsParams {
  categorySlug?: string;
  brand?: string;
  brandSlug?: string;
  limit?: number;
}
