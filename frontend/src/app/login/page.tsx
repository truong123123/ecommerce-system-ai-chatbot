'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import styles from './login.module.css';
import { authService } from '../../services/authService';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUrl = searchParams.get('from');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const session = await authService.loginWithApi(email, password);

      // Điều hướng theo vai trò (role)
      if (session.role === 'admin' || session.role === 'sales' || session.role === 'warehouse') {
        router.push(targetUrl || '/admin');
      } else {
        router.push(targetUrl && !targetUrl.startsWith('/admin') ? targetUrl : '/');
      }
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (provider: string) => {
    setError(`Đăng nhập qua ${provider} đang được kết nối. Vui lòng đăng nhập với admin@store.com hoặc customer@store.com.`);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Khung kính mờ Glassmorphism */}
      <div className={styles.glassCard}>
        {/* Logo */}
        <div className={styles.logoWrapper}>
          <span className={styles.logoText}>Your logo</span>
        </div>

        {/* Tiêu đề */}
        <h1 className={styles.title}>Login</h1>

        {error && <div className={styles.errorMsg}>{error}</div>}

        {/* Form đăng nhập */}
        <form className={styles.form} onSubmit={handleLogin}>
          {/* Email */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                className={styles.input}
                placeholder="username@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Quên mật khẩu */}
          <div className={styles.forgotRow}>
            <a href="#forgot" className={styles.forgotLink}>
              Forgot Password?
            </a>
          </div>

          {/* Nút Sign in */}
          <button type="submit" className={styles.signInBtn} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Tài khoản thử nghiệm nhanh */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('customer@store.com');
                setPassword('123456');
              }}
              style={{
                padding: '9px 12px',
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px dashed #3b82f6',
                background: 'rgba(59, 130, 246, 0.08)',
                color: '#60a5fa',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>👤 Khách hàng mẫu: <strong>customer@store.com</strong></span>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>(123456)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@store.com');
                setPassword('admin123');
              }}
              style={{
                padding: '9px 12px',
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px dashed #ef4444',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#f87171',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>🛡️ Quản trị viên: <strong>admin@store.com</strong></span>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>(admin123)</span>
            </button>
          </div>
        </form>

        {/* Dòng chữ or continue with */}
        <div className={styles.divider}>or continue with</div>

        {/* 3 Nút Mạng xã hội: Google, GitHub, Facebook */}
        <div className={styles.socialRow}>
          {/* Google */}
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => handleSocialClick('Google')}
            title="Sign in with Google"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </button>

          {/* GitHub */}
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => handleSocialClick('GitHub')}
            title="Sign in with GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#24292e">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </button>

          {/* Facebook */}
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => handleSocialClick('Facebook')}
            title="Sign in with Facebook"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
        </div>

        {/* Đăng ký */}
        <p className={styles.footerText}>
          Don&apos;t have an account yet?
          <a href="#register" className={styles.registerLink}>
            Register for free
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0f' }} />}>
      <LoginForm />
    </Suspense>
  );
}
