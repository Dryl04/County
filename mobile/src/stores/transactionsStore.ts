import { create } from 'zustand';
import { transactionService } from '../services';
import type { Transaction, TransactionCreate, TransactionUpdate, PaginatedResponse } from '../types';

interface TransactionsState {
  transactions: Transaction[];
  total: number;
  page: number;
  pages: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTransactions: (budgetId: string, page?: number, perPage?: number) => Promise<void>;
  fetchAllTransactions: (budgetId: string) => Promise<Transaction[]>;
  createTransaction: (data: TransactionCreate) => Promise<Transaction | null>;
  updateTransaction: (id: string, data: TransactionUpdate) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  clearTransactions: () => void;
  clearError: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  total: 0,
  page: 1,
  pages: 0,
  isLoading: false,
  error: null,

  fetchTransactions: async (budgetId: string, page = 1, perPage = 50): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionService.list(budgetId, page, perPage);
      set({
        transactions: response.items,
        total: response.total,
        page: response.page,
        pages: response.pages,
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors du chargement des transactions'
          : 'Erreur lors du chargement des transactions';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchAllTransactions: async (budgetId: string): Promise<Transaction[]> => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await transactionService.listAll(budgetId);
      set({ isLoading: false });
      return transactions;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors du chargement des transactions'
          : 'Erreur lors du chargement des transactions';
      set({ error: errorMessage, isLoading: false });
      return [];
    }
  },

  createTransaction: async (data: TransactionCreate): Promise<Transaction | null> => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await transactionService.create(data);
      set((state) => ({
        transactions: [transaction, ...state.transactions],
        total: state.total + 1,
        isLoading: false,
      }));
      return transaction;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la création de la transaction'
          : 'Erreur lors de la création de la transaction';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateTransaction: async (id: string, data: TransactionUpdate): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const updatedTransaction = await transactionService.update(id, data);
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? updatedTransaction : t)),
        isLoading: false,
      }));
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la mise à jour de la transaction'
          : 'Erreur lors de la mise à jour de la transaction';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  deleteTransaction: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.delete(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        total: state.total - 1,
        isLoading: false,
      }));
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la suppression de la transaction'
          : 'Erreur lors de la suppression de la transaction';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  clearTransactions: (): void => {
    set({ transactions: [], total: 0, page: 1, pages: 0 });
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
