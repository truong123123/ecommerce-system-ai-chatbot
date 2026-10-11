import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { revalidateShowcaseAction } from '../actions/revalidateShowcase';

// Mock Next.js headers and cache
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

describe('revalidateShowcaseAction authentication & authorization', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, REVALIDATE_SECRET: 'test-secret-123' };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('successfully revalidates cache when backend confirms user has ADMIN role', async () => {
    // Mock cookies returning auth_token
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'auth_token') return { value: 'valid-jwt-token' };
        return undefined;
      }),
    } as any);

    // Mock backend returning 200 OK with role: "admin"
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@store.com',
        role: 'admin',
        userType: 'staff',
      }),
    } as any);

    const result = await revalidateShowcaseAction();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer valid-jwt-token' },
      })
    );
    expect(revalidateTag).toHaveBeenCalledWith('showcase');
    expect(result.success).toBe(true);
  });

  it('rejects revalidation when backend returns non-admin role (e.g., customer or sales)', async () => {
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'auth_token') return { value: 'customer-token' };
        return undefined;
      }),
    } as any);

    // Mock backend returning customer role
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: 2,
        name: 'Regular Customer',
        email: 'customer@store.com',
        role: 'customer',
        userType: 'customer',
      }),
    } as any);

    const result = await revalidateShowcaseAction();

    expect(revalidateTag).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toContain('UNAUTHORIZED');
  });

  it('rejects revalidation when backend returns 401 Unauthorized or network error', async () => {
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'auth_token') return { value: 'expired-token' };
        return undefined;
      }),
    } as any);

    // Mock backend returning 401 error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ message: 'Token không hợp lệ' }),
    } as any);

    const result = await revalidateShowcaseAction();

    expect(revalidateTag).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toContain('UNAUTHORIZED');
  });

  it('allows revalidation when authorized via REVALIDATE_SECRET even without cookies', async () => {
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockReturnValue(undefined),
    } as any);

    const result = await revalidateShowcaseAction('test-secret-123');

    expect(revalidateTag).toHaveBeenCalledWith('showcase');
    expect(result.success).toBe(true);
  });

  it('strictly blocks revalidation when neither valid admin token nor valid secret is provided', async () => {
    vi.mocked(cookies).mockReturnValue({
      get: vi.fn().mockReturnValue(undefined),
    } as any);

    const result = await revalidateShowcaseAction('wrong-secret');

    expect(revalidateTag).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toContain('UNAUTHORIZED');
  });
});
