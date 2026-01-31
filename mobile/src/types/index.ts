// User types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  preferred_currency: string;
  created_at: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Budget types
export interface Budget {
  id: string;
  name: string;
  description?: string;
  total_amount: string;
  currency: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetCreate {
  name: string;
  description?: string;
  total_amount?: number;
  currency?: string;
}

export interface BudgetUpdate {
  name?: string;
  description?: string;
  total_amount?: number;
  currency?: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  budget_id: string;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  color?: string;
  budget_id: string;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  color?: string;
}

// Transaction types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: string;
  currency: string;
  type: TransactionType;
  note?: string;
  occurred_at: string;
  budget_id: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  amount: number;
  currency?: string;
  type: TransactionType;
  note?: string;
  occurred_at?: string;
  budget_id: string;
  category_id?: string;
}

export interface TransactionUpdate {
  amount?: number;
  currency?: string;
  type?: TransactionType;
  note?: string;
  occurred_at?: string;
  category_id?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Dashboard types
export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export interface MonthlyData {
  month: string;
  year: number;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategorySummary {
  categoryId: string | null;
  categoryName: string;
  total: number;
  count: number;
  percentage: number;
}

export interface BudgetUtilization {
  id: string;
  name: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

// API Error types
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
