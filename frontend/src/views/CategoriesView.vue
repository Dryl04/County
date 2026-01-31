<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl md:text-4xl font-heading text-white mb-2">Categories</h1>
                <p class="text-neutral-400 font-body">Organize your transactions by category</p>
            </div>
        </div>

        <!-- Budget Selector -->
        <div class="glass-card">
            <label class="block text-sm font-mono text-neutral-400 mb-2">Select Budget</label>
            <select v-model="selectedBudgetId" class="input-field max-w-md" @change="loadCategories">
                <option value="">Choose a budget</option>
                <option v-for="budget in budgetStore.budgets" :key="budget.id" :value="budget.id">
                    {{ budget.name }}
                </option>
            </select>
        </div>

        <!-- No Budget Selected -->
        <div v-if="!selectedBudgetId" class="glass-card text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                <svg class="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            </div>
            <p class="text-neutral-400">Select a budget to view and manage its categories</p>
        </div>

        <!-- Categories Content -->
        <template v-else>
            <!-- Add Category Button -->
            <div class="flex justify-end">
                <button @click="showCreateModal = true" class="btn-primary">
                    <span class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Category
                    </span>
                </button>
            </div>

            <!-- Loading State -->
            <div v-if="categoryStore.isLoading" class="flex items-center justify-center py-12">
                <svg class="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
            </div>

            <!-- Empty State -->
            <div v-else-if="categoryStore.categories.length === 0" class="glass-card text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                    <svg class="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                </div>
                <h3 class="text-lg font-heading text-white mb-2">No categories yet</h3>
                <p class="text-neutral-400 mb-4">Create categories to organize your transactions</p>
                <button @click="showCreateModal = true" class="btn-primary">
                    Create First Category
                </button>
            </div>

            <!-- Categories Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="category in categoryStore.categories" :key="category.id" class="glass-card group">
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                                :style="{ backgroundColor: (category.color || '#3b82f6') + '20' }">
                                <div class="w-4 h-4 rounded-full"
                                    :style="{ backgroundColor: category.color || '#3b82f6' }"></div>
                            </div>
                            <div>
                                <h3 class="font-heading text-white">{{ category.name }}</h3>
                                <p v-if="category.description" class="text-sm text-neutral-400">{{ category.description
                                }}</p>
                            </div>
                        </div>
                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button @click="editCategory(category)"
                                class="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                                <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button @click="confirmDelete(category)"
                                class="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                                <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Create/Edit Modal -->
        <Teleport to="body">
            <div v-if="showCreateModal || showEditModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals"></div>
                <div class="glass-card w-full max-w-md relative z-10">
                    <h2 class="text-xl font-heading text-white mb-6">
                        {{ showEditModal ? 'Edit Category' : 'Create Category' }}
                    </h2>

                    <form @submit.prevent="handleSubmit" class="space-y-5">
                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Name</label>
                            <input v-model="form.name" type="text" required class="input-field"
                                placeholder="Category name" />
                        </div>

                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Description (optional)</label>
                            <textarea v-model="form.description" rows="2" class="input-field resize-none"
                                placeholder="Description..."></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Color</label>
                            <div class="flex items-center gap-3">
                                <input v-model="form.color" type="color"
                                    class="w-12 h-12 rounded-lg cursor-pointer border-0" />
                                <div class="flex gap-2 flex-wrap">
                                    <button v-for="color in presetColors" :key="color" type="button"
                                        @click="form.color = color" class="w-8 h-8 rounded-lg border-2 transition-all"
                                        :class="form.color === color ? 'border-white scale-110' : 'border-transparent'"
                                        :style="{ backgroundColor: color }"></button>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3 pt-4">
                            <button type="button" @click="closeModals" class="btn-secondary flex-1">Cancel</button>
                            <button type="submit" :disabled="categoryStore.isLoading" class="btn-primary flex-1">
                                {{ categoryStore.isLoading ? 'Saving...' : (showEditModal ? 'Update' : 'Create') }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Delete Confirmation Modal -->
        <Teleport to="body">
            <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDeleteModal = false"></div>
                <div class="glass-card w-full max-w-sm relative z-10 text-center">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-heading text-white mb-2">Delete Category?</h3>
                    <p class="text-neutral-400 text-sm mb-6">
                        This will permanently delete "{{ categoryToDelete?.name }}".
                    </p>
                    <div class="flex gap-3">
                        <button @click="showDeleteModal = false" class="btn-secondary flex-1">Cancel</button>
                        <button @click="handleDelete" class="btn-danger flex-1">Delete</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budgets'
import { useCategoryStore } from '@/stores/categories'
import type { Category } from '@/services/categories'

const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()

const selectedBudgetId = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref<Category | null>(null)
const categoryToDelete = ref<Category | null>(null)

const presetColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const form = reactive({
    name: '',
    description: '',
    color: '#3b82f6'
})

const loadCategories = () => {
    if (selectedBudgetId.value) {
        categoryStore.fetchCategories(selectedBudgetId.value)
    }
}

const resetForm = () => {
    form.name = ''
    form.description = ''
    form.color = '#3b82f6'
}

const closeModals = () => {
    showCreateModal.value = false
    showEditModal.value = false
    editingCategory.value = null
    resetForm()
}

const editCategory = (category: Category) => {
    editingCategory.value = category
    form.name = category.name
    form.description = category.description || ''
    form.color = category.color || '#3b82f6'
    showEditModal.value = true
}

const confirmDelete = (category: Category) => {
    categoryToDelete.value = category
    showDeleteModal.value = true
}

const handleSubmit = async () => {
    if (showEditModal.value && editingCategory.value) {
        await categoryStore.updateCategory(editingCategory.value.id, form.name, form.description, form.color)
    } else {
        await categoryStore.createCategory(form.name, selectedBudgetId.value, form.description, form.color)
    }
    closeModals()
}

const handleDelete = async () => {
    if (categoryToDelete.value) {
        await categoryStore.deleteCategory(categoryToDelete.value.id)
        showDeleteModal.value = false
        categoryToDelete.value = null
    }
}

onMounted(async () => {
    await budgetStore.fetchBudgets()
    // Auto-select first budget if available
    const firstBudget = budgetStore.budgets[0]
    if (firstBudget) {
        selectedBudgetId.value = firstBudget.id
        loadCategories()
    }
})
</script>
