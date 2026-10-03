'use client';

import React, { useState } from 'react';
import { Sliders, ChevronRight, X, Cpu, HardDrive, Monitor, BatteryCharging } from 'lucide-react';
import { ProductSpecRow } from '../../types/productDetail';
import styles from './ProductSpecs.module.css';

interface ProductSpecsProps {
  specs: ProductSpecRow[];
  productName: string;
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({ specs, productName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Show top 8 specs initially if not expanded
  const displaySpecs = isExpanded ? specs : specs.slice(0, 8);

  return (
    <div id="product-specs-section" className={styles.specsContainer}>
      <div className={styles.headerRow}>
        <h3 className={styles.sectionTitle}>
          <Sliders size={18} className={styles.titleIcon} />
          <span>Thông số kỹ thuật</span>
        </h3>
        <button
          type="button"
          className={styles.viewDetailLink}
          onClick={() => setIsModalOpen(true)}
        >
          <span>Xem chi tiết</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {(!specs || specs.length === 0) ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          Đang cập nhật bảng thông số kỹ thuật chi tiết cho sản phẩm này
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.specsTable}>
            <tbody>
              {displaySpecs.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? styles.evenRow : styles.oddRow}>
                  <td className={styles.labelCol}>{row.label}</td>
                  <td className={styles.valueCol}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {specs.length > 8 && (
        <button
          type="button"
          className={styles.expandBtn}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{isExpanded ? 'Thu gọn thông số' : 'Xem thêm cấu hình chi tiết'}</span>
          <ChevronRight size={15} className={isExpanded ? styles.iconRotate : ''} />
        </button>
      )}

      {/* Full Specs Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Bảng thông số kỹ thuật chi tiết</h4>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.productSub}>{productName}</p>
              <table className={styles.modalTable}>
                <tbody>
                  {specs.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? styles.evenRow : styles.oddRow}>
                      <td className={styles.labelCol}>{row.label}</td>
                      <td className={styles.valueCol}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.closeActionBtn}
                onClick={() => setIsModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
