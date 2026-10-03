'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FullProductDetail } from '../../../types/productDetail';
import { productDetailService } from '../../../services/productDetailService';
import { useCartStore } from '../../../store/cartStore';

// Components
import { ProductBreadcrumb } from '../../../components/product/ProductBreadcrumb';
import { ProductHeader } from '../../../components/product/ProductHeader';
import { ProductGallery } from '../../../components/product/ProductGallery';
import { ProductCommitments } from '../../../components/product/ProductCommitments';
import { ProductSpecs } from '../../../components/product/ProductSpecs';
import { ProductPricing } from '../../../components/product/ProductPricing';
import { ProductVariants } from '../../../components/product/ProductVariants';
import { ProductPromotions } from '../../../components/product/ProductPromotions';
import { InstallmentBanner } from '../../../components/product/InstallmentBanner';
import { PaymentOffers } from '../../../components/product/PaymentOffers';
import { StoreAvailability } from '../../../components/product/StoreAvailability';
import { ShippingInfo } from '../../../components/product/ShippingInfo';
import { ProductBundles } from '../../../components/product/ProductBundles';
import { ProductWarranty } from '../../../components/product/ProductWarranty';
import { ProductActionButtons } from '../../../components/product/ProductActionButtons';
import { ProductReviews } from '../../../components/product/ProductReviews';

import styles from './ProductDetail.module.css';

interface ProductDetailClientProps {
  initialProduct: FullProductDetail;
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ initialProduct }) => {
  const [product] = useState<FullProductDetail>(initialProduct);
  const router = useRouter();
  const addItemToCart = useCartStore((state) => state.addItem);

  // Variant selection states
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id || '');
  const [selectedConfigId, setSelectedConfigId] = useState<string>(product.configurations[0]?.id || '');
  const [selectedWarrantyId, setSelectedWarrantyId] = useState<string | null>(null);
  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>([]);

  // UI Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Dynamic price calculation
  const currentConfig = product.configurations.find((c) => c.id === selectedConfigId);
  const basePrice = currentConfig ? currentConfig.price : product.price;
  const originalPrice = currentConfig?.oldPrice || product.originalPrice;

  // Selected warranty price
  const selectedWarranty = product.warranties.find((w) => w.id === selectedWarrantyId);
  const warrantyPrice = selectedWarranty ? selectedWarranty.price : 0;

  // Selected bundles price
  const bundlesPrice = product.bundles
    .filter((b) => selectedBundleIds.includes(b.id))
    .reduce((sum, b) => sum + b.bundlePrice, 0);

  const totalPrice = basePrice + warrantyPrice + bundlesPrice;

  // Installment calculated dynamically (12 months 0% interest)
  const monthlyInstallment = productDetailService.calculateInstallmentMonthly(totalPrice, 12, 0);

  const handleToggleBundle = (bundleId: string) => {
    setSelectedBundleIds((prev) =>
      prev.includes(bundleId) ? prev.filter((id) => id !== bundleId) : [...prev, bundleId]
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const vId = Number(selectedVariantId) || Number(product.variants[0]?.id) || 1;
      const primaryVariant =
        product.variants?.find((v: any) => Number(v.id) === vId) || product.variants?.[0];
      const itemPrice = Number(primaryVariant?.price || product.price);
      const originalPrice = Number(
        product.originalPrice || (primaryVariant?.price ? primaryVariant.price * 1.12 : itemPrice)
      );
      const discount = Math.max(0, originalPrice - itemPrice);

      await addItemToCart(vId, 1, Number(product.id), {
        name: product.name + (primaryVariant?.sku ? ` - ${primaryVariant.sku}` : ''),
        sku: primaryVariant?.sku || `SKU-${vId}`,
        slug: product.slug,
        imageUrl:
          product.images?.[0] ||
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
        price: itemPrice,
        originalPrice: originalPrice,
        discountAmount: discount,
        stockQuantity: primaryVariant?.stock ?? 20,
        inStock: (primaryVariant?.stock ?? 20) > 0,
      });
      showToast('Đã thêm sản phẩm vào giỏ hàng thành công! 🛒');
    } catch (err: any) {
      showToast(err.message || 'Không thể thêm sản phẩm');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      const vId = Number(selectedVariantId) || Number(product.variants[0]?.id) || 1;
      const primaryVariant =
        product.variants?.find((v: any) => Number(v.id) === vId) || product.variants?.[0];
      const itemPrice = Number(primaryVariant?.price || product.price);
      const originalPrice = Number(
        product.originalPrice || (primaryVariant?.price ? primaryVariant.price * 1.12 : itemPrice)
      );
      const discount = Math.max(0, originalPrice - itemPrice);

      await addItemToCart(vId, 1, Number(product.id), {
        name: product.name + (primaryVariant?.sku ? ` - ${primaryVariant.sku}` : ''),
        sku: primaryVariant?.sku || `SKU-${vId}`,
        slug: product.slug,
        imageUrl:
          product.images?.[0] ||
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
        price: itemPrice,
        originalPrice: originalPrice,
        discountAmount: discount,
        stockQuantity: primaryVariant?.stock ?? 20,
        inStock: (primaryVariant?.stock ?? 20) > 0,
      });
      router.push('/cart');
    } catch (err: any) {
      showToast(err.message || 'Không thể thêm sản phẩm');
    }
  };

  const handleInstallment = () => {
    showToast('Mở cổng đăng ký trả góp 0% qua đối tác tài chính & thẻ tín dụng');
  };

  const scrollToSpecs = () => {
    const el = document.getElementById('product-specs-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToReviews = () => {
    const el = document.getElementById('product-reviews-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toastNotification}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Breadcrumb */}
      <ProductBreadcrumb
        category={product.category}
        brand={product.brand}
        series={product.series}
        productName={product.name}
      />

      {/* Main Container */}
      <div className={styles.container}>
        {/* 2. Product Header */}
        <ProductHeader
          name={product.name}
          subtitle={product.subtitle}
          sku={product.sku}
          rating={product.rating}
          reviewsCount={product.reviewsCount}
          questionsCount={product.questionsCount}
          onScrollToSpecs={scrollToSpecs}
          onScrollToReviews={scrollToReviews}
        />

        {/* 3. Product Body: 2 Columns Layout */}
        <div className={styles.productLayout}>
          {/* Left Column: Media Gallery, Commitments, Specs, Reviews */}
          <div className={styles.leftCol}>
            {/* Gallery */}
            <ProductGallery
              images={product.images}
              productName={product.name}
              badgeText="Chính hãng 100%"
            />

            {/* Cam kết sản phẩm */}
            <ProductCommitments commitments={product.commitments} />

            {/* Thông số kỹ thuật */}
            <ProductSpecs specs={product.specs} productName={product.name} />

            {/* Đánh giá & nhận xét */}
            <ProductReviews
              reviews={product.reviews}
              overallRating={product.rating}
              totalReviews={product.reviewsCount}
              reviewBreakdown={product.reviewBreakdown}
            />
          </div>

          {/* Right Column: Pricing, Variants, Promos, Banner, Stores, Bundles, Warranties, Actions */}
          <div className={styles.rightCol}>
            {/* Price Box */}
            <ProductPricing
              price={totalPrice}
              originalPrice={originalPrice}
              discountPercent={product.discountPercent}
              monthlyInstallment={monthlyInstallment}
              studentDiscount={product.membership.studentDiscount}
              smemberDiscount={product.membership.smemberDiscount}
            />

            {/* Variant / Color & Config selectors */}
            <ProductVariants
              variants={product.variants}
              configurations={product.configurations}
              selectedVariantId={selectedVariantId}
              selectedConfigId={selectedConfigId}
              onSelectVariant={setSelectedVariantId}
              onSelectConfig={setSelectedConfigId}
            />

            {/* Khuyến mãi đi kèm */}
            <ProductPromotions
              vouchers={product.promotions.vouchers}
              bullets={product.promotions.bullets}
              tradeIn={product.promotions.tradeIn}
            />

            {/* 0% Installment Banner */}
            <InstallmentBanner />

            {/* Ưu đãi thanh toán */}
            <PaymentOffers offers={product.paymentOffers} />

            {/* Xem chi nhánh có hàng */}
            <StoreAvailability stores={product.stores} />

            {/* Thông tin vận chuyển 2h */}
            <ShippingInfo />

            {/* CTA Action Buttons */}
            <ProductActionButtons
              onBuyNow={handleBuyNow}
              onAddToCart={handleAddToCart}
              onInstallment={handleInstallment}
              isAddingToCart={isAdding}
            />

            {/* Mua kèm giá sốc (Product Bundles) */}
            <ProductBundles
              bundles={product.bundles}
              selectedBundleIds={selectedBundleIds}
              onToggleBundle={handleToggleBundle}
            />

            {/* Chọn gói dịch vụ bảo hành */}
            <ProductWarranty
              warranties={product.warranties}
              selectedWarrantyId={selectedWarrantyId}
              onSelectWarranty={setSelectedWarrantyId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
