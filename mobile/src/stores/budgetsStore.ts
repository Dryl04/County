import { create } from 'zustand'
import { budgetService } from '../services'
import type { Budget, BudgetCreate, BudgetUpdate } from '../types'

interface BudgetsState {
  budgets: Budget[]
  selectedBudget: Budget | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchBudgets: () => Promise<void>
  fetchBudget: (id: string) => Promise<void>
  createBudget: (data: BudgetCreate) => Promise<boolean>
  updateBudget: (id: string, data: BudgetUpdate) => Promise<boolean>
  deleteBudget: (id: string) => Promise<boolean>
  setSelectedBudget: (budget: Budget | null) => void
  clearError: () => void
}

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  budgets: [],
  selectedBudget: null,
  isLoading: false,
  error: null,

  fetchBudgets: async () => {
    set({ isLoading: true, error: null })
    try {
      const budgets = await budgetService.list()
      set({ budgets, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch budgets'
      set({ error: message, isLoading: false })
    }
  },

  fetchBudget: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const budget = await budgetService.get(id)
      set({ selectedBudget: budget, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch budget'
      set({ error: message, isLoading: false })
    }
  },

  createBudget: async (data: BudgetCreate) => {
    set({ isLoading: true, error: null })
    try {
      const budget = await budgetService.create(data)
      set((state) => ({
        budgets: [...state.budgets, budget],
        isLoading: false,
      }))
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create budget'
      set({ error: message, isLoading: false })
      return false
    }
  },

  updateBudget: async (id: string, data: BudgetUpdate) => {
    set({ isLoading: true, error: null })
    try {
      const updatedBudget = await budgetService.update(id, data)
      set((state) => ({
        budgets: state.budgets.map((b) => (b.id === id ? updatedBudget : b)),
        selectedBudget: state.selectedBudget?.id === id ? updatedBudget : state.selectedBudget,
        isLoading: false,
      }))
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update budget'
      set({ error: message, isLoading: false })
      return false
    }
  },

  deleteBudget: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await budgetService.delete(id)
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
        selectedBudget: state.selectedBudget?.id === id ? null : state.selectedBudget,
        isLoading: false,
      }))
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete budget'
      set({ error: message, isLoading: false })
      return false
    }
  },

  setSelectedBudget: (budget: Budget | null) => set({ selectedBudget: budget }),

  clearError: () => set({ error: null }),
}))
