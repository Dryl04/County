<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl md:text-4xl font-heading text-white mb-2">Budgets</h1>
                <p class="text-neutral-400 font-body">Manage your budgets</p>
            </div>
            <button @click="showCreateModal = true" class="btn-primary">
                <span class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Budget
                </span>
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="budgetStore.isLoading && !budgetStore.budgets.length" class="flex items-center justify-center py-20">
            <svg class="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </div>

        <!-- Empty State -->
        <div v-else-if="budgetStore.budgets.length === 0" class="glass-card text-center py-16">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-800 flex items-center justify-center">
                <svg class="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            </div>
            <h2 class="text-xl font-heading text-white mb-2">No budgets yet</h2>
            <p class="text-neutral-400 mb-6 max-w-md mx-auto">
                Create your first budget to start organizing your finances and tracking your spending.
            </p>
            <button @click="showCreateModal = true" class="btn-primary">
                Create Your First Budget
            </button>
        </div>

        <!-- Budgets Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="budget in budgetStore.budgets" :key="budget.id"
                class="glass-card hover:border-blue-500/30 transition-all duration-200 group">
                <div class="flex items-start justify-between mb-4">
                    <div
                        class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                        <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="editBudget(budget)"
                            class="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                            <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button @click="confirmDelete(budget)"
                            class="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <router-link :to="`/app/budgets/${budget.id}`">
                    <h3 class="text-lg font-heading text-white mb-1">{{ budget.name }}</h3>
                    <p v-if="budget.description" class="text-sm text-neutral-400 mb-4 line-clamp-2">{{
                        budget.description }}</p>

                    <div class="flex items-end justify-between mt-4 pt-4 border-t border-neutral-800">
                        <div>
                            <p class="text-xs text-neutral-500 font-mono mb-1">Balance</p>
                            <p class="text-xl font-heading"
                                :class="parseFloat(budget.total_amount) >= 0 ? 'text-green-400' : 'text-red-400'">
                                {{ formatCurrency(parseFloat(budget.total_amount), budget.currency) }}
                            </p>
                        </div>
                        <span class="text-xs text-neutral-500 font-mono">{{ budget.currency }}</span>
                    </div>
                </router-link>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <Teleport to="body">
            <div v-if="showCreateModal || showEditModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals"></div>
                <div class="glass-card w-full max-w-md relative z-10">
                    <h2 class="text-xl font-heading text-white mb-6">
                        {{ showEditModal ? 'Edit Budget' : 'Create Budget' }}
                    </h2>

                    <form @submit.prevent="handleSubmit" class="space-y-5">
                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Name</label>
                            <input v-model="form.name" type="text" required class="input-field"
                                placeholder="My Budget" />
                        </div>

                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Description (optional)</label>
                            <textarea v-model="form.description" rows="3" class="input-field resize-none"
                                placeholder="Budget description..."></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Initial Amount</label>
                            <input v-model.number="form.totalAmount" type="number" step="0.01" min="0" required
                                class="input-field" placeholder="0.00" />
                        </div>

                        <div v-if="!showEditModal">
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Currency</label>
                            <select v-model="form.currency" class="input-field">
                                <option value="EUR">EUR - Euro</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="XOF">XOF - CFA Franc</option>
                            </select>
                        </div>

                        <div class="flex gap-3 pt-4">
                            <button type="button" @click="closeModals" class="btn-secondary flex-1">Cancel</button>
                            <button type="submit" :disabled="budgetStore.isLoading" class="btn-primary flex-1">
                                {{ budgetStore.isLoading ? 'Saving...' : (showEditModal ? 'Update' : 'Create') }}
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
                    <h3 class="text-lg font-heading text-white mb-2">Delete Budget?</h3>
                    <p class="text-neutral-400 text-sm mb-6">
                        This will permanently delete "{{ budgetToDelete?.name }}" and all its data.
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
import { useAuthStore } from '@/stores/auth'
import { useBudgetStore } from '@/stores/budgets'
import type { Budget } from '@/services/budgets'

const authStore = useAuthStore()
const budgetStore = useBudgetStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingBudget = ref<Budget | null>(null)
const budgetToDelete = ref<Budget | null>(null)

const form = reactive({
    name: '',
    description: '',
    totalAmount: 0,
    currency: 'EUR'
})

const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency || authStore.preferredCurrency,
    }).format(amount)
}

const resetForm = () => {
    form.name = ''
    form.description = ''
    form.totalAmount = 0
    form.currency = authStore.preferredCurrency
}

const closeModals = () => {
    showCreateModal.value = false
    showEditModal.value = false
    editingBudget.value = null
    resetForm()
}

const editBudget = (budget: Budget) => {
    editingBudget.value = budget
    form.name = budget.name
    form.description = budget.description || ''
    form.totalAmount = parseFloat(budget.total_amount)
    showEditModal.value = true
}

const confirmDelete = (budget: Budget) => {
    budgetToDelete.value = budget
    showDeleteModal.value = true
}

const handleSubmit = async () => {
    if (showEditModal.value && editingBudget.value) {
        await budgetStore.updateBudget(editingBudget.value.id, form.name, form.description, form.totalAmount)
    } else {
        await budgetStore.createBudget(form.name, form.description, form.totalAmount, form.currency)
    }
    closeModals()
}

const handleDelete = async () => {
    if (budgetToDelete.value) {
        await budgetStore.deleteBudget(budgetToDelete.value.id)
        showDeleteModal.value = false
        budgetToDelete.value = null
    }
}

onMounted(async () => {
    await budgetStore.fetchBudgets()
    // Initialize form currency with user preference
    form.currency = authStore.preferredCurrency
})
</script>
