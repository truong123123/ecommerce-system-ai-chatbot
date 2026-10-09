'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { storeService, StoreItem } from '../../services/storeService';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import styles from './stores.module.css';

export default function StoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('Tất cả');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [provList, storeList] = await Promise.all([
          storeService.getProvinces(),
          storeService.getStores(),
        ]);
        setProvinces(provList);
        setStores(storeList);
      } catch (err) {
        console.error('Failed to load stores:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Compute districts for selected province
  const availableDistricts = useMemo(() => {
    if (selectedProvince === 'Tất cả') return [];
    const set = new Set<string>();
    stores.forEach((s) => {
      if (s.province === selectedProvince && s.district) {
        set.add(s.district);
      }
    });
    return Array.from(set);
  }, [stores, selectedProvince]);

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      if (selectedProvince !== 'Tất cả' && s.province !== selectedProvince) return false;
      if (selectedDistrict !== 'Tất cả' && s.district !== selectedDistrict) return false;
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchName = s.name.toLowerCase().includes(kw);
        const matchAddr = s.address.toLowerCase().includes(kw);
        const matchPhone = s.phone ? s.phone.includes(kw) : false;
        if (!matchName && !matchAddr && !matchPhone) return false;
      }
      return true;
    });
  }, [stores, selectedProvince, selectedDistrict, searchKeyword]);

  return (
    <main className={styles.pageContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Hệ thống Cửa hàng Toàn quốc</h1>
          <p className={styles.subtitle}>
            Tìm kiếm trung tâm mua sắm, trải nghiệm sản phẩm và bảo hành chính hãng gần bạn nhất
          </p>
        </div>

        {/* Filter Card */}
        <div className={styles.filterCard}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Nhập tên chi nhánh, đường, hoặc quận huyện..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.selectWrapper}>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedDistrict('Tất cả');
              }}
              className={styles.selectInput}
            >
              <option value="Tất cả">Tất cả tỉnh / thành phố</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {selectedProvince !== 'Tất cả' && availableDistricts.length > 0 && (
            <div className={styles.selectWrapper}>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className={styles.selectInput}
              >
                <option value="Tất cả">Tất cả quận / huyện</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Store Results */}
        {loading ? (
          <div className={styles.emptyState}>Đang tải danh sách hệ thống chi nhánh...</div>
        ) : filteredStores.length === 0 ? (
          <div className={styles.emptyState}>
            Không tìm thấy cửa hàng nào phù hợp với bộ lọc tìm kiếm.
          </div>
        ) : (
          <div className={styles.storesGrid}>
            {filteredStores.map((s) => (
              <div key={s.storeId} className={styles.storeCard}>
                <div className={styles.storeHeader}>
                  <h3 className={styles.storeName}>{s.name}</h3>
                  <span className={styles.storeArea}>
                    {s.district ? `${s.district}, ` : ''}{s.province || 'Việt Nam'}
                  </span>
                </div>

                <div className={styles.storeInfoList}>
                  <div className={styles.infoRow}>
                    <MapPin size={16} className={styles.infoIcon} />
                    <span>{s.address}</span>
                  </div>

                  {s.phone && (
                    <div className={styles.infoRow}>
                      <Phone size={16} className={styles.infoIcon} />
                      <span>Hotline: <strong>{s.phone}</strong></span>
                    </div>
                  )}

                  {s.openHours && (
                    <div className={styles.infoRow}>
                      <Clock size={16} className={styles.infoIcon} />
                      <span>Mở cửa: {s.openHours}</span>
                    </div>
                  )}
                </div>

                <div className={styles.actions}>
                  {s.phone && (
                    <a href={`tel:${s.phone.replace(/\s+/g, '')}`} className={styles.callBtn}>
                      <Phone size={14} />
                      <span>Gọi ngay</span>
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${s.name} ${s.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapBtn}
                  >
                    <Navigation size={14} />
                    <span>Chỉ đường</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
  );
}
