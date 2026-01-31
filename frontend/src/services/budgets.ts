import api from './api'

export interface Budget {
  id: string
  name: string
  description?: string
  total_amount: string
  currency: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface BudgetCreate {
  name: string
  description?: string
  total_amount?: number
  currency?: string
}

export interface BudgetUpdate {
  name?: string
  description?: string
  total_amount?: number
  currency?: string
}

export const budgetService = {
  async list(): Promise<Budget[]> {
    const response = await api.get('/budgets')
    return response.data
  },

  async get(id: string): Promise<Budget> {
    const response = await api.get(`/budgets/${id}`)
    return response.data
  },

  async create(data: BudgetCreate): Promise<Budget> {
    const response = await api.post('/budgets', data)
    return response.data
  },

  async update(id: string, data: BudgetUpdate): Promise<Budget> {
    const response = await api.put(`/budgets/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`)
  },
}
