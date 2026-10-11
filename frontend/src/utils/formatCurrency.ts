/**
 * Currency formatting utility.
 * Module-scoped Intl.NumberFormat to avoid re-allocating instances on every render.
 */

const vndFormatter = new Intl.NumberFormat('vi-VN');

export function formatVND(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0₫';
  }
  return `${vndFormatter.format(value)}₫`;
}
