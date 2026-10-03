import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productDetailService } from '../../../services/productDetailService';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await productDetailService.getProductDetail(params.slug);
  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | truongngstore',
      description: 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh trên hệ thống truongngstore.'
    };
  }

  return {
    title: `${product.name} | Giá tốt, trả góp 0% tại truongngstore`,
    description: `${product.name} - ${product.subtitle}. Mua ngay chính hãng, ưu đãi sinh viên HSSV, trả góp 0% lãi suất.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.images[0]?.url || '/images/products/laptops/hp_omnibook_hero.jpg',
          width: 1200,
          height: 630,
          alt: product.name
        }
      ]
    }
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await productDetailService.getProductDetail(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient initialProduct={product} />;
}
