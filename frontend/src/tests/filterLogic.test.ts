import { describe, it, expect } from 'vitest';

/**
 * Filter URL Parameter logic test.
 * Simulates synchronization of searchParams when switching tabs, brands, and clearing filters.
 */
describe('Showcase filter URL parameter builder logic', () => {
  function buildFilterQuery(
    currentParams: Record<string, string>,
    action: { key: string; value: string | null }
  ): Record<string, string> {
    const next = { ...currentParams };

    if (!action.value || action.value === 'Tất cả' || action.value === 'all') {
      delete next[action.key];
    } else {
      next[action.key] = action.value;
    }

    // Reset brand when switching category tab
    if (action.key === 'tab') {
      delete next['brand'];
      delete next['need'];
    }

    return next;
  }

  it('sets tab and clears brand/need filters when switching category tabs', () => {
    const initial = { tab: 'dong-ho', brand: 'Apple', need: 'sport' };
    const result = buildFilterQuery(initial, { key: 'tab', value: 'am-thanh' });

    expect(result).toEqual({ tab: 'am-thanh' });
    expect(result.brand).toBeUndefined();
    expect(result.need).toBeUndefined();
  });

  it('updates brand filter while keeping the current tab intact', () => {
    const initial = { tab: 'dong-ho' };
    const result = buildFilterQuery(initial, { key: 'brand', value: 'Garmin' });

    expect(result).toEqual({ tab: 'dong-ho', brand: 'Garmin' });
  });

  it('removes brand parameter when "Tất cả" is selected', () => {
    const initial = { tab: 'dong-ho', brand: 'Garmin' };
    const result = buildFilterQuery(initial, { key: 'brand', value: 'Tất cả' });

    expect(result).toEqual({ tab: 'dong-ho' });
  });
});
