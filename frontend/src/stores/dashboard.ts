import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { budgetService, type Budget } from '@/services/budgets'
import {
  transactionService,
  type Transaction,
  type TransactionSummary,
  type MonthlyData,
  type CategorySummary,
} from '@/services/transactions'
import { categoryService, type Category } from '@/services/categories'
import { getErrorMessage } from '@/utils/errorHandler'

export interface BudgetWithStats extends Budget {
  transactions: Transaction[]
  summary: TransactionSummary
  spentPercentage: number
}

export interface DashboardStats {
  totalBudgets: number
  totalBudgetAmount: number
  totalIncome: number
  totalExpenses: number
  totalBalance: number
  totalTransactions: number
  averageTransactionAmount: number
  savingsRate: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const budgets = ref<BudgetWithStats[]>([])
  const allTransactions = ref<Transaction[]>([])
  const allCategories = ref<Category[]>([])
  const monthlyData = ref<MonthlyData[]>([])
  const expensesByCategory = ref<CategorySummary[]>([])
  const incomeByCategory = ref<CategorySummary[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Computed stats
  const stats = computed<DashboardStats>(() => {
    const totalIncome = allTransactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalExpenses = allTransactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalBudgetAmount = budgets.value.reduce((sum, b) => sum + parseFloat(b.total_amount), 0)

    const avgAmount =
      allTransactions.value.length > 0
        ? (totalIncome + totalExpenses) / allTransactions.value.length
        : 0

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    return {
      totalBudgets: budgets.value.length,
      totalBudgetAmount,
      totalIncome,
      totalExpenses,
      totalBalance: totalIncome - totalExpenses,
      totalTransactions: allTransactions.value.length,
      averageTransactionAmount: avgAmount,
      savingsRate: Math.max(0, savingsRate),
    }
  })

  // Recent transactions (last 10)
  const recentTransactions = computed(() => {
    return [...allTransactions.value]
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
      .slice(0, 10)
  })

  // Top spending categories
  const topSpendingCategories = computed(() => {
    return expensesByCategory.value.slice(0, 5)
  })

  // Budget utilization
  const budgetUtilization = computed(() => {
    return budgets.value.map((budget) => {
      const spent = budget.summary.totalExpenses
      const budgetAmount = parseFloat(budget.total_amount)
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0

      return {
        id: budget.id,
        name: budget.name,
        budgetAmount,
        spent,
        remaining: budgetAmount - spent,
        percentage: Math.min(percentage, 100),
        isOverBudget: spent > budgetAmount,
      }
    })
  })

  // Actions
  async function fetchDashboardData() {
    isLoading.value = true
    error.value = null

    try {
      // 1. Fetch all budgets
      const budgetsData = await budgetService.list()

      // 2. Fetch all categories
      const categoriesPromises = budgetsData.map((b) => categoryService.list(b.id).catch(() => []))
      const categoriesArrays = await Promise.all(categoriesPromises)
      allCategories.value = categoriesArrays.flat()

      // 3. Fetch all transactions for each budget
      const transactionsPromises = budgetsData.map((budget) =>
        transactionService.listAll(budget.id).catch(() => [] as Transaction[]),
      )
      const transactionsArrays = await Promise.all(transactionsPromises)

      // 4. Combine all transactions
      allTransactions.value = transactionsArrays.flat()

      // 5. Calculate stats for each budget
      budgets.value = budgetsData.map((budget, index) => {
        const budgetTransactions = transactionsArrays[index] || []
        const summary = transactionService.calculateSummary(budgetTransactions)
        const budgetAmount = parseFloat(budget.total_amount)
        const spentPercentage =
          budgetAmount > 0 ? Math.min((summary.totalExpenses / budgetAmount) * 100, 100) : 0

        return {
          ...budget,
          transactions: budgetTransactions,
          summary,
          spentPercentage,
        }
      })

      // 6. Calculate monthly data
      monthlyData.value = transactionService.calculateMonthlyData(allTransactions.value)

      // 7. Calculate category summaries
      const categoryList = allCategories.value.map((c) => ({ id: c.id, name: c.name }))
      expensesByCategory.value = transactionService.calculateCategorySummary(
        allTransactions.value,
        categoryList,
        'expense',
      )
      incomeByCategory.value = transactionService.calculateCategorySummary(
        allTransactions.value,
        categoryList,
        'income',
      )

      lastUpdated.value = new Date()
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Erreur lors du chargement des données')
      console.error('Dashboard fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    budgets.value = []
    allTransactions.value = []
    allCategories.value = []
    monthlyData.value = []
    expensesByCategory.value = []
    incomeByCategory.value = []
    isLoading.value = false
    error.value = null
    lastUpdated.value = null
  }

  return {
    // State
    budgets,
    allTransactions,
    allCategories,
    monthlyData,
    expensesByCategory,
    incomeByCategory,
    isLoading,
    error,
    lastUpdated,
    // Computed
    stats,
    recentTransactions,
    topSpendingCategories,
    budgetUtilization,
    // Actions
    fetchDashboardData,
    reset,
  }
})
