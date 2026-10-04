import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${backendUrl}/flash-sales/active`, {
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
