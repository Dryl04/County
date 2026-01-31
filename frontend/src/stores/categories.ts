import { ref } from 'vue'
import { defineStore } from 'pinia'
import { categoryService, type Category } from '@/services/categories'
import { getErrorMessage } from '@/utils/errorHandler'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCategories(budgetId: string) {
    isLoading.value = true
    error.value = null
    try {
      categories.value = await categoryService.list(budgetId)
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to fetch categories')
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(
    name: string,
    budgetId: string,
    description?: string,
    color?: string,
  ) {
    isLoading.value = true
    error.value = null
    try {
      const category = await categoryService.create({
        name,
        budget_id: budgetId,
        description,
        color,
      })
      categories.value.push(category)
      return category
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to create category')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateCategory(id: string, name?: string, description?: string, color?: string) {
    isLoading.value = true
    error.value = null
    try {
      const updated = await categoryService.update(id, { name, description, color })
      const index = categories.value.findIndex((c) => c.id === id)
      if (index !== -1) categories.value[index] = updated
      return updated
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to update category')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCategory(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await categoryService.delete(id)
      categories.value = categories.value.filter((c) => c.id !== id)
      return true
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to delete category')
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
