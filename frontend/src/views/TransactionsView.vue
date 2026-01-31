<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl md:text-4xl font-heading text-white mb-2">Transactions</h1>
        <p class="text-neutral-400 font-body">Track your income and expenses</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label class="block text-sm font-mono text-neutral-400 mb-2">Budget</label>
          <select v-model="selectedBudgetId" class="input-field" @change="loadData">
            <option value="">Choose a budget</option>
            <option v-for="budget in budgetStore.budgets" :key="budget.id" :value="budget.id">
              {{ budget.name }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="showCreateModal = true" class="btn-primary w-full md:w-auto" :disabled="!selectedBudgetId">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Transaction
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- No Budget Selected -->
    <div v-if="!selectedBudgetId" class="glass-card text-center py-12">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
        <svg class="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <p class="text-neutral-400">Select a budget to view transactions</p>
    </div>

    <!-- Transactions Content -->
    <template v-else>
      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card-stat">
          <span class="text-sm text-neutral-400 font-mono">Total Transactions</span>
          <span class="text-2xl font-heading text-white">{{ transactionStore.totalItems }}</span>
        </div>
        <div class="card-stat">
          <span class="text-sm text-neutral-400 font-mono">Income</span>
          <span class="text-2xl font-heading text-green-400">{{ formatCurrency(transactionStore.totalIncome)
          }}</span>
        </div>
        <div class="card-stat">
          <span class="text-sm text-neutral-400 font-mono">Expenses</span>
          <span class="text-2xl font-heading text-red-400">{{ formatCurrency(transactionStore.totalExpenses)
          }}</span>
        </div>
        <div class="card-stat">
          <span class="text-sm text-neutral-400 font-mono">Balance</span>
          <span class="text-2xl font-heading"
            :class="transactionStore.balance >= 0 ? 'text-green-400' : 'text-red-400'">
            {{ formatCurrency(transactionStore.balance) }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="transactionStore.isLoading" class="flex items-center justify-center py-12">
        <svg class="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
      </div>

      <!-- Empty State -->
      <div v-else-if="transactionStore.transactions.length === 0" class="glass-card text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
          <svg class="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-lg font-heading text-white mb-2">No transactions yet</h3>
        <p class="text-neutral-400 mb-4">Start tracking your income and expenses</p>
        <button @click="showCreateModal = true" class="btn-primary">
          Add First Transaction
        </button>
      </div>

      <!-- Transactions List -->
      <div v-else class="glass-card p-0 overflow-hidden">
        <div class="divide-y divide-neutral-800">
          <div v-for="tx in transactionStore.transactions" :key="tx.id"
            class="flex items-center justify-between p-4 hover:bg-neutral-800/30 transition-colors group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="tx.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'">
                <svg class="w-6 h-6" :class="tx.type === 'income' ? 'text-green-400' : 'text-red-400'" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    :d="tx.type === 'income' ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'" />
                </svg>
              </div>
              <div>
                <p class="text-white font-medium">{{ tx.note || (tx.type === 'income'
                  ? 'Income' : 'Expense') }}</p>
                <p class="text-xs text-neutral-500 font-mono">{{ formatDate(tx.occurred_at) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-mono text-lg" :class="tx.type === 'income' ? 'text-green-400' : 'text-red-400'">
                {{ tx.type === 'income' ? '+' : '-' }}{{
                  formatCurrency(parseFloat(tx.amount)) }}
              </span>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="editTransaction(tx)" class="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                  <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="confirmDelete(tx)" class="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                  <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="transactionStore.totalPages > 1"
          class="flex items-center justify-between p-4 border-t border-neutral-800">
          <p class="text-sm text-neutral-400 font-mono">
            Page {{ transactionStore.currentPage }} of {{ transactionStore.totalPages }}
          </p>
          <div class="flex gap-2">
            <button @click="goToPage(transactionStore.currentPage - 1)" :disabled="transactionStore.currentPage === 1"
              class="btn-secondary text-sm">
              Previous
            </button>
            <button @click="goToPage(transactionStore.currentPage + 1)"
              :disabled="transactionStore.currentPage === transactionStore.totalPages" class="btn-secondary text-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals"></div>
        <div class="glass-card w-full max-w-md relative z-10">
          <h2 class="text-xl font-heading text-white mb-6">
            {{ showEditModal ? 'Edit Transaction' : 'Add Transaction' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label class="block text-sm font-mono text-neutral-400 mb-2">Type</label>
              <div class="flex gap-2">
                <button type="button" @click="form.type = 'income'"
                  class="flex-1 py-3 rounded-lg border transition-colors font-mono"
                  :class="form.type === 'income' ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-neutral-700 text-neutral-400'">
                  Income
                </button>
                <button type="button" @click="form.type = 'expense'"
                  class="flex-1 py-3 rounded-lg border transition-colors font-mono"
                  :class="form.type === 'expense' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-neutral-700 text-neutral-400'">
                  Expense
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-mono text-neutral-400 mb-2">Amount</label>
              <input v-model.number="form.amount" type="number" step="0.01" min="0.01" required class="input-field"
                placeholder="0.00" />
            </div>

            <div>
              <label class="block text-sm font-mono text-neutral-400 mb-2">Note (optional)</label>
              <input v-model="form.note" type="text" class="input-field" placeholder="What was this for?" />
            </div>

            <div>
              <label class="block text-sm font-mono text-neutral-400 mb-2">Date</label>
              <input v-model="form.occurredAt" type="datetime-local" required class="input-field" />
            </div>

            <div v-if="categoryStore.categories.length > 0">
              <label class="block text-sm font-mono text-neutral-400 mb-2">Category</label>
              <select v-model="form.categoryId" class="input-field">
                <option value="">No category</option>
                <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="button" @click="closeModals" class="btn-secondary flex-1">Cancel</button>
              <button type="submit" :disabled="transactionStore.isLoading" class="btn-primary flex-1">
                {{ transactionStore.isLoading ? 'Saving...' : (showEditModal ? 'Update' : 'Create') }}
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
          <h3 class="text-lg font-heading text-white mb-2">Delete Transaction?</h3>
          <p class="text-neutral-400 text-sm mb-6">
            This action cannot be undone.
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
import { useTransactionStore } from '@/stores/transactions'
import { useAuthStore } from '@/stores/auth'
import type { Transaction } from '@/services/transactions'

const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

const selectedBudgetId = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const transactionToDelete = ref<Transaction | null>(null)

const form = reactive({
  type: 'expense' as 'income' | 'expense',
  amount: 0,
  note: '',
  occurredAt: new Date().toISOString().slice(0, 16),
  categoryId: ''
})

const formatCurrency = (amount: number) => {
  const budget = budgetStore.budgets.find((b: { id: string }) => b.id === selectedBudgetId.value)
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: budget?.currency || authStore.preferredCurrency,
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

const loadData = async () => {
  if (selectedBudgetId.value) {
    await Promise.all([
      transactionStore.fetchTransactions(selectedBudgetId.value),
      categoryStore.fetchCategories(selectedBudgetId.value)
    ])
  }
}

const goToPage = (page: number) => {
  if (selectedBudgetId.value) {
    transactionStore.fetchTransactions(selectedBudgetId.value, page)
  }
}

const resetForm = () => {
  form.type = 'expense'
  form.amount = 0
  form.note = ''
  form.occurredAt = new Date().toISOString().slice(0, 16)
  form.categoryId = ''
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTransaction.value = null
  resetForm()
}

const editTransaction = (tx: Transaction) => {
  editingTransaction.value = tx
  form.type = tx.type
  form.amount = parseFloat(tx.amount)
  form.note = tx.note || ''
  form.occurredAt = tx.occurred_at.slice(0, 16)
  form.categoryId = tx.category_id || ''
  showEditModal.value = true
}

const confirmDelete = (tx: Transaction) => {
  transactionToDelete.value = tx
  showDeleteModal.value = true
}

const handleSubmit = async () => {
  if (showEditModal.value && editingTransaction.value) {
    await transactionStore.updateTransaction(
      editingTransaction.value.id,
      form.amount,
      form.type,
      form.occurredAt,
      form.note || undefined,
      form.categoryId || undefined
    )
  } else {
    await transactionStore.createTransaction(
      form.amount,
      form.type,
      selectedBudgetId.value,
      form.occurredAt,
      form.note || undefined,
      form.categoryId || undefined
    )
  }
  closeModals()
}

const handleDelete = async () => {
  if (transactionToDelete.value) {
    await transactionStore.deleteTransaction(transactionToDelete.value.id)
    showDeleteModal.value = false
    transactionToDelete.value = null
  }
}

onMounted(async () => {
  await budgetStore.fetchBudgets()
  const firstBudget = budgetStore.budgets[0]
  if (firstBudget) {
    selectedBudgetId.value = firstBudget.id
    loadData()
  }
})
</script>
