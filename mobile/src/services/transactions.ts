import api from './api'
import type {
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  TransactionType,
  PaginatedResponse,
  TransactionSummary,
  MonthlyData,
  CategorySummary,
} from '../types'

export const transactionService = {
  async list(budgetId: string, page = 1, perPage = 50): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get('/transactions', {
      params: { budget_id: budgetId, page, per_page: perPage },
    })
    return response.data
  },

  async listAll(budgetId: string): Promise<Transaction[]> {
    const allTransactions: Transaction[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await this.list(budgetId, page, 100)
      allTransactions.push(...response.items)
      hasMore = page < response.pages
      page++
    }

    return allTransactions
  },

  async get(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`)
    return response.data
  },

  async create(data: TransactionCreate): Promise<Transaction> {
    const response = await api.post('/transactions', data)
    return response.data
  },

  async update(id: string, data: TransactionUpdate): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`)
  },

  // Aggregation methods
  calculateSummary(transactions: Transaction[]): TransactionSummary {
    const incomeTransactions = transactions.filter((t) => t.type === 'income')
    const expenseTransactions = transactions.filter((t) => t.type === 'expense')

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
    }
  },

  calculateMonthlyData(transactions: Transaction[]): MonthlyData[] {
    const monthlyMap = new Map<string, MonthlyData>()

    transactions.forEach((t) => {
      const date = new Date(t.occurred_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: monthName,
          year: date.getFullYear(),
          income: 0,
          expenses: 0,
          balance: 0,
        })
      }

      const data = monthlyMap.get(key)!
      const amount = parseFloat(t.amount)

      if (t.type === 'income') {
        data.income += amount
      } else {
        data.expenses += amount
      }
      data.balance = data.income - data.expenses
    })

    // Sort by date and return the last 12 months
    return Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([, data]) => data)
  },

  calculateCategorySummary(
    transactions: Transaction[],
    categories: { id: string; name: string }[],
    type: TransactionType = 'expense'
  ): CategorySummary[] {
    const filteredTransactions = transactions.filter((t) => t.type === type)
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const categoryMap = new Map<string | null, { total: number; count: number }>()

    filteredTransactions.forEach((t) => {
      const key = t.category_id || null
      if (!categoryMap.has(key)) {
        categoryMap.set(key, { total: 0, count: 0 })
      }
      const data = categoryMap.get(key)!
      data.total += parseFloat(t.amount)
      data.count += 1
    })

    return Array.from(categoryMap.entries())
      .map(([categoryId, data]) => {
        const category = categories.find((c) => c.id === categoryId)
        return {
          categoryId,
          categoryName: category?.name || 'Sans catégorie',
          total: data.total,
          count: data.count,
          percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
        }
      })
      .sort((a, b) => b.total - a.total)
  },
}
