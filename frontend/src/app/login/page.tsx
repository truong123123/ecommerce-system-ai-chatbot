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
    setError(`Tính năng đăng nhập qua ${provider} đang được phát triển.`);
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
        </form>

        {/* Dòng chữ or continue with */}
        <div className={styles.divider}>or continue with</div>

        {/* 3 Nút Mạng xã hội: Google, Zalo, Facebook */}
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

          {/* Zalo */}
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => handleSocialClick('Zalo')}
            title="Sign in with Zalo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                fill="#0068FF"
                d="M12 2C6.477 2 2 6.477 2 12c0 1.98.574 3.824 1.564 5.378L2.24 21.35a.65.65 0 0 0 .81.81l3.972-1.324A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
              />
              <text
                x="12"
                y="14.6"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="7.2"
                fontWeight="800"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="-0.2px"
              >
                Zalo
              </text>
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
