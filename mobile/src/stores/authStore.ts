import { create } from 'zustand'
import { authService } from '../services'
import type { User, LoginRequest, RegisterRequest } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (data: LoginRequest) => Promise<boolean>
  register: (data: RegisterRequest) => Promise<boolean>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<boolean>
  deleteAccount: () => Promise<boolean>
  clearError: () => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null })
    try {
      const tokens = await authService.login(data)
      await authService.saveTokens(tokens)
      
      const user = await authService.getCurrentUser()
      set({ user, isAuthenticated: true, isLoading: false })
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      set({ error: message, isLoading: false })
      return false
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null })
    try {
      await authService.register(data)
      // Auto-login after registration
      return await get().login({ email: data.email, password: data.password })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      set({ error: message, isLoading: false })
      return false
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logout()
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null })
    }
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null })
    try {
      const user = await authService.getCurrentUser()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user'
      set({ error: message, isLoading: false, isAuthenticated: false })
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authService.updateProfile(data)
      set({ user, isLoading: false })
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile'
      set({ error: message, isLoading: false })
      return false
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null })
    try {
      await authService.deleteAccount()
      await authService.logout()
      set({ user: null, isAuthenticated: false, isLoading: false })
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete account'
      set({ error: message, isLoading: false })
      return false
    }
  },

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    const token = await authService.getAccessToken()
    if (!token) {
      set({ isAuthenticated: false, user: null })
      return false
    }
    
    try {
      await get().fetchUser()
      return true
    } catch {
      await authService.logout()
      set({ isAuthenticated: false, user: null })
      return false
    }
  },
}))

// Selectors
export const selectUserName = (state: AuthState) => state.user?.full_name || 'User'
export const selectPreferredCurrency = (state: AuthState) => state.user?.preferred_currency || 'EUR'
