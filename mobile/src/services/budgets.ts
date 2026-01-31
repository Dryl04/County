import api from './api';
import type { Budget, BudgetCreate, BudgetUpdate } from '../types';

export const budgetService = {
  async list(): Promise<Budget[]> {
    const response = await api.get<Budget[]>('/budgets');
    return response.data;
  },

  async get(id: string): Promise<Budget> {
    const response = await api.get<Budget>(`/budgets/${id}`);
    return response.data;
  },

  async create(data: BudgetCreate): Promise<Budget> {
    const response = await api.post<Budget>('/budgets', data);
    return response.data;
  },

  async update(id: string, data: BudgetUpdate): Promise<Budget> {
    const response = await api.put<Budget>(`/budgets/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
