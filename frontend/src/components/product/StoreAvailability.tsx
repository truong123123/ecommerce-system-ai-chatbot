'use client';

import React, { useState } from 'react';
import { MapPin, Phone, ExternalLink, ChevronDown, CheckCircle } from 'lucide-react';
import { StoreLocation } from '../../types/productDetail';
import { productDetailService } from '../../services/productDetailService';
import styles from './StoreAvailability.module.css';

interface StoreAvailabilityProps {
  stores: StoreLocation[];
}

export const StoreAvailability: React.FC<StoreAvailabilityProps> = ({ stores }) => {
  const provinces = productDetailService.getProvinces(stores);
  const [selectedProvince, setSelectedProvince] = useState<string>(provinces[0] || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tất cả');

  // If stores list is completely empty
  if (!stores || stores.length === 0) {
    return (
      <div className={styles.storeSection}>
        <div className={styles.headerRow}>
          <div className={styles.titleWrap}>
            <MapPin size={16} className={styles.mapIcon} />
            <h3 className={styles.title}>Xem chi nhánh có hàng</h3>
          </div>
        </div>
        <div className={styles.emptyNote}>
          Chưa có thông tin tồn kho tại cửa hàng cho sản phẩm này. Quý khách vui lòng đặt hàng trực tuyến hoặc liên hệ hotline để được hỗ trợ.
        </div>
      </div>
    );
  }

  const currentProvince = provinces.includes(selectedProvince) ? selectedProvince : (provinces[0] || '');
  const availableDistricts = ['Tất cả', ...productDetailService.getDistricts(stores, currentProvince)];

  const filteredStores = stores.filter((s) => {
    const matchProv = !currentProvince || s.province.toLowerCase() === currentProvince.toLowerCase();
    const matchDist = selectedDistrict === 'Tất cả' || s.district.toLowerCase() === selectedDistrict.toLowerCase();
    return matchProv && matchDist;
  });

  return (
    <div className={styles.storeSection}>
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <MapPin size={16} className={styles.mapIcon} />
          <h3 className={styles.title}>Xem chi nhánh có hàng</h3>
        </div>
        <span className={styles.countBadge}>
          Có <strong>{filteredStores.length}</strong> cửa hàng có hàng
        </span>
      </div>

      {/* Location Dropdowns */}
      <div className={styles.filterRow}>
        <div className={styles.selectWrapper}>
          <select
            className={styles.selectBox}
            value={currentProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setSelectedDistrict('Tất cả');
            }}
          >
            {provinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className={styles.dropdownIcon} />
        </div>

        <div className={styles.selectWrapper}>
          <select
            className={styles.selectBox}
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            {availableDistricts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className={styles.dropdownIcon} />
        </div>
      </div>

      {/* Stores List */}
      <div className={styles.storesList}>
        {filteredStores.length === 0 ? (
          <div className={styles.emptyNote}>
            Tạm thời hết hàng tại khu vực này. Quý khách vui lòng chọn khu vực lân cận hoặc đặt giao hàng 2h.
          </div>
        ) : (
          filteredStores.map((store) => (
            <div key={store.id} className={styles.storeCard}>
              <div className={styles.storeMain}>
                <div className={styles.storeAddressRow}>
                  <CheckCircle size={14} className={styles.inStockIcon} />
                  <span className={styles.storeAddress}>{store.address}</span>
                </div>
                <div className={styles.storeActions}>
                  <a href={`tel:${store.phone}`} className={styles.phoneLink}>
                    <Phone size={12} />
                    <span>{store.phone}</span>
                  </a>
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLink}
                  >
                    <MapPin size={12} />
                    <span>Bản đồ</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
              <span className={styles.stockBadge}>Còn {store.stockCount} máy</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
