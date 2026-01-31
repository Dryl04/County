<template>
    <div class="min-h-screen bg-neutral-900 flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Background effects -->
        <div class="absolute inset-0 overflow-hidden">
            <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <!-- Browser Frame -->
        <div class="w-full max-w-6xl glass-card p-0 overflow-hidden relative z-10">
            <!-- Browser Header -->
            <div class="flex items-center gap-2 px-4 py-3 bg-neutral-950/50 border-b border-neutral-800">
                <div class="flex gap-1.5">
                    <span class="w-3 h-3 rounded-full bg-red-500"></span>
                    <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span class="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <div class="flex-1 mx-4">
                    <div
                        class="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 rounded-md text-xs text-neutral-400 font-mono max-w-xs mx-auto">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>county.app</span>
                    </div>
                </div>
            </div>

            <!-- Hero Content -->
            <div class="p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12">
                <!-- Left Content -->
                <div class="flex-1 text-center lg:text-left">
                    <!-- Animated Heading -->
                    <h1 class="text-4xl md:text-5xl font-heading text-white mb-6 perspective-1000">
                        <span v-for="(word, index) in titleWords" :key="index" class="word-animate inline-block mr-3"
                            :style="{ animationDelay: `${index * 150}ms` }">
                            {{ word }}
                        </span>
                    </h1>

                    <p class="text-lg md:text-xl text-neutral-400 mb-8 font-body leading-relaxed max-w-xl">
                        Take control of your finances with our intuitive budget management platform.
                        Track expenses, set goals, and achieve financial freedom.
                    </p>

                    <!-- CTA Buttons -->
                    <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <router-link to="/register" class="btn-primary text-base px-6 py-3 glow-animation">
                            Get Started Free
                        </router-link>
                        <router-link to="/login" class="btn-secondary text-base px-6 py-3">
                            Sign In
                        </router-link>
                    </div>

                    <!-- Features -->
                    <div class="mt-12 grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                        <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span class="text-sm text-neutral-300 font-mono">{{ feature.title }}</span>
                        </div>
                    </div>
                </div>

                <!-- Right Content - 3D Card -->
                <div class="flex-1 perspective-1000">
                    <div class="glass-card float-3d preserve-3d max-w-sm mx-auto">
                        <!-- Mock Dashboard Preview -->
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-neutral-400 font-mono">Total Balance</span>
                                <span
                                    class="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">+12.5%</span>
                            </div>
                            <p class="text-3xl font-heading text-white">$24,500.00</p>

                            <!-- Mini Chart -->
                            <div class="h-24 flex items-end gap-2">
                                <div v-for="(height, i) in chartBars" :key="i"
                                    class="flex-1 bg-blue-500/30 rounded-t transition-all duration-500"
                                    :style="{ height: `${height}%` }"></div>
                            </div>

                            <!-- Recent Transactions -->
                            <div class="space-y-2 pt-4 border-t border-neutral-800">
                                <div v-for="tx in mockTransactions" :key="tx.name"
                                    class="flex items-center justify-between py-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg" :class="tx.color"></div>
                                        <span class="text-sm text-neutral-300">{{ tx.name }}</span>
                                    </div>
                                    <span class="text-sm font-mono"
                                        :class="tx.amount > 0 ? 'text-green-400' : 'text-red-400'">
                                        {{ tx.amount > 0 ? '+' : '' }}${{ Math.abs(tx.amount) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const titleWords = ['Manage', 'Your', 'Budget', 'Smarter']

const features = [
    { title: 'Multi-Budget' },
    { title: 'Categories' },
    { title: 'Analytics' },
    { title: 'Secure' },
]

const chartBars = ref([30, 45, 35, 60, 55, 75, 65, 80])
const mockTransactions = [
    { name: 'Salary', amount: 5000, color: 'bg-green-500/30' },
    { name: 'Groceries', amount: -120, color: 'bg-orange-500/30' },
    { name: 'Netflix', amount: -15, color: 'bg-red-500/30' },
]

onMounted(() => {
    // Animate chart bars on load
    chartBars.value = [30, 45, 35, 60, 55, 75, 65, 80]
})
</script>
