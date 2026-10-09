'use client';

import React, { useState, useEffect } from 'react';
import styles from './ProductPickerModal.module.css';
import { productService, ProductItem } from '../../services/productService';
import { X } from 'lucide-react';

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: ProductItem) => void;
}

export const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const loadProds = async () => {
      setIsLoading(true);
      try {
        const list = await productService.fetchProducts({ activeOnly: true });
        setProducts(list);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadProds();
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (val: number) => val.toLocaleString('vi-VN') + 'đ';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Chọn sản phẩm từ kho cho Flash Sale</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.productList}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
              Đang tải danh sách sản phẩm...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            filtered.map((prod) => (
              <div
                key={prod.id}
                className={styles.productRow}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prod.primaryImage || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=100'}
                  alt={prod.name}
                  className={styles.productThumb}
                />
                <div className={styles.productDetails}>
                  <div className={styles.productName}>{prod.name}</div>
                  <div className={styles.productPrice}>{formatPrice(prod.price)}</div>
                </div>
                <button className={styles.selectBtn}>Chọn</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
