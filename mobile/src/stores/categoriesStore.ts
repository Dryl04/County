import { create } from 'zustand'
import { categoryService } from '../services'
import type { Category, CategoryCreate, CategoryUpdate } from '../types'

interface CategoriesState {
  categories: Category[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchCategories: (budgetId: string) => Promise<void>
  createCategory: (data: CategoryCreate) => Promise<boolean>
  updateCategory: (id: string, data: CategoryUpdate) => Promise<boolean>
  deleteCategory: (id: string) => Promise<boolean>
  clearCategories: () => void
  clearError: () => void
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (budgetId: string) => {
    set({ isLoading: true, error: null })
    try {
      const categories = await categoryService.list(budgetId)
      set({ categories, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch categories'
      set({ error: message, isLoading: false })
    }
  },

  createCategory: async (data: CategoryCreate) => {
    set({ isLoading: true, error: null })
    try {
      const category = await categoryService.create(data)
      set((state) => ({
        categories: [...state.categories, category],
        isLoading: false,
      }))
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create category'
      set({ error: message, isLoading: false })
      return false
    }
  },

  updateCategory: async (id: string, data: CategoryUpdate) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCategory = await categoryService.update(id, data)
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? updatedCategory : c)),
        isLoading: false,
      }))
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update category'
      set({ error: message, isLoading: false })
      return false
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await categoryService.delete(id)
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        isLoading: false,
      }))
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete category'
      set({ error: message, isLoading: false })
      return false
    }
  },

  clearCategories: () => set({ categories: [] }),

  clearError: () => set({ error: null }),
}))
