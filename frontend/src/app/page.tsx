import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { FlashSale } from '../components/home/FlashSale';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { AccessoryShowcase } from '../components/home/AccessoryShowcase';
import { LaptopShowcase } from '../components/home/LaptopShowcase';
import { WatchAudioShowcase } from '../components/home/WatchAudioShowcase';
import { Experience5T } from '../components/navigation/Experience5T';
import { AiChatbox } from '../components/chat/AiChatbox';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f4f6f8', paddingBottom: '16px' }}>
      {/* 1. Dynamic Hero Banner Slider (kết nối API Backend) */}
      <HeroBanner />

      {/* 2. Khung chiến dịch Flash Sale */}
      <FlashSale />

      {/* 3. Khung chuyên mục Điện thoại / Máy tính bảng (CellphoneS Style) */}
      <CategoryShowcase />

      {/* 4. Khung chuyên mục Sắm thêm phụ kiện chất lượng (18 danh mục) */}
      <AccessoryShowcase />

      {/* 5. Khung chuyên mục Laptop / Màn hình / PC (CellphoneS Style) */}
      <LaptopShowcase />

      {/* 6. Khung chuyên mục Đồng hồ / Âm thanh (CellphoneS Style) */}
      <WatchAudioShowcase />

      {/* 7. Khung Trải nghiệm mua sắm 5T */}
      <Experience5T />

      {/* AI Assistant Chat Widget */}
      <AiChatbox />
    </main>
  );
}
