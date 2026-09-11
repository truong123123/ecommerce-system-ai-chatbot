export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  image: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}
