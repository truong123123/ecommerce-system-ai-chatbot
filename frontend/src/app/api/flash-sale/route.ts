import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/flash-sales/active`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!res.ok || res.status === 204) {
      return NextResponse.json({
        campaign: null,
        serverTime: new Date().toISOString(),
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({
      campaign: null,
      serverTime: new Date().toISOString(),
    });
  }
}
