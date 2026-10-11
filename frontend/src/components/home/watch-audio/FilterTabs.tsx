'use client';

import React, { useRef } from 'react';
import { ShowcaseTab } from '../../../config/showcase';
import styles from '../WatchAudioShowcase.module.css';

interface FilterTabsProps {
  tabs: readonly ShowcaseTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  disabled?: boolean;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  disabled = false,
}) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let targetIndex = index;

    if (e.key === 'ArrowRight') {
      targetIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (index - 1 + tabs.length) % tabs.length;
    } else {
      return;
    }

    e.preventDefault();
    tabRefs.current[targetIndex]?.focus();
    onTabChange(tabs[targetIndex].id);
  };

  return (
    <div
      className={styles.categoryTabs}
      role="tablist"
      aria-label="Danh mục Đồng hồ và Âm thanh"
    >
      {tabs.map((tab, index) => {
        const isSelected = activeTabId === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            id={`showcase-tab-${tab.id}`}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`showcase-panel-${tab.id}`}
            tabIndex={isSelected ? 0 : -1}
            className={`${styles.tabBtn} ${isSelected ? styles.activeTab : ''}`}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={disabled}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
