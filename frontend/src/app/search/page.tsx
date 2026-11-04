import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Search, Sparkles, ShoppingBag } from 'lucide-react';
import { productService, ProductItem } from '@/services/productService';
import { ProductCard, SharedProduct } from '@/components/common/ProductCard';
import { getCloudinaryTransformedUrl } from '@/utils/image';

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams?.q || '';
  return {
    title: query ? `Tìm kiếm: "${query}" | truongngstore` : 'Tìm kiếm sản phẩm | truongngstore',
    description: `Kết quả tìm kiếm sản phẩm cho từ khóa "${query}" tại hệ thống bán lẻ truongngstore.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = (searchParams?.q || '').trim();
  let products: ProductItem[] = [];

  if (query) {
    try {
      products = await productService.fetchProducts({ keyword: query, activeOnly: true });
    } catch {
      products = [];
    }
  }

  const sharedProducts: SharedProduct[] = products.map((p) => ({
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    brand: p.brandName,
    category: p.categoryName,
    image: getCloudinaryTransformedUrl(p.primaryImage || (p.images && p.images[0])),
    price: p.price || 0,
    oldPrice: p.maxPrice && p.maxPrice > p.price ? p.maxPrice : null,
    discountPercent:
      p.maxPrice && p.maxPrice > p.price
        ? Math.round(((p.maxPrice - p.price) / p.maxPrice) * 100)
        : null,
    rating: 4.8,
    reviewCount: 24,
    installmentText: 'Trả góp 0%',
  }));

  return (
    <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px 64px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
        <Link href="/" style={{ color: '#0071e3', textDecoration: 'none' }}>Trang chủ</Link>
        <span>/</span>
        <span>Tìm kiếm</span>
        {query && (
          <>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>&ldquo;{query}&rdquo;</span>
          </>
        )}
      </div>

      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={22} color="#0071e3" />
          <span>Kết quả tìm kiếm cho: &ldquo;{query || 'Tất cả'}&rdquo;</span>
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          Tìm thấy <strong>{products.length}</strong> sản phẩm phù hợp
        </p>
      </div>

      {/* Grid or Empty */}
      {sharedProducts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          {sharedProducts.map((sp) => (
            <ProductCard key={sp.id} product={sp} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#f8fafc',
          borderRadius: '16px',
          border: '1px dashed #cbd5e1',
          margin: '20px 0',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <ShoppingBag size={30} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
            Không tìm thấy sản phẩm phù hợp với &ldquo;{query}&rdquo;
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Vui lòng thử lại với từ khóa khác hoặc tham khảo các danh mục sản phẩm nổi bật bên dưới.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                background: '#0071e3',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <Sparkles size={14} />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

