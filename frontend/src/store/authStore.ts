import { create } from 'zustand';
import { authService, UserSession } from '../services/authService';

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: UserSession | null) => void;
  fetchUser: () => Promise<UserSession | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  setUser: (user) => set({ user, isInitialized: true }),
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.fetchCurrentUser();
      set({ user, isLoading: false, isInitialized: true });
      return user;
    } catch {
      set({ user: null, isLoading: false, isInitialized: true });
      return null;
    }
  },
  logout: async () => {
    await authService.logout();
    set({ user: null, isInitialized: true });
  },
}));
