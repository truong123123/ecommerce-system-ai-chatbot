import { z } from 'zod';

// ============================================================================
// 1. BACKEND API SCHEMAS & TYPES (Strict matching Spring Boot DTOs)
// ============================================================================

export const ApiVariantSchema = z.object({
  variantId: z.number(),
  sku: z.string().optional(),
  attributes: z.unknown().optional(),
  costPrice: z.coerce.number().optional(),
  salePrice: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

export const ApiProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  categoryId: z.number(),
  categoryName: z.string().nullable().optional(),
  categorySlug: z.string().nullable().optional(),
  brandId: z.number().nullable().optional(),
  brandName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  primaryImage: z.string().nullable().optional(),
  price: z.coerce.number(),
  maxPrice: z.coerce.number().nullable().optional(),
  isActive: z.boolean().optional(),
  isHot: z.boolean().optional(),
  isNew: z.boolean().optional(),
  variants: z.array(ApiVariantSchema).optional(),
  images: z.array(z.string()).optional(),
  // Fields that might exist if backend is extended
  rating: z.coerce.number().nullable().optional(),
  reviewCount: z.coerce.number().nullable().optional(),
});

export type ApiProduct = z.infer<typeof ApiProductSchema>;

export const ApiBannerSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string(),
  headline: z.string().nullable().optional(),
  subHeadline: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  primaryBtnText: z.string().nullable().optional(),
  primaryBtnLink: z.string().nullable().optional(),
  secondaryBtnText: z.string().nullable().optional(),
  secondaryBtnLink: z.string().nullable().optional(),
  bgColor: z.string().nullable().optional(),
  textColor: z.string().nullable().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type ApiBanner = z.infer<typeof ApiBannerSchema>;

export const ApiBrandSchema = z.object({
  brandId: z.number(),
  name: z.string(),
  slug: z.string(),
  country: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type ApiBrand = z.infer<typeof ApiBrandSchema>;

// ============================================================================
// 2. VIEW MODEL TYPES (Sanitized & Typed for React Components)
// ============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  category: 'dong-ho' | 'am-thanh';
  image: string;
  price: number;
  oldPrice: number | null; // Only non-null if backend returned genuine maxPrice > price
  discountPercent: number | null; // Only non-null if genuine discount exists
  rating: number | null; // Only if returned by backend; NO fake 5-star rating
  reviewCount: number | null;
  tmemberDiscountText?: string | null;
  studentDiscountText?: string | null;
  installmentText?: string | null;
  isHot: boolean;
  isNew: boolean;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetLink: string;
  badgeText: string;
}

export interface BrandFilter {
  id: number | string;
  name: string;
  slug: string;
}

export interface GetProductsParams {
  categorySlug?: string;
  brandSlug?: string;
  brandId?: number;
  need?: string;
  limit?: number;
}
