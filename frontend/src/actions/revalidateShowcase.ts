'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { SHOWCASE_CONFIG } from '../config/showcase';
import { API_BASE_URL } from '../lib/env';

export interface RevalidateResult {
  success: boolean;
  timestamp?: number;
  error?: string;
}

/**
 * Server Action to revalidate the showcase cache.
 * Security requirements:
 * 1. DOES NOT trust the client-set `user_role` cookie.
 * 2. DOES NOT rely on unverified client-side JWT payload decoding.
 * 3. Authenticates directly with backend Spring Boot `GET /auth/me` with Bearer token.
 * 4. Only proceeds if backend confirms role is strictly 'ADMIN' (case-insensitive).
 * 5. Strictly blocks execution across all environments if unauthenticated;
 *    supports deliberate secretToken matching process.env.REVALIDATE_SECRET.
 * 6. Uses await for cookies() for forward-compatibility (Next.js version: 14.1.0).
 */
export async function revalidateShowcaseAction(secretToken?: string): Promise<RevalidateResult> {
  try {
    // Next.js 14.1.0 cookies() wrapped with Promise.resolve for Next 15+ async compatibility
    const cookieStore = await Promise.resolve(cookies());
    const token = cookieStore.get('auth_token')?.value || cookieStore.get('token')?.value;

    const envSecret = process.env.REVALIDATE_SECRET;
    const isSecretAuthorized = Boolean(
      envSecret && secretToken && secretToken.trim() === envSecret.trim()
    );

    let isVerifiedAdmin = false;

    // Verify authentication against backend Spring Boot endpoint GET /auth/me
    if (token) {
      try {
        const verifyRes = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (verifyRes.ok) {
          const userData = await verifyRes.json();
          if (userData && String(userData.role).toUpperCase() === 'ADMIN') {
            isVerifiedAdmin = true;
          }
        }
      } catch {
        // Backend connection failure -> fail closed
        isVerifiedAdmin = false;
      }
    }

    // Block execution in all environments if neither verified admin nor valid secret
    if (!isVerifiedAdmin && !isSecretAuthorized) {
      return {
        success: false,
        error:
          'UNAUTHORIZED: Yêu cầu quyền quản trị viên (ADMIN) đã xác thực qua backend hoặc REVALIDATE_SECRET hợp lệ.',
      };
    }

    revalidateTag(SHOWCASE_CONFIG.CACHE_TAG);
    return { success: true, timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to revalidate showcase cache:', error);
    return { success: false, error: (error as Error).message };
  }
}
