import api from './api'

export type TransactionType = 'income' | 'expense'

export interface CategoryInfo {
  id: string
  name: string
  color: string
}

export interface BudgetInfo {
  id: string
  name: string
  currency: string
}

export interface Transaction {
  id: string
  amount: string
  currency: string
  type: TransactionType
  note?: string
  occurred_at: string
  budget_id: string
  category_id?: string
  budget?: BudgetInfo
  category?: CategoryInfo
  created_at: string
  updated_at: string
}

export interface TransactionCreate {
  amount: number
  currency?: string
  type: TransactionType
  note?: string
  occurred_at?: string
  budget_id: string
  category_id?: string
}

export interface TransactionUpdate {
  amount?: number
  currency?: string
  type?: TransactionType
  note?: string
  occurred_at?: string
  category_id?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface TransactionSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  transactionCount: number
  incomeCount: number
  expenseCount: number
}

export interface MonthlyData {
  month: string
  year: number
  income: number
  expenses: number
  balance: number
}

export interface CategorySummary {
  categoryId: string | null
  categoryName: string
  total: number
  count: number
  percentage: number
}

export const transactionService = {
  async list(budgetId: string, page = 1, perPage = 50): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get('/transactions', {
      params: { budget_id: budgetId, page, per_page: perPage },
    })
    return response.data
  },

  async listAll(budgetId: string): Promise<Transaction[]> {
    // Récupérer toutes les transactions d'un budget
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

  // Méthodes d'agrégation
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

    // Trier par date et retourner les 12 derniers mois
    return Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([, data]) => data)
  },

  calculateCategorySummary(
    transactions: Transaction[],
    categories: { id: string; name: string }[],
    type: TransactionType = 'expense',
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
