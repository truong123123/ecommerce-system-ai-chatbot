import { describe, it, expect } from 'vitest';
import { validateApiBaseUrl } from '../lib/env';

describe('env: validateApiBaseUrl', () => {
  it('falls back to default localhost URL in development when no env variable is set', () => {
    const url = validateApiBaseUrl({
      NODE_ENV: 'development',
    });
    expect(url).toBe('http://localhost:8080/api/v1');
  });

  it('preserves provided API URL in development', () => {
    const url = validateApiBaseUrl({
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: 'http://custom-dev:8080/api/v1/',
    });
    expect(url).toBe('http://custom-dev:8080/api/v1');
  });

  it('throws critical error in production when API URL is missing', () => {
    expect(() =>
      validateApiBaseUrl({
        NODE_ENV: 'production',
      })
    ).toThrowError(/CRITICAL CONFIG ERROR/);
  });

  it('blocks localhost URLs in production when ALLOW_LOCAL_API is not enabled', () => {
    expect(() =>
      validateApiBaseUrl({
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://localhost:8080/api/v1',
      })
    ).toThrowError(/INSECURE CONFIG ERROR/);

    expect(() =>
      validateApiBaseUrl({
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8080/api/v1',
        ALLOW_LOCAL_API: 'false',
      })
    ).toThrowError(/INSECURE CONFIG ERROR/);
  });

  it('allows localhost in production when ALLOW_LOCAL_API=true is deliberately configured', () => {
    const url = validateApiBaseUrl({
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'http://localhost:8080/api/v1/',
      ALLOW_LOCAL_API: 'true',
    });
    expect(url).toBe('http://localhost:8080/api/v1');
  });

  it('accepts legitimate production domains without requiring ALLOW_LOCAL_API', () => {
    const url = validateApiBaseUrl({
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://api.truongstore.com/api/v1',
    });
    expect(url).toBe('https://api.truongstore.com/api/v1');
  });
});
