export interface UserSession {
  id: number | string;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'warehouse' | 'customer' | string;
  token: string;
}

const USER_SESSION_KEY = 'store_auth_user';
const TOKEN_KEY = 'auth_token';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const authService = {
  // Lấy thông tin user hiện tại
  getCurrentUser(): UserSession | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_SESSION_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  // Lưu phiên đăng nhập
  login(session: UserSession): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem('token', session.token);

    // Lưu cookie để middleware Next.js có thể đọc được
    document.cookie = `auth_token=${session.token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `user_role=${session.role}; path=/; max-age=86400; SameSite=Lax`;
  },

  // Đăng nhập qua API Backend Spring Boot
  async loginWithApi(email: string, password: string): Promise<UserSession> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.';
        throw new Error(errorMsg);
      }

      const session: UserSession = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        token: data.token,
      };

      this.login(session);
      return session;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến máy chủ Backend (port 8080). Vui lòng thử lại sau.');
      }
      throw error;
    }
  },

  // Đăng xuất
  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('token');
    document.cookie = 'auth_token=; path=/; max-age=0';
    document.cookie = 'user_role=; path=/; max-age=0';
  },

  // Kiểm tra quyền Admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },
};

