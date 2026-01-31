import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { transactionService, type Transaction, type TransactionType } from '@/services/transactions'
import { getErrorMessage } from '@/utils/errorHandler'

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const totalItems = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed for current budget summary
  const totalIncome = computed(() => {
    return transactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  })

  const totalExpenses = computed(() => {
    return transactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  })

  const balance = computed(() => totalIncome.value - totalExpenses.value)

  async function fetchTransactions(budgetId: string, page = 1, perPage = 50) {
    isLoading.value = true
    error.value = null
    try {
      const response = await transactionService.list(budgetId, page, perPage)
      transactions.value = response.items
      totalItems.value = response.total
      currentPage.value = response.page
      totalPages.value = response.pages
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to fetch transactions')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAllTransactions(budgetId: string) {
    isLoading.value = true
    error.value = null
    try {
      const allTx = await transactionService.listAll(budgetId)
      transactions.value = allTx
      totalItems.value = allTx.length
      currentPage.value = 1
      totalPages.value = 1
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to fetch transactions')
    } finally {
      isLoading.value = false
    }
  }

  async function createTransaction(
    amount: number,
    type: TransactionType,
    budgetId: string,
    occurredAt?: string,
    note?: string,
    categoryId?: string,
    currency?: string,
  ) {
    isLoading.value = true
    error.value = null
    try {
      const transaction = await transactionService.create({
        amount,
        type,
        budget_id: budgetId,
        occurred_at: occurredAt,
        note,
        category_id: categoryId,
        currency,
      })
      transactions.value.unshift(transaction)
      totalItems.value += 1
      return transaction
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to create transaction')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateTransaction(
    id: string,
    amount?: number,
    type?: TransactionType,
    occurredAt?: string,
    note?: string,
    categoryId?: string,
    currency?: string,
  ) {
    isLoading.value = true
    error.value = null
    try {
      const updated = await transactionService.update(id, {
        amount,
        type,
        occurred_at: occurredAt,
        note,
        category_id: categoryId,
        currency,
      })
      const index = transactions.value.findIndex((t) => t.id === id)
      if (index !== -1) transactions.value[index] = updated
      return updated
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to update transaction')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTransaction(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await transactionService.delete(id)
      transactions.value = transactions.value.filter((t) => t.id !== id)
      totalItems.value = Math.max(0, totalItems.value - 1)
      return true
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to delete transaction')
      return false
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    transactions.value = []
    totalItems.value = 0
    currentPage.value = 1
    totalPages.value = 1
    error.value = null
  }

  return {
    transactions,
    totalItems,
    currentPage,
    totalPages,
    isLoading,
    error,
    totalIncome,
    totalExpenses,
    balance,
    fetchTransactions,
    fetchAllTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    reset,
  }
})
