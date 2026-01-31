import { create } from 'zustand'
import { transactionService } from '../services'
import type { Transaction, TransactionCreate, TransactionUpdate, PaginatedResponse } from '../types'

interface TransactionsState {
  transactions: Transaction[]
  paginationInfo: {
    total: number
    page: number
    perPage: number
    pages: number
  }
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchTransactions: (budgetId: string, page?: number, perPage?: number) => Promise<void>
  fetchAllTransactions: (budgetId: string) => Promise<Transaction[]>
  createTransaction: (data: TransactionCreate) => Promise<boolean>
  updateTransaction: (id: string, data: TransactionUpdate) => Promise<boolean>
  deleteTransaction: (id: string) => Promise<boolean>
  clearTransactions: () => void
  clearError: () => void
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  paginationInfo: {
    total: 0,
    page: 1,
    perPage: 50,
    pages: 0,
  },
  isLoading: false,
  error: null,

  fetchTransactions: async (budgetId: string, page = 1, perPage = 50) => {
    set({ isLoading: true, error: null })
    try {
      const response = await transactionService.list(budgetId, page, perPage)
      set({
        transactions: response.items,
        paginationInfo: {
          total: response.total,
          page: response.page,
          perPage: response.per_page,
          pages: response.pages,
        },
        isLoading: false,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch transactions'
      set({ error: message, isLoading: false })
    }
  },

  fetchAllTransactions: async (budgetId: string) => {
    set({ isLoading: true, error: null })
    try {
      const transactions = await transactionService.listAll(budgetId)
      set({ transactions, isLoading: false })
      return transactions
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch transactions'
      set({ error: message, isLoading: false })
      return []
    }
  },

  createTransaction: async (data: TransactionCreate) => {
    set({ isLoading: true, error: null })
    try {
      const transaction = await transactionService.create(data)
      set((state) => ({
        transactions: [transaction, ...state.transactions],
        paginationInfo: {
          ...state.paginationInfo,
          total: state.paginationInfo.total + 1,
        },
        isLoading: false,
      }))
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create transaction'
      set({ error: message, isLoading: false })
      return false
    }
  },

  updateTransaction: async (id: string, data: TransactionUpdate) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTransaction = await transactionService.update(id, data)
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? updatedTransaction : t)),
        isLoading: false,
      }))
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update transaction'
      set({ error: message, isLoading: false })
      return false
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await transactionService.delete(id)
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        paginationInfo: {
          ...state.paginationInfo,
          total: state.paginationInfo.total - 1,
        },
        isLoading: false,
      }))
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete transaction'
      set({ error: message, isLoading: false })
      return false
    }
  },

  clearTransactions: () =>
    set({
      transactions: [],
      paginationInfo: { total: 0, page: 1, perPage: 50, pages: 0 },
    }),

  clearError: () => set({ error: null }),
}))
