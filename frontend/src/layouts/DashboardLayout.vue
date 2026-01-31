<template>
    <div class="min-h-screen bg-neutral-900 flex">
        <!-- Sidebar -->
        <aside class="w-64 glass-sidebar min-h-screen flex flex-col">
            <!-- Logo -->
            <div class="p-6 border-b border-neutral-800">
                <router-link to="/app" class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg glow-animation">
                        <span class="text-white font-heading text-xl">C</span>
                    </div>
                    <span class="text-xl font-heading text-white">County</span>
                </router-link>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 p-4 space-y-2">
                <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-link"
                    :class="{ 'active': isActive(item.path) }">
                    <component :is="item.icon" class="w-5 h-5" />
                    <span>{{ item.label }}</span>
                </router-link>
            </nav>

            <!-- User Section -->
            <div class="p-4 border-t border-neutral-800">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                        <UserIcon class="w-5 h-5 text-neutral-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white truncate">{{ authStore.userName }}</p>
                        <p class="text-xs text-neutral-500">{{ authStore.user?.email }}</p>
                    </div>
                </div>
                <button @click="handleLogout" class="btn-ghost w-full flex items-center justify-center gap-2">
                    <LogoutIcon class="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col">
            <!-- Browser Frame Header -->
            <div class="flex items-center gap-2 px-4 py-2 bg-neutral-950 border-b border-neutral-800">
                <div class="flex gap-1.5">
                    <span class="w-3 h-3 rounded-full bg-red-500"></span>
                    <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span class="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <div class="flex-1 mx-4">
                    <div
                        class="flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded-md text-xs text-neutral-400 font-mono max-w-md">
                        <LockIcon class="w-3 h-3" />
                        <span>county.app{{ $route.path }}</span>
                    </div>
                </div>
            </div>

            <!-- Page Content -->
            <div class="flex-1 overflow-auto p-6">
                <router-view />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Icon components
const HomeIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })]) }
const WalletIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' })]) }
const TagIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' })]) }
const ListIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' })]) }
const UserIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })]) }
const LogoutIcon = { render: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' })]) }
const LockIcon = { render: () => h('svg', { class: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' })]) }

const navItems = [
    { path: '/app', label: 'Dashboard', icon: HomeIcon },
    { path: '/app/budgets', label: 'Budgets', icon: WalletIcon },
    { path: '/app/categories', label: 'Categories', icon: TagIcon },
    { path: '/app/transactions', label: 'Transactions', icon: ListIcon },
    { path: '/app/profile', label: 'Profile', icon: UserIcon },
]

const isActive = (path: string) => {
    if (path === '/app') return route.path === '/app'
    return route.path.startsWith(path)
}

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}

onMounted(async () => {
    await authStore.fetchUser()
})
</script>
