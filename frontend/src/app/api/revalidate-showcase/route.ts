import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import crypto from 'crypto';
import { SHOWCASE_CONFIG } from '@/config/showcase';

/**
 * Constant-time string comparison using crypto.timingSafeEqual
 * to prevent timing side-channel attacks.
 */
function secureCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) {
    // Prevent timing side-channel on length disparity
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Route handler to purge the showcase cache on-demand.
 * Security enforcement:
 * 1. ONLY accepts secret through HTTP headers ('x-revalidate-secret' or 'authorization: Bearer <secret>').
 * 2. Completely removes / ignores query param '?secret='.
 * 3. Compares secrets in constant time using crypto.timingSafeEqual.
 */
export async function POST(req: NextRequest) {
  try {
    const envSecret = process.env.REVALIDATE_SECRET;
    if (!envSecret) {
      return NextResponse.json(
        {
          revalidated: false,
          message: 'SERVER CONFIG ERROR: REVALIDATE_SECRET is not configured on the server.',
        },
        { status: 500 }
      );
    }

    // Only accept secret via header (reject any query parameter)
    const headerSecret = req.headers.get('x-revalidate-secret');
    const authHeader = req.headers.get('authorization');
    const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const providedSecret = (headerSecret || bearerSecret || '').trim();

    if (!providedSecret || !secureCompare(providedSecret, envSecret.trim())) {
      return NextResponse.json(
        {
          revalidated: false,
          message: 'UNAUTHORIZED: Missing or invalid secret header.',
        },
        { status: 401 }
      );
    }

    revalidateTag(SHOWCASE_CONFIG.CACHE_TAG);
    return NextResponse.json({
      revalidated: true,
      tag: SHOWCASE_CONFIG.CACHE_TAG,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        revalidated: false,
        message: 'Error revalidating showcase cache',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
