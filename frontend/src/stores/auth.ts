import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService, type User } from '@/services/auth'
import { getErrorMessage } from '@/utils/errorHandler'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!localStorage.getItem('access_token'))
  const userName = computed(() => user.value?.full_name || '')
  const preferredCurrency = computed(() => user.value?.preferred_currency || 'EUR')

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null
    try {
      const tokens = await authService.login({ email, password })
      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      await fetchUser()
      return true
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Login failed')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(email: string, fullName: string, password: string) {
    isLoading.value = true
    error.value = null
    try {
      await authService.register({ email, full_name: fullName, password })
      return true
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Registration failed')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser() {
    try {
      user.value = await authService.getCurrentUser()
    } catch {
      user.value = null
    }
  }

  function logout() {
    authService.logout()
    user.value = null
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    userName,
    preferredCurrency,
    login,
    register,
    fetchUser,
    logout,
  }
})
