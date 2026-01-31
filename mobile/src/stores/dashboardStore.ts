import { create } from 'zustand'
import { budgetService, transactionService, categoryService } from '../services'
import type {
  Budget,
  Transaction,
  Category,
  DashboardStats,
  MonthlyData,
  CategorySummary,
  BudgetUtilization,
} from '../types'

interface DashboardState {
  budgets: Budget[]
  transactions: Transaction[]
  categories: Category[]
  stats: DashboardStats
  monthlyData: MonthlyData[]
  expensesByCategory: CategorySummary[]
  budgetUtilization: BudgetUtilization[]
  recentTransactions: Transaction[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  
  // Actions
  fetchDashboardData: () => Promise<void>
  clearError: () => void
}

const initialStats: DashboardStats = {
  totalBudgets: 0,
  totalTransactions: 0,
  totalBalance: 0,
  totalIncome: 0,
  totalExpenses: 0,
  totalBudgetAmount: 0,
  savingsRate: 0,
  averageTransactionAmount: 0,
}

export const useDashboardStore = create<DashboardState>((set) => ({
  budgets: [],
  transactions: [],
  categories: [],
  stats: initialStats,
  monthlyData: [],
  expensesByCategory: [],
  budgetUtilization: [],
  recentTransactions: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null })
    try {
      // Fetch all budgets
      const budgets = await budgetService.list()
      
      // Fetch all transactions and categories for each budget
      const allTransactions: Transaction[] = []
      const allCategories: Category[] = []
      
      await Promise.all(
        budgets.map(async (budget) => {
          const [transactions, categories] = await Promise.all([
            transactionService.listAll(budget.id),
            categoryService.list(budget.id),
          ])
          allTransactions.push(...transactions)
          allCategories.push(...categories)
        })
      )
      
      // Calculate summary
      const summary = transactionService.calculateSummary(allTransactions)
      
      // Calculate monthly data
      const monthlyData = transactionService.calculateMonthlyData(allTransactions)
      
      // Calculate category summary
      const expensesByCategory = transactionService.calculateCategorySummary(
        allTransactions,
        allCategories,
        'expense'
      )
      
      // Calculate budget utilization
      const budgetUtilization: BudgetUtilization[] = await Promise.all(
        budgets.map(async (budget) => {
          const budgetTransactions = allTransactions.filter((t) => t.budget_id === budget.id)
          const spent = budgetTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0)
          const budgetAmount = parseFloat(budget.total_amount)
          const remaining = budgetAmount - spent
          const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
          
          return {
            id: budget.id,
            name: budget.name,
            budgetAmount,
            spent,
            remaining,
            percentage,
            isOverBudget: remaining < 0,
          }
        })
      )
      
      // Get recent transactions (last 10)
      const recentTransactions = [...allTransactions]
        .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
        .slice(0, 10)
      
      // Calculate total budget amount
      const totalBudgetAmount = budgets.reduce(
        (sum, b) => sum + parseFloat(b.total_amount),
        0
      )
      
      // Calculate savings rate
      const savingsRate = summary.totalIncome > 0
        ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100
        : 0
      
      // Calculate average transaction amount
      const averageTransactionAmount = allTransactions.length > 0
        ? allTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / allTransactions.length
        : 0
      
      const stats: DashboardStats = {
        totalBudgets: budgets.length,
        totalTransactions: allTransactions.length,
        totalBalance: summary.balance,
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        totalBudgetAmount,
        savingsRate,
        averageTransactionAmount,
      }
      
      set({
        budgets,
        transactions: allTransactions,
        categories: allCategories,
        stats,
        monthlyData,
        expensesByCategory,
        budgetUtilization,
        recentTransactions,
        isLoading: false,
        lastUpdated: new Date(),
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard data'
      set({ error: message, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
