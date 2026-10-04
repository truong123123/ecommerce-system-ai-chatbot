import React from 'react';
import styles from './FlashSale.module.css';

interface FlashSaleDaysProps {
  dates: Array<{ date: string; isEnded: boolean }>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const FlashSaleDays: React.FC<FlashSaleDaysProps> = React.memo(
  ({ dates, selectedDate, onSelectDate }) => {
    if (!dates || dates.length <= 1) {
      return null;
    }

    return (
      <div className={styles.topDateTabs} role="tablist" aria-label="Danh sách ngày Flash Sale">
        {dates.map(({ date, isEnded }) => {
          const isActive = selectedDate === date;
          return (
            <button
              key={date}
              role="tab"
              aria-selected={isActive}
              aria-label={`Khung giờ ngày ${date}${isEnded ? ' (Đã kết thúc)' : ''}`}
              title={isEnded ? `Ngày ${date} đã kết thúc các khung giờ - Nhấn để xem lại sản phẩm` : `Xem khung giờ ngày ${date}`}
              className={`${styles.dateTab} ${
                isActive
                  ? styles.dateTabActive
                  : isEnded
                  ? styles.dateTabEnded
                  : styles.dateTabInactive
              }`}
              onClick={() => onSelectDate(date)}
            >
              <span>{date}</span>
              {isEnded && <span style={{ fontSize: '11px', fontWeight: 600 }}>(Đã qua)</span>}
            </button>
          );
        })}
      </div>
    );
  }
);

FlashSaleDays.displayName = 'FlashSaleDays';
