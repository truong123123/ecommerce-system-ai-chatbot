import { describe, it, expect, beforeEach } from 'vitest';
import {
  migrateLegacyFavorites,
  FAVORITES_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
} from '../hooks/useFavorites';

class MockStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

describe('useFavorites: migrateLegacyFavorites', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
  });

  it('migrates legacy favorites from user_favorites to user_favorite_products_v1 and removes legacy key', () => {
    mockStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({ 101: true, 102: false, 105: true })
    );

    const result = migrateLegacyFavorites(mockStorage);

    expect(result).toEqual({ '101': true, '105': true });
    expect(mockStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(
      JSON.stringify({ '101': true, '105': true })
    );
    // Legacy key must be purged
    expect(mockStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it('merges legacy favorites with existing v1 favorites without data loss', () => {
    mockStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ '200': true, '101': true })
    );
    mockStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({ '101': true, '300': true })
    );

    const result = migrateLegacyFavorites(mockStorage);

    expect(result).toEqual({ '200': true, '101': true, '300': true });
    expect(mockStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(
      JSON.stringify({ '200': true, '101': true, '300': true })
    );
    expect(mockStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it('gracefully handles malformed or non-object legacy data', () => {
    mockStorage.setItem(LEGACY_STORAGE_KEY, '{invalid-json');

    const result = migrateLegacyFavorites(mockStorage);

    expect(result).toEqual({});
    expect(mockStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it('does nothing when no legacy favorites key exists', () => {
    mockStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ '50': true }));

    const result = migrateLegacyFavorites(mockStorage);

    expect(result).toEqual({ '50': true });
    expect(mockStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });
});
