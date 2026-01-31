import { create } from 'zustand';
import { budgetService } from '../services';
import type { Budget, BudgetCreate, BudgetUpdate } from '../types';

interface BudgetsState {
  budgets: Budget[];
  selectedBudget: Budget | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBudgets: () => Promise<void>;
  fetchBudget: (id: string) => Promise<void>;
  createBudget: (data: BudgetCreate) => Promise<Budget | null>;
  updateBudget: (id: string, data: BudgetUpdate) => Promise<boolean>;
  deleteBudget: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearSelectedBudget: () => void;
}

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  budgets: [],
  selectedBudget: null,
  isLoading: false,
  error: null,

  fetchBudgets: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const budgets = await budgetService.list();
      set({ budgets, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors du chargement des budgets'
          : 'Erreur lors du chargement des budgets';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchBudget: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const budget = await budgetService.get(id);
      set({ selectedBudget: budget, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors du chargement du budget'
          : 'Erreur lors du chargement du budget';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createBudget: async (data: BudgetCreate): Promise<Budget | null> => {
    set({ isLoading: true, error: null });
    try {
      const budget = await budgetService.create(data);
      set((state) => ({
        budgets: [...state.budgets, budget],
        isLoading: false,
      }));
      return budget;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la création du budget'
          : 'Erreur lors de la création du budget';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateBudget: async (id: string, data: BudgetUpdate): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const updatedBudget = await budgetService.update(id, data);
      set((state) => ({
        budgets: state.budgets.map((b) => (b.id === id ? updatedBudget : b)),
        selectedBudget: state.selectedBudget?.id === id ? updatedBudget : state.selectedBudget,
        isLoading: false,
      }));
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la mise à jour du budget'
          : 'Erreur lors de la mise à jour du budget';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  deleteBudget: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.delete(id);
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
        selectedBudget: state.selectedBudget?.id === id ? null : state.selectedBudget,
        isLoading: false,
      }));
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la suppression du budget'
          : 'Erreur lors de la suppression du budget';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  clearError: (): void => {
    set({ error: null });
  },

  clearSelectedBudget: (): void => {
    set({ selectedBudget: null });
  },
}));
