import api from './api'
import * as SecureStore from 'expo-secure-store'
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types'

export const authService = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me')
    return response.data
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/me', data)
    return response.data
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/users/me')
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
  },

  async saveTokens(tokens: TokenResponse): Promise<void> {
    await SecureStore.setItemAsync('access_token', tokens.access_token)
    await SecureStore.setItemAsync('refresh_token', tokens.refresh_token)
  },

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('access_token')
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('refresh_token')
  },
}
