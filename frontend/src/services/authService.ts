export interface UserSession {
  id: number | string;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'warehouse' | 'customer' | string;
  userType?: 'staff' | 'customer' | string;
  token?: string | null;
}

import apiClient from './api';

let inMemoryUser: UserSession | null = null;
let fetchPromise: Promise<UserSession | null> | null = null;

export const authService = {
  // Lấy thông tin user hiện tại từ cache bộ nhớ
  getCurrentUser(): UserSession | null {
    return inMemoryUser;
  },

  // Đồng bộ thông tin người dùng từ backend endpoint /auth/me
  async fetchCurrentUser(): Promise<UserSession | null> {
    if (typeof window === 'undefined') return null;

    if (fetchPromise) {
      return fetchPromise;
    }

    fetchPromise = (async () => {
      try {
        const response = await apiClient.get('/auth/me');
        if (response.status === 200 && response.data) {
          inMemoryUser = {
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            role: response.data.role,
            userType: response.data.userType,
          };
          window.dispatchEvent(new Event('auth_changed'));
          return inMemoryUser;
        }
        inMemoryUser = null;
        window.dispatchEvent(new Event('auth_changed'));
        return null;
      } catch {
        inMemoryUser = null;
        window.dispatchEvent(new Event('auth_changed'));
        return null;
      } finally {
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  },

  // Đăng nhập qua API Backend Spring Boot (Set-Cookie HttpOnly access_token)
  async loginWithApi(email: string, password: string): Promise<UserSession> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const data = response.data;

      if (data && data.user) {
        inMemoryUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          userType: data.user.userType || (data.user.role === 'admin' ? 'staff' : 'customer'),
        };
      } else {
        await this.fetchCurrentUser();
      }

      window.dispatchEvent(new Event('auth_changed'));

      if (!inMemoryUser) {
        throw new Error('Đăng nhập thành công nhưng không lấy được thông tin người dùng.');
      }
      return inMemoryUser;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Đăng nhập không thành công.';
      throw new Error(msg);
    }
  },

  // Đăng xuất: gọi backend để xóa cookie access_token HttpOnly
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      inMemoryUser = null;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth_changed'));
      }
    }
  },

  // Kiểm tra quyền Admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return String(user?.role).toLowerCase() === 'admin';
  },

  // Kiểm tra vai trò nhân viên (Staff) nói chung
  isStaff(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const r = String(user.role).toLowerCase();
    return ['admin', 'manager', 'sales', 'warehouse', 'support', 'accountant'].includes(r);
  },
};

