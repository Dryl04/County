<template>
    <div class="space-y-6">
        <!-- Back Button & Header -->
        <div class="flex items-center gap-4 mb-6">
            <router-link to="/app/budgets" class="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </router-link>
            <div class="flex-1">
                <h1 class="text-3xl font-heading text-white">{{ budget?.name || 'Loading...' }}</h1>
                <p v-if="budget?.description" class="text-neutral-400">{{ budget.description }}</p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="budgetStore.isLoading" class="flex items-center justify-center py-20">
            <svg class="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
        </div>

        <template v-else-if="budget">
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="card-stat">
                    <span class="text-sm text-neutral-400 font-mono">Balance</span>
                    <span class="text-2xl font-heading"
                        :class="parseFloat(budget.total_amount) >= 0 ? 'text-green-400' : 'text-red-400'">
                        {{ formatCurrency(parseFloat(budget.total_amount), budget.currency) }}
                    </span>
                </div>
                <div class="card-stat">
                    <span class="text-sm text-neutral-400 font-mono">Currency</span>
                    <span class="text-2xl font-heading text-white">{{ budget.currency }}</span>
                </div>
                <div class="card-stat">
                    <span class="text-sm text-neutral-400 font-mono">Created</span>
                    <span class="text-lg font-heading text-white">{{ formatDate(budget.created_at) }}</span>
                </div>
            </div>

            <!-- Categories Section -->
            <div class="glass-card">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-heading text-white">Categories</h2>
                    <button @click="showCategoryModal = true" class="btn-secondary text-sm">
                        <span class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v16m8-8H4" />
                            </svg>
                            Add Category
                        </span>
                    </button>
                </div>

                <div v-if="categoryStore.categories.length === 0" class="text-center py-8">
                    <p class="text-neutral-400">No categories yet</p>
                </div>

                <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div v-for="category in categoryStore.categories" :key="category.id"
                        class="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: category.color || '#3b82f6' }">
                        </div>
                        <span class="text-sm text-white">{{ category.name }}</span>
                    </div>
                </div>
            </div>

            <!-- Transactions Section -->
            <div class="glass-card">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-heading text-white">Recent Transactions</h2>
                    <button @click="showTransactionModal = true" class="btn-primary text-sm">
                        <span class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v16m8-8H4" />
                            </svg>
                            Add Transaction
                        </span>
                    </button>
                </div>

                <div v-if="transactionStore.transactions.length === 0" class="text-center py-8">
                    <p class="text-neutral-400">No transactions yet</p>
                </div>

                <div v-else class="space-y-2">
                    <div v-for="tx in transactionStore.transactions.slice(0, 10)" :key="tx.id"
                        class="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                                :class="tx.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'">
                                <svg class="w-5 h-5" :class="tx.type === 'income' ? 'text-green-400' : 'text-red-400'"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        :d="tx.type === 'income' ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-white font-medium">{{ tx.note || (tx.type === 'income'
                                    ? 'Income' : 'Expense') }}</p>
                                <p class="text-xs text-neutral-500">{{ formatDate(tx.occurred_at) }}</p>
                            </div>
                        </div>
                        <span class="font-mono text-lg"
                            :class="tx.type === 'income' ? 'text-green-400' : 'text-red-400'">
                            {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(parseFloat(tx.amount),
                                budget.currency) }}
                        </span>
                    </div>
                </div>
            </div>
        </template>

        <!-- Category Modal -->
        <Teleport to="body">
            <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showCategoryModal = false"></div>
                <div class="glass-card w-full max-w-md relative z-10">
                    <h2 class="text-xl font-heading text-white mb-6">Add Category</h2>
                    <form @submit.prevent="handleCreateCategory" class="space-y-5">
                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Name</label>
                            <input v-model="categoryForm.name" type="text" required class="input-field"
                                placeholder="Category name" />
                        </div>
                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Color</label>
                            <input v-model="categoryForm.color" type="color"
                                class="w-full h-10 rounded-lg cursor-pointer" />
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button type="button" @click="showCategoryModal = false"
                                class="btn-secondary flex-1">Cancel</button>
                            <button type="submit" class="btn-primary flex-1">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Transaction Modal -->
        <Teleport to="body">
            <div v-if="showTransactionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showTransactionModal = false"></div>
                <div class="glass-card w-full max-w-md relative z-10">
                    <h2 class="text-xl font-heading text-white mb-6">Add Transaction</h2>
                    <form @submit.prevent="handleCreateTransaction" class="space-y-5">
                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Type</label>
                            <div class="flex gap-2">
                                <button type="button" @click="txForm.type = 'income'"
                                    class="flex-1 py-2 rounded-lg border transition-colors"
                                    :class="txForm.type === 'income' ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-neutral-700 text-neutral-400'">
                                    Income
                                </button>
                                <button type="button" @click="txForm.type = 'expense'"
                                    class="flex-1 py-2 rounded-lg border transition-colors"
                                    :class="txForm.type === 'expense' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-neutral-700 text-neutral-400'">
                                    Expense
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Amount</label>
                            <input v-model.number="txForm.amount" type="number" step="0.01" min="0.01" required
                                class="input-field" placeholder="0.00" />
                        </div>
                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Note (optional)</label>
                            <input v-model="txForm.note" type="text" class="input-field"
                                placeholder="What was this for?" />
                        </div>
                        <div>
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Date</label>
                            <input v-model="txForm.occurredAt" type="datetime-local" required class="input-field" />
                        </div>
                        <div v-if="categoryStore.categories.length > 0">
                            <label class="block text-sm font-mono text-neutral-400 mb-2">Category</label>
                            <select v-model="txForm.categoryId" class="input-field">
                                <option value="">No category</option>
                                <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                                    {{ cat.name }}
                                </option>
                            </select>
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button type="button" @click="showTransactionModal = false"
                                class="btn-secondary flex-1">Cancel</button>
                            <button type="submit" class="btn-primary flex-1">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBudgetStore } from '@/stores/budgets'
import { useCategoryStore } from '@/stores/categories'
import { useTransactionStore } from '@/stores/transactions'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

const budgetId = computed(() => route.params.id as string)
const budget = computed(() => budgetStore.currentBudget)

const showCategoryModal = ref(false)
const showTransactionModal = ref(false)

const categoryForm = reactive({
    name: '',
    color: '#3b82f6'
})

const txForm = reactive({
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    note: '',
    occurredAt: new Date().toISOString().slice(0, 16),
    categoryId: ''
})

const formatCurrency = (amount: number, currency?: string) => {
    const currencyToUse = currency || budget.value?.currency || authStore.preferredCurrency
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currencyToUse,
    }).format(amount)
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const handleCreateCategory = async () => {
    await categoryStore.createCategory(categoryForm.name, budgetId.value, '', categoryForm.color)
    showCategoryModal.value = false
    categoryForm.name = ''
    categoryForm.color = '#3b82f6'
}

const handleCreateTransaction = async () => {
    await transactionStore.createTransaction(
        txForm.amount,
        txForm.type,
        budgetId.value,
        txForm.occurredAt,
        txForm.note || undefined,
        txForm.categoryId || undefined
    )
    showTransactionModal.value = false
    // Refresh budget to update balance
    await budgetStore.fetchBudget(budgetId.value)
    // Reset form
    txForm.amount = 0
    txForm.note = ''
    txForm.occurredAt = new Date().toISOString().slice(0, 16)
    txForm.categoryId = ''
}

onMounted(async () => {
    await Promise.all([
        budgetStore.fetchBudget(budgetId.value),
        categoryStore.fetchCategories(budgetId.value),
        transactionStore.fetchTransactions(budgetId.value)
    ])
})
</script>
