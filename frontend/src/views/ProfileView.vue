<template>
    <div class="space-y-6 max-w-2xl">
        <!-- Header -->
        <div>
            <h1 class="text-3xl md:text-4xl font-heading text-white mb-2">Profile</h1>
            <p class="text-neutral-400 font-body">Manage your account settings</p>
        </div>

        <!-- Profile Card -->
        <div class="glass-card">
            <div class="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-800">
                <div
                    class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span class="text-2xl font-heading text-white">
                        {{ authStore.user?.full_name?.charAt(0).toUpperCase() || 'U' }}
                    </span>
                </div>
                <div>
                    <h2 class="text-xl font-heading text-white">{{ authStore.user?.full_name }}</h2>
                    <p class="text-neutral-400 text-sm">{{ authStore.user?.email }}</p>
                    <span class="inline-block mt-1 px-2 py-0.5 text-xs font-mono bg-blue-500/20 text-blue-400 rounded">
                        {{ authStore.user?.role }}
                    </span>
                </div>
            </div>

            <!-- Update Form -->
            <form @submit.prevent="handleUpdate" class="space-y-5">
                <div>
                    <label class="block text-sm font-mono text-neutral-400 mb-2">Full Name</label>
                    <input v-model="form.fullName" type="text" required class="input-field" />
                </div>

                <div>
                    <label class="block text-sm font-mono text-neutral-400 mb-2">Email</label>
                    <input v-model="form.email" type="email" required class="input-field" />
                </div>

                <div>
                    <label class="block text-sm font-mono text-neutral-400 mb-2">Preferred Currency</label>
                    <select v-model="form.preferredCurrency" class="input-field">
                        <option value="EUR">EUR - Euro</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="XOF">XOF - CFA Franc</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="CHF">CHF - Swiss Franc</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CNY">CNY - Chinese Yuan</option>
                    </select>
                    <p class="text-xs text-neutral-500 mt-2">This currency will be used by default for new budgets and
                        transactions</p>
                </div>

                <div>
                    <label class="block text-sm font-mono text-neutral-400 mb-2">New Password (optional)</label>
                    <input v-model="form.password" type="password" class="input-field"
                        placeholder="Leave blank to keep current" minlength="8" />
                </div>

                <!-- Success Message -->
                <div v-if="updateSuccess" class="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p class="text-green-400 text-sm">Profile updated successfully!</p>
                </div>

                <!-- Error Message -->
                <div v-if="updateError" class="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p class="text-red-400 text-sm">{{ updateError }}</p>
                </div>

                <button type="submit" :disabled="isUpdating" class="btn-primary">
                    {{ isUpdating ? 'Updating...' : 'Update Profile' }}
                </button>
            </form>
        </div>

        <!-- Account Stats -->
        <div class="glass-card">
            <h3 class="text-lg font-heading text-white mb-4">Account Information</h3>
            <div class="space-y-3">
                <div class="flex justify-between py-2 border-b border-neutral-800">
                    <span class="text-neutral-400 text-sm">Member since</span>
                    <span class="text-white font-mono text-sm">{{ formatDate(authStore.user?.created_at) }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-neutral-800">
                    <span class="text-neutral-400 text-sm">Total Budgets</span>
                    <span class="text-white font-mono text-sm">{{ budgetStore.budgets.length }}</span>
                </div>
                <div class="flex justify-between py-2">
                    <span class="text-neutral-400 text-sm">Account ID</span>
                    <span class="text-neutral-500 font-mono text-xs">{{ authStore.user?.id }}</span>
                </div>
            </div>
        </div>

        <!-- Danger Zone -->
        <div class="glass-card border-red-500/30">
            <h3 class="text-lg font-heading text-red-400 mb-4">Danger Zone</h3>
            <p class="text-neutral-400 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
            </p>
            <button @click="showDeleteModal = true" class="btn-danger">
                Delete Account
            </button>
        </div>

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
                    <h3 class="text-lg font-heading text-white mb-2">Delete Account?</h3>
                    <p class="text-neutral-400 text-sm mb-6">
                        This will permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <div class="flex gap-3">
                        <button @click="showDeleteModal = false" class="btn-secondary flex-1">Cancel</button>
                        <button @click="handleDeleteAccount" :disabled="isDeleting" class="btn-danger flex-1">
                            {{ isDeleting ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBudgetStore } from '@/stores/budgets'
import { authService } from '@/services/auth'

const router = useRouter()
const authStore = useAuthStore()
const budgetStore = useBudgetStore()

const showDeleteModal = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const updateSuccess = ref(false)
const updateError = ref('')

const form = reactive({
    fullName: '',
    email: '',
    preferredCurrency: 'EUR',
    password: ''
})

const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const handleUpdate = async () => {
    isUpdating.value = true
    updateSuccess.value = false
    updateError.value = ''

    try {
        const updateData: { full_name: string; email: string; preferred_currency: string; password?: string } = {
            full_name: form.fullName,
            email: form.email,
            preferred_currency: form.preferredCurrency
        }
        if (form.password) {
            updateData.password = form.password
        }

        await authService.updateProfile(updateData)
        await authStore.fetchUser()
        updateSuccess.value = true
        form.password = ''
    } catch (e: unknown) {
        const error = e as { response?: { data?: { detail?: string } } }
        updateError.value = error.response?.data?.detail || 'Failed to update profile'
    } finally {
        isUpdating.value = false
    }
}

const handleDeleteAccount = async () => {
    isDeleting.value = true
    try {
        await authService.deleteAccount()
        authStore.logout()
        router.push('/')
    } catch (e: unknown) {
        console.error('Failed to delete account:', e)
    } finally {
        isDeleting.value = false
    }
}

onMounted(async () => {
    await authStore.fetchUser()
    await budgetStore.fetchBudgets()

    if (authStore.user) {
        form.fullName = authStore.user.full_name
        form.email = authStore.user.email
        form.preferredCurrency = authStore.user.preferred_currency || 'EUR'
    }
})
</script>
