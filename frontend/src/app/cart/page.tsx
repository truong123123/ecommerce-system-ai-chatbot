import React from 'react';
import { Metadata } from 'next';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: 'Giỏ hàng của bạn | truongngstore',
  description: 'Xem lại danh sách sản phẩm và hoàn tất đơn hàng với nhiều ưu đãi độc quyền tại truongngstore.',
};

export default function CartPage() {
  return <CartClient />;
}
