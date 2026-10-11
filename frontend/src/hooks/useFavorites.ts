'use client';

import { useState, useEffect, useCallback } from 'react';

export const FAVORITES_STORAGE_KEY = 'user_favorite_products_v1';
export const LEGACY_STORAGE_KEY = 'user_favorites';

/**
 * Migrates legacy favorites from 'user_favorites' to 'user_favorite_products_v1'.
 * Pure helper function, safe for client-side storage execution.
 */
export function migrateLegacyFavorites(storage: Storage): Record<string, boolean> {
  let currentFavs: Record<string, boolean> = {};

  try {
    const currentRaw = storage.getItem(FAVORITES_STORAGE_KEY);
    if (currentRaw) {
      const parsed = JSON.parse(currentRaw);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        currentFavs = parsed;
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  try {
    const legacyRaw = storage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw);
      if (typeof parsedLegacy === 'object' && parsedLegacy !== null && !Array.isArray(parsedLegacy)) {
        let hasNewMigration = false;
        const merged = { ...currentFavs };

        for (const [key, value] of Object.entries(parsedLegacy)) {
          const strKey = String(key);
          if (value && merged[strKey] === undefined) {
            merged[strKey] = true;
            hasNewMigration = true;
          }
        }

        if (hasNewMigration) {
          currentFavs = merged;
          storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(currentFavs));
        }
      }
      // Clean up legacy key after one-time migration
      storage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    storage.removeItem(LEGACY_STORAGE_KEY);
  }

  return currentFavs;
}

/**
 * Custom hook for persisting favorite products.
 * Guarantees zero SSR hydration mismatches by initializing empty and hydrating only on client mount.
 * Automatically performs one-time migration from legacy 'user_favorites' key.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Read from localStorage strictly after client-side hydration & migrate legacy data
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const migrated = migrateLegacyFavorites(window.localStorage);
        setFavorites(migrated);
      }
    } catch {
      // Ignore storage errors in private browsing modes
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      const nextState = { ...prev, [productId]: !prev[productId] };
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextState));
        }
      } catch {
        // Handle storage quota exceeded safely
      }
      return nextState;
    });
  }, []);

  const isFavorite = useCallback(
    (productId: string): boolean => {
      if (!isHydrated) return false;
      return Boolean(favorites[productId]);
    },
    [favorites, isHydrated]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isHydrated,
  };
}
