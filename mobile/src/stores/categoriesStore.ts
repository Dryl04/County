import { create } from 'zustand';
import { categoryService } from '../services';
import type { Category, CategoryCreate, CategoryUpdate } from '../types';

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (budgetId: string) => Promise<void>;
  createCategory: (data: CategoryCreate) => Promise<Category | null>;
  updateCategory: (id: string, data: CategoryUpdate) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  clearCategories: () => void;
  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (budgetId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryService.list(budgetId);
      set({ categories, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors du chargement des catégories'
          : 'Erreur lors du chargement des catégories';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createCategory: async (data: CategoryCreate): Promise<Category | null> => {
    set({ isLoading: true, error: null });
    try {
      const category = await categoryService.create(data);
      set((state) => ({
        categories: [...state.categories, category],
        isLoading: false,
      }));
      return category;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la création de la catégorie'
          : 'Erreur lors de la création de la catégorie';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateCategory: async (id: string, data: CategoryUpdate): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const updatedCategory = await categoryService.update(id, data);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? updatedCategory : c)),
        isLoading: false,
      }));
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la mise à jour de la catégorie'
          : 'Erreur lors de la mise à jour de la catégorie';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.delete(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            'Erreur lors de la suppression de la catégorie'
          : 'Erreur lors de la suppression de la catégorie';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  clearCategories: (): void => {
    set({ categories: [] });
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
