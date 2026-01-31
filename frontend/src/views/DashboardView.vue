<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl md:text-4xl font-heading text-white mb-2">Dashboard</h1>
                <p class="text-neutral-400 font-body">Welcome back, {{ authStore.userName }}!</p>
            </div>
            <div class="flex items-center gap-3">
                <button @click="refreshData" :disabled="dashboardStore.isLoading"
                    class="btn-secondary flex items-center gap-2">
                    <svg class="w-4 h-4" :class="{ 'animate-spin': dashboardStore.isLoading }" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
                <router-link to="/app/budgets" class="btn-primary">
                    <span class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Budget
                    </span>
                </router-link>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="dashboardStore.isLoading && !hasData" class="flex items-center justify-center py-24">
            <div class="text-center">
                <svg class="animate-spin w-12 h-12 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                <p class="text-neutral-400">Loading dashboard data...</p>
            </div>
        </div>

        <template v-else>
            <!-- KPI Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="card-stat animate-fade-in-up">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-neutral-400 font-mono">Total Budgets</span>
                        <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                    <span class="text-2xl font-heading text-white">{{ dashboardStore.stats.totalBudgets }}</span>
                    <span class="text-xs text-neutral-500">{{ dashboardStore.stats.totalTransactions }}
                        transactions</span>
                </div>

                <div class="card-stat animate-fade-in-up animate-delay-100">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-neutral-400 font-mono">Total Balance</span>
                        <div class="w-8 h-8 rounded-lg"
                            :class="dashboardStore.stats.totalBalance >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'">
                            <div class="w-full h-full flex items-center justify-center">
                                <svg class="w-4 h-4"
                                    :class="dashboardStore.stats.totalBalance >= 0 ? 'text-green-400' : 'text-red-400'"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <span class="text-2xl font-heading"
                        :class="dashboardStore.stats.totalBalance >= 0 ? 'text-green-400' : 'text-red-400'">
                        {{ formatCurrency(dashboardStore.stats.totalBalance) }}
                    </span>
                    <span class="text-xs text-neutral-500">Net balance</span>
                </div>

                <div class="card-stat animate-fade-in-up animate-delay-200">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-neutral-400 font-mono">Total Income</span>
                        <div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                        </div>
                    </div>
                    <span class="text-2xl font-heading text-green-400">{{
                        formatCurrency(dashboardStore.stats.totalIncome) }}</span>
                    <span class="text-xs text-neutral-500">All time income</span>
                </div>

                <div class="card-stat animate-fade-in-up animate-delay-300">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-neutral-400 font-mono">Total Expenses</span>
                        <div class="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                        </div>
                    </div>
                    <span class="text-2xl font-heading text-red-400">{{
                        formatCurrency(dashboardStore.stats.totalExpenses) }}</span>
                    <span class="text-xs text-neutral-500">All time expenses</span>
                </div>
            </div>

            <!-- Secondary KPIs -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="glass-card">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-neutral-400 font-mono">Savings Rate</p>
                            <p class="text-xl font-heading text-white">{{ dashboardStore.stats.savingsRate.toFixed(1)
                            }}%</p>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-neutral-400 font-mono">Avg Transaction</p>
                            <p class="text-xl font-heading text-white">{{
                                formatCurrency(dashboardStore.stats.averageTransactionAmount) }}</p>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                            <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-neutral-400 font-mono">Budget Amount</p>
                            <p class="text-xl font-heading text-white">{{
                                formatCurrency(dashboardStore.stats.totalBudgetAmount) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Income vs Expenses Chart -->
                <div class="glass-card">
                    <h3 class="text-lg font-heading text-white mb-4">Income vs Expenses</h3>
                    <div v-if="hasMonthlyData" class="h-64">
                        <Bar :data="incomeExpensesChartData" :options="barChartOptions" />
                    </div>
                    <div v-else class="h-64 flex items-center justify-center">
                        <p class="text-neutral-500">No transaction data yet</p>
                    </div>
                </div>

                <!-- Expenses by Category Chart -->
                <div class="glass-card">
                    <h3 class="text-lg font-heading text-white mb-4">Expenses by Category</h3>
                    <div v-if="hasCategoryData" class="h-64 flex items-center justify-center">
                        <div class="w-48 h-48">
                            <Doughnut :data="categoryChartData" :options="doughnutChartOptions" />
                        </div>
                    </div>
                    <div v-else class="h-64 flex items-center justify-center">
                        <p class="text-neutral-500">No expense data yet</p>
                    </div>
                </div>
            </div>

            <!-- Balance Trend Chart -->
            <div class="glass-card">
                <h3 class="text-lg font-heading text-white mb-4">Balance Trend</h3>
                <div v-if="hasMonthlyData" class="h-64">
                    <Line :data="balanceTrendChartData" :options="lineChartOptions" />
                </div>
                <div v-else class="h-64 flex items-center justify-center">
                    <p class="text-neutral-500">No transaction data yet</p>
                </div>
            </div>

            <!-- Budget Utilization -->
            <div class="glass-card">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-heading text-white">Budget Utilization</h2>
                    <router-link to="/app/budgets" class="text-blue-400 hover:text-blue-300 text-sm font-mono">
                        View all →
                    </router-link>
                </div>

                <div v-if="dashboardStore.budgetUtilization.length === 0" class="text-center py-12">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                        <svg class="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-heading text-white mb-2">No budgets yet</h3>
                    <p class="text-neutral-400 mb-4">Create your first budget to start tracking</p>
                    <router-link to="/app/budgets" class="btn-primary inline-block">
                        Create Budget
                    </router-link>
                </div>

                <div v-else class="space-y-4">
                    <div v-for="budget in dashboardStore.budgetUtilization" :key="budget.id"
                        class="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                        <div class="flex items-center justify-between mb-2">
                            <router-link :to="`/app/budgets/${budget.id}`"
                                class="font-heading text-white hover:text-blue-400 transition-colors">
                                {{ budget.name }}
                            </router-link>
                            <span class="text-sm font-mono"
                                :class="budget.isOverBudget ? 'text-red-400' : 'text-green-400'">
                                {{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.budgetAmount) }}
                            </span>
                        </div>
                        <div class="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                            <div class="h-full transition-all duration-500"
                                :class="budget.isOverBudget ? 'bg-red-500' : budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'"
                                :style="{ width: `${Math.min(budget.percentage, 100)}%` }">
                            </div>
                        </div>
                        <div class="flex items-center justify-between mt-2 text-xs text-neutral-500">
                            <span>{{ budget.percentage.toFixed(1) }}% used</span>
                            <span :class="budget.isOverBudget ? 'text-red-400' : ''">
                                {{ budget.isOverBudget ? 'Over budget by ' + formatCurrency(Math.abs(budget.remaining))
                                    : formatCurrency(budget.remaining) + ' remaining' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="glass-card">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-heading text-white">Recent Transactions</h2>
                    <router-link to="/app/transactions" class="text-blue-400 hover:text-blue-300 text-sm font-mono">
                        View all →
                    </router-link>
                </div>

                <div v-if="dashboardStore.recentTransactions.length === 0" class="text-center py-8">
                    <p class="text-neutral-500">No transactions yet</p>
                </div>

                <div v-else class="space-y-2">
                    <div v-for="transaction in dashboardStore.recentTransactions" :key="transaction.id"
                        class="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                                :class="transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'">
                                <svg class="w-4 h-4"
                                    :class="transaction.type === 'income' ? 'text-green-400' : 'text-red-400'"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        :d="transaction.type === 'income' ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm text-white">{{ transaction.note || 'Transaction' }}</p>
                                <p class="text-xs text-neutral-500">{{ formatDate(transaction.occurred_at) }}</p>
                            </div>
                        </div>
                        <span class="font-mono"
                            :class="transaction.type === 'income' ? 'text-green-400' : 'text-red-400'">
                            {{ transaction.type === 'income' ? '+' : '-' }}{{
                                formatCurrency(parseFloat(transaction.amount), transaction.currency) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <router-link to="/app/transactions" class="glass-card hover:border-blue-500/50 transition-colors group">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-heading text-white">Add Transaction</h3>
                            <p class="text-sm text-neutral-400">Record income or expense</p>
                        </div>
                    </div>
                </router-link>

                <router-link to="/app/categories" class="glass-card hover:border-blue-500/50 transition-colors group">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-heading text-white">Manage Categories</h3>
                            <p class="text-sm text-neutral-400">Organize your spending</p>
                        </div>
                    </div>
                </router-link>

                <router-link to="/app/profile" class="glass-card hover:border-blue-500/50 transition-colors group">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-heading text-white">Your Profile</h3>
                            <p class="text-sm text-neutral-400">Account settings</p>
                        </div>
                    </div>
                </router-link>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const hasData = computed(() => dashboardStore.budgets.length > 0 || dashboardStore.lastUpdated !== null)
const hasMonthlyData = computed(() => dashboardStore.monthlyData.length > 0)
const hasCategoryData = computed(() => dashboardStore.expensesByCategory.length > 0)

// Chart Data
const incomeExpensesChartData = computed(() => ({
    labels: dashboardStore.monthlyData.map(d => `${d.month} ${d.year}`),
    datasets: [
        {
            label: 'Income',
            data: dashboardStore.monthlyData.map(d => d.income),
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1,
            borderRadius: 4,
        },
        {
            label: 'Expenses',
            data: dashboardStore.monthlyData.map(d => d.expenses),
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1,
            borderRadius: 4,
        },
    ],
}))

const balanceTrendChartData = computed(() => ({
    labels: dashboardStore.monthlyData.map(d => `${d.month} ${d.year}`),
    datasets: [
        {
            label: 'Balance',
            data: dashboardStore.monthlyData.map(d => d.balance),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointRadius: 4,
        },
    ],
}))

const categoryColors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(234, 179, 8, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(20, 184, 166, 0.8)',
    'rgba(99, 102, 241, 0.8)',
]

const categoryChartData = computed(() => ({
    labels: dashboardStore.expensesByCategory.slice(0, 8).map(c => c.categoryName),
    datasets: [
        {
            data: dashboardStore.expensesByCategory.slice(0, 8).map(c => c.total),
            backgroundColor: categoryColors,
            borderColor: 'rgba(23, 23, 23, 1)',
            borderWidth: 2,
        },
    ],
}))

// Chart Options
const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                color: '#a3a3a3',
                font: { family: 'Space Mono' },
            },
        },
    },
    scales: {
        x: {
            ticks: { color: '#a3a3a3' },
            grid: { color: 'rgba(163, 163, 163, 0.1)' },
        },
        y: {
            ticks: { color: '#a3a3a3' },
            grid: { color: 'rgba(163, 163, 163, 0.1)' },
        },
    },
}

const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
    },
    scales: {
        x: {
            ticks: { color: '#a3a3a3' },
            grid: { color: 'rgba(163, 163, 163, 0.1)' },
        },
        y: {
            ticks: { color: '#a3a3a3' },
            grid: { color: 'rgba(163, 163, 163, 0.1)' },
        },
    },
}

const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right' as const,
            labels: {
                color: '#a3a3a3',
                font: { family: 'Space Mono', size: 10 },
                boxWidth: 12,
            },
        },
    },
    cutout: '60%',
}

// Helpers
const formatCurrency = (amount: number, currency?: string) => {
    const currencyToUse = currency || authStore.preferredCurrency
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currencyToUse,
    }).format(amount)
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

const refreshData = async () => {
    await dashboardStore.fetchDashboardData()
}

onMounted(async () => {
    await dashboardStore.fetchDashboardData()
})
</script>
