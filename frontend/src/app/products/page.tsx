import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: {
    categorySlug?: string;
    brandSlug?: string;
    brandId?: string;
    keyword?: string;
  };
}

export default function ProductsPage({ searchParams }: PageProps) {
  const { categorySlug, brandSlug } = searchParams;

  if (categorySlug && brandSlug) {
    redirect(`/category/${encodeURIComponent(categorySlug)}/${encodeURIComponent(brandSlug)}`);
  }

  if (categorySlug) {
    redirect(`/category/${encodeURIComponent(categorySlug)}`);
  }

  // Mặc định chuyển hướng sang danh mục phổ biến nhất
  redirect('/category/phone-tablet');
}
