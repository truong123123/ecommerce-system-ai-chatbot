import React from 'react';
import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Thanh toán đơn hàng | truongngstore',
  description: 'Xác nhận thông tin giao hàng và chọn phương thức thanh toán an toàn tại truongngstore.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
