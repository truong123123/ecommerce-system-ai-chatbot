import React from 'react';
import { Metadata } from 'next';
import { CategoryListingPage } from '../../../../components/category/CategoryListingPage';

interface PageProps {
  params: {
    categorySlug: string;
    brandSlug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cat = params.categorySlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const brand = params.brandSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${cat} ${brand} chính hãng giá tốt, trả góp 0% | truongngstore`,
    description: `Mua sắm các sản phẩm ${cat} từ thương hiệu ${brand} chính hãng, cam kết chất lượng, bảo hành uy tín tại truongngstore.`,
  };
}

export default function CategoryBrandPage({ params }: PageProps) {
  return (
    <CategoryListingPage
      categorySlug={params.categorySlug}
      brandSlug={params.brandSlug}
    />
  );
}
