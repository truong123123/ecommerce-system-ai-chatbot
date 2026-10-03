import React from 'react';
import { Metadata } from 'next';
import { CategoryListingPage } from '../../../components/category/CategoryListingPage';

interface PageProps {
  params: {
    categorySlug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const titleCategory = params.categorySlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${titleCategory} chính hãng giá tốt, trả góp 0% | truongngstore`,
    description: `Mua sắm ${titleCategory} chính hãng, giá cạnh tranh nhất thị trường, hỗ trợ trả góp 0% tại truongngstore.`,
  };
}

export default function CategoryPage({ params }: PageProps) {
  return <CategoryListingPage categorySlug={params.categorySlug} />;
}
