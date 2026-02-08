import api from './api'
import type { Category, CategoryCreate, CategoryUpdate } from '../types'

export const categoryService = {
  async list(budgetId: string): Promise<Category[]> {
    const response = await api.get('/categories', { params: { budget_id: budgetId } })
    return response.data
  },

  async get(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  async create(data: CategoryCreate): Promise<Category> {
    const response = await api.post('/categories', data)
    return response.data
  },

  async update(id: string, data: CategoryUpdate): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
