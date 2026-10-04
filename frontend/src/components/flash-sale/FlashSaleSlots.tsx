import React from 'react';
import styles from './FlashSale.module.css';
import { FlashSaleSlot } from '../../types/flashSale';
import { formatSlotLabel, computeSlotStatus } from '../../utils/flashSaleTime';

interface FlashSaleSlotsProps {
  slots: FlashSaleSlot[];
  selectedSlotId: number | null;
  onSelectSlot: (slotId: number) => void;
  nowMs: number;
}

export const FlashSaleSlots: React.FC<FlashSaleSlotsProps> = React.memo(
  ({ slots, selectedSlotId, onSelectSlot, nowMs }) => {
    if (!slots || slots.length === 0) {
      return null;
    }

    return (
      <div className={styles.timeSlotTabs} role="tablist" aria-label="Danh sách khung giờ Flash Sale">
        {slots.map((slot) => {
          const start = slot.start || slot.startTime || '';
          const end = slot.end || slot.endTime || '';
          const label = slot.label || formatSlotLabel(start, end);
          const isSelected = slot.id === selectedSlotId;
          const status = computeSlotStatus(start, end, nowMs);
          const isEnded = status === 'ENDED';

          let statusText = '';
          if (status === 'ACTIVE') {
            statusText = '🔥 Đang diễn ra';
          } else if (status === 'UPCOMING') {
            statusText = '🕒 Sắp diễn ra';
          } else {
            statusText = '⌛ Đã kết thúc';
          }

          return (
            <button
              key={slot.id}
              role="tab"
              aria-selected={isSelected}
              aria-label={`${label} - ${statusText}`}
              title={`${label} - ${statusText}`}
              className={`${styles.slotTab} ${
                isSelected
                  ? styles.slotTabActive
                  : isEnded
                  ? styles.slotTabEnded
                  : styles.slotTabInactive
              }`}
              onClick={() => onSelectSlot(slot.id)}
            >
              <span>{label}</span>
              {status === 'ACTIVE' && (
                <span style={{ fontSize: '11px', marginLeft: '3px' }}>🔥</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

FlashSaleSlots.displayName = 'FlashSaleSlots';
