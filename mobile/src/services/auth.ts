import api, { tokenStorage } from './api';
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', data);
    await tokenStorage.setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/users/me');
  },

  async logout(): Promise<void> {
    await tokenStorage.clearTokens();
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await tokenStorage.getAccessToken();
    return !!token;
  },
};
