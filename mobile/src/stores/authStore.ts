import { create } from 'zustand';
import { authService } from '../services';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, fullName: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await authService.login({ email, password });
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Identifiants invalides'
          : 'Identifiants invalides';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  register: async (email: string, fullName: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await authService.register({ email, full_name: fullName, password });
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            "Erreur lors de l'inscription"
          : "Erreur lors de l'inscription";
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  logout: async (): Promise<void> => {
    await authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  fetchUser: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data: Partial<User>): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.updateProfile(data);
      set({ user, isLoading: false });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la mise à jour du profil'
          : 'Erreur lors de la mise à jour du profil';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  deleteAccount: async (): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await authService.deleteAccount();
      await authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la suppression du compte'
          : 'Erreur lors de la suppression du compte';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  clearError: (): void => {
    set({ error: null });
  },

  checkAuth: async (): Promise<boolean> => {
    const isAuth = await authService.isAuthenticated();
    if (isAuth) {
      try {
        const user = await authService.getCurrentUser();
        set({ user, isAuthenticated: true });
        return true;
      } catch {
        await authService.logout();
        set({ user: null, isAuthenticated: false });
        return false;
      }
    }
    return false;
  },
}));
