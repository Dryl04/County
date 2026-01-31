import { ref } from 'vue'
import { defineStore } from 'pinia'
import { budgetService, type Budget } from '@/services/budgets'
import { getErrorMessage } from '@/utils/errorHandler'

export const useBudgetStore = defineStore('budgets', () => {
  const budgets = ref<Budget[]>([])
  const currentBudget = ref<Budget | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBudgets() {
    isLoading.value = true
    error.value = null
    try {
      budgets.value = await budgetService.list()
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to fetch budgets')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBudget(id: string) {
    isLoading.value = true
    error.value = null
    try {
      currentBudget.value = await budgetService.get(id)
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to fetch budget')
    } finally {
      isLoading.value = false
    }
  }

  async function createBudget(
    name: string,
    description?: string,
    totalAmount?: number,
    currency?: string,
  ) {
    isLoading.value = true
    error.value = null
    try {
      const budget = await budgetService.create({
        name,
        description,
        total_amount: totalAmount,
        currency,
      })
      budgets.value.push(budget)
      return budget
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to create budget')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateBudget(
    id: string,
    name?: string,
    description?: string,
    totalAmount?: number,
  ) {
    isLoading.value = true
    error.value = null
    try {
      const updated = await budgetService.update(id, {
        name,
        description,
        total_amount: totalAmount,
      })
      const index = budgets.value.findIndex((b) => b.id === id)
      if (index !== -1) budgets.value[index] = updated
      if (currentBudget.value?.id === id) currentBudget.value = updated
      return updated
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to update budget')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteBudget(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await budgetService.delete(id)
      budgets.value = budgets.value.filter((b) => b.id !== id)
      if (currentBudget.value?.id === id) currentBudget.value = null
      return true
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to delete budget')
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    budgets,
    currentBudget,
    isLoading,
    error,
    fetchBudgets,
    fetchBudget,
    createBudget,
    updateBudget,
    deleteBudget,
  }
})
