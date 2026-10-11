import { describe, it, expect } from 'vitest';
import { formatVND } from '../utils/formatCurrency';

describe('formatVND utility', () => {
  it('formats positive integers correctly with Vietnamese separator and symbol', () => {
    const formatted = formatVND(11490000);
    // Matches 11.490.000₫ (handles regular or non-breaking spaces)
    expect(formatted.replace(/\s/g, '')).toBe('11.490.000₫');
  });

  it('formats 0 correctly', () => {
    const formatted = formatVND(0);
    expect(formatted.replace(/\s/g, '')).toBe('0₫');
  });

  it('handles invalid numbers safely without throwing errors', () => {
    expect(formatVND(NaN)).toBe('0₫');
    expect(formatVND(undefined as unknown as number)).toBe('0₫');
    expect(formatVND(null as unknown as number)).toBe('0₫');
  });
});
